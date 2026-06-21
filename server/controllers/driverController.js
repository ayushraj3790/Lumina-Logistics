import Shipment from '../models/Shipment.js';
import User from '../models/User.js';
import { assignBestDriver } from '../services/aiService.js';

export const getAssignedDeliveries = async (req, res) => {
  const { status } = req.query;
  const filter = { driver: req.user._id };
  if (status) filter.status = status;
  else filter.status = { $nin: ['delivered', 'cancelled'] };
  const shipments = await Shipment.find(filter).populate('customer', 'name phone').sort('-assignedAt');
  res.json({ success: true, shipments });
};

export const acceptDelivery = async (req, res) => {
  const shipment = await Shipment.findOneAndUpdate(
    { _id: req.params.id, driver: req.user._id },
    { assignedAt: new Date() },
    { new: true }
  );
  if (!shipment) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, shipment });
};

export const updateLocation = async (req, res) => {
  const { lat, lng } = req.body;
  req.user.driverProfile = req.user.driverProfile || {};
  req.user.driverProfile.currentLocation = { lat, lng, updatedAt: new Date() };
  await req.user.save();

  const io = req.app.get('io');
  const activeShipments = await Shipment.find({ driver: req.user._id, status: { $in: ['in_transit', 'out_for_delivery'] } });
  activeShipments.forEach((s) => {
    s.currentLocation = { lat, lng, address: 'Live driver location' };
    s.save();
    io?.to(`shipment:${s._id}`).emit('driver:location', { lat, lng, shipmentId: s._id });
  });

  res.json({ success: true, location: req.user.driverProfile.currentLocation });
};

export const getDriverStats = async (req, res) => {
  const driverId = req.user._id;
  const [completed, delayed, shipments] = await Promise.all([
    Shipment.countDocuments({ driver: driverId, status: 'delivered' }),
    Shipment.countDocuments({ driver: driverId, isDelayed: true }),
    Shipment.find({ driver: driverId, status: 'delivered' }).select('estimatedCost deliveredAt'),
  ]);
  const earnings = shipments.reduce((sum, s) => sum + (s.estimatedCost * 0.15), 0);
  res.json({
    success: true,
    stats: {
      completed,
      delayed,
      rating: req.user.driverProfile?.rating || 5,
      earnings: Math.round(earnings),
      totalDeliveries: req.user.driverProfile?.totalDeliveries || completed,
    },
  });
};

export const getAvailableDrivers = async (req, res) => {
  const drivers = await User.find({
    role: 'driver',
    isActive: true,
    'driverProfile.isAvailable': true,
  }).select('name email phone driverProfile');
  res.json({ success: true, drivers });
};

/**
 * Intelligent Driver Assignment
 * Automatically assigns the best available driver to a shipment
 */
export const assignBestDriverToShipment = async (req, res) => {
  const { shipmentId } = req.params;
  
  try {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (shipment.driver) {
      return res.status(400).json({ success: false, message: 'Shipment already has a driver assigned' });
    }

    // Get available drivers
    const availableDrivers = await User.find({
      role: 'driver',
      isActive: true,
      'driverProfile.isAvailable': true,
    }).select('name email phone driverProfile');

    if (!availableDrivers || availableDrivers.length === 0) {
      return res.status(404).json({ success: false, message: 'No available drivers found' });
    }

    // Calculate current workload for each driver
    const driversWithWorkload = await Promise.all(
      availableDrivers.map(async (driver) => {
        const activeShipments = await Shipment.countDocuments({
          driver: driver._id,
          status: { $in: ['picked_up', 'in_transit', 'out_for_delivery'] },
        });
        driver.driverProfile = driver.driverProfile || {};
        driver.driverProfile.currentWorkload = activeShipments;
        return driver;
      })
    );

    // Use AI to assign best driver
    const bestDriver = await assignBestDriver(driversWithWorkload, shipment.sender?.location);

    if (!bestDriver) {
      return res.status(404).json({ success: false, message: 'Could not assign a driver' });
    }

    // Assign the driver to the shipment
    shipment.driver = bestDriver._id;
    shipment.assignedAt = new Date();
    await shipment.save();

    // Update driver's total deliveries
    bestDriver.driverProfile = bestDriver.driverProfile || {};
    bestDriver.driverProfile.totalDeliveries = (bestDriver.driverProfile.totalDeliveries || 0) + 1;
    await bestDriver.save();

    const populatedShipment = await Shipment.findById(shipment._id).populate('driver', 'name email phone driverProfile');

    res.json({
      success: true,
      shipment: populatedShipment,
      message: `Successfully assigned driver ${bestDriver.name} to shipment ${shipment.trackingId}`,
    });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ success: false, message: 'Error assigning driver', error: error.message });
  }
};
