import Shipment from '../models/Shipment.js';
import Warehouse from '../models/Warehouse.js';

export const getWarehouseStats = async (req, res) => {
  const warehouse = await Warehouse.findById(req.user.warehouseId);
  const inWarehouse = await Shipment.countDocuments({ warehouse: req.user.warehouseId, status: 'in_warehouse' });
  const incoming = await Shipment.countDocuments({
    warehouse: req.user.warehouseId,
    status: { $in: ['picked_up', 'in_transit'] },
  });
  res.json({
    success: true,
    warehouse,
    stats: { inWarehouse, incoming, capacity: warehouse?.capacity, current: warehouse?.currentInventory },
  });
};

export const scanPackage = async (req, res) => {
  const shipment = await Shipment.findOne({ trackingId: req.body.trackingId });
  if (!shipment) return res.status(404).json({ success: false, message: 'Package not found' });
  shipment.warehouse = req.user.warehouseId;
  shipment.status = 'in_warehouse';
  shipment.timeline.push({
    status: 'in_warehouse',
    message: `Scanned at warehouse`,
    location: req.body.location || 'Warehouse',
    timestamp: new Date(),
  });
  shipment.lastActivityAt = new Date();
  await shipment.save();
  await Warehouse.findByIdAndUpdate(req.user.warehouseId, { $inc: { currentInventory: 1 } });
  res.json({ success: true, shipment });
};

export const updateStorageStatus = async (req, res) => {
  const shipment = await Shipment.findOne({ trackingId: req.params.trackingId, warehouse: req.user.warehouseId });
  if (!shipment) return res.status(404).json({ success: false, message: 'Not found' });
  if (req.body.status) {
    shipment.status = req.body.status;
    shipment.timeline.push({ status: req.body.status, message: req.body.notes || 'Status updated', timestamp: new Date() });
  }
  await shipment.save();
  res.json({ success: true, shipment });
};

export const getInventory = async (req, res) => {
  const shipments = await Shipment.find({ warehouse: req.user.warehouseId, status: 'in_warehouse' })
    .populate('customer', 'name')
    .sort('-updatedAt');
  res.json({ success: true, shipments });
};
