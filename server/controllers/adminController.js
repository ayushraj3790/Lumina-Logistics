import User from '../models/User.js';
import Shipment from '../models/Shipment.js';
import Warehouse from '../models/Warehouse.js';
import Payment from '../models/Payment.js';
import { generateAnalyticsInsights } from '../services/aiService.js';

export const getUsers = async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').skip(skip).limit(Number(limit)).sort('-createdAt'),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, total });
};

export const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, user });
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'User deactivated' });
};

export const getDashboardStats = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [
    totalUsers,
    totalShipments,
    activeShipments,
    delivered,
    delayed,
    revenue,
    deliveriesToday,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Shipment.countDocuments(),
    Shipment.countDocuments({ status: { $nin: ['delivered', 'cancelled'] } }),
    Shipment.countDocuments({ status: 'delivered' }),
    Shipment.countDocuments({ isDelayed: true }),
    Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Shipment.countDocuments({ createdAt: { $gte: today } }),
  ]);

  const last7Days = await Shipment.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const topDriver = await Shipment.aggregate([
    { $match: { status: 'delivered', driver: { $exists: true } } },
    { $group: { _id: '$driver', deliveries: { $sum: 1 } } },
    { $sort: { deliveries: -1 } },
    { $limit: 1 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'driver' } },
    { $unwind: '$driver' },
  ]);

  const successRate = totalShipments ? Math.round((delivered / totalShipments) * 100) : 0;
  const delayRate = totalShipments ? Math.round((delayed / totalShipments) * 100) : 0;
  const rev = revenue[0]?.total || 0;

  const insights = generateAnalyticsInsights({
    peakHour: 14,
    topDriver: topDriver[0] ? { name: topDriver[0].driver.name, deliveries: topDriver[0].deliveries } : null,
    delayRate,
    successRate,
    revenue: rev,
  });

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalShipments,
      activeShipments,
      delivered,
      delayed,
      revenue: rev,
      deliveriesToday,
      successRate,
      delayRate,
      chartData: last7Days,
      insights,
    },
  });
};

export const manageWarehouses = async (req, res) => {
  if (req.method === 'GET' || !req.body?.name) {
    const warehouses = await Warehouse.find().populate('manager', 'name email');
    return res.json({ success: true, warehouses });
  }
};

export const createWarehouse = async (req, res) => {
  const warehouse = await Warehouse.create(req.body);
  res.status(201).json({ success: true, warehouse });
};
