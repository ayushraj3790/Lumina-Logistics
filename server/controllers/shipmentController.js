import QRCode from 'qrcode';
import Shipment from '../models/Shipment.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import DeliveryHistory from '../models/DeliveryHistory.js';
import User from '../models/User.js';
import { generateTrackingId } from '../utils/trackingId.js';
import { calculateShipmentCost } from '../utils/costCalculator.js';
import { predictETA, detectDelay, suggestRoutes, assignBestDriver } from '../services/aiService.js';
import { geocodeShipmentLocations } from '../utils/geocode.js';

const statusMessages = {
  pending: 'Shipment created and awaiting pickup',
  picked_up: 'Package picked up from sender',
  in_warehouse: 'Package arrived at warehouse',
  in_transit: 'Package in transit to destination hub',
  out_for_delivery: 'Out for delivery',
  delivered: 'Package delivered successfully',
  delayed: 'Delivery delayed',
};

const addTimeline = (shipment, status, message, location = '') => {
  shipment.timeline.push({ status, message: message || statusMessages[status], location, timestamp: new Date() });
  shipment.status = status;
  shipment.lastActivityAt = new Date();
};

export const createShipment = async (req, res) => {
  let trackingId = generateTrackingId();
  while (await Shipment.findOne({ trackingId })) trackingId = generateTrackingId();

  const estimatedCost = calculateShipmentCost({
    weight: req.body.package?.weight || 1,
    deliverySpeed: req.body.deliverySpeed || 'standard',
  });

  // Geocode sender and receiver locations if coordinates are missing
  console.log('[createShipment] Checking location coordinates...');
  const geocodedLocations = await geocodeShipmentLocations(
    req.body.sender?.location,
    req.body.receiver?.location
  );

  // Merge geocoded coordinates with request data (only if geocoding succeeded)
  const shipmentData = {
    ...req.body,
    trackingId,
    customer: req.user._id,
    estimatedCost,
    timeline: [{ status: 'pending', message: statusMessages.pending, timestamp: new Date() }],
  };

  // Update sender location with geocoded coordinates if available
  if (geocodedLocations.sender && !shipmentData.sender.location.lat) {
    shipmentData.sender.location = {
      ...shipmentData.sender.location,
      lat: geocodedLocations.sender.lat,
      lng: geocodedLocations.sender.lng,
    };
    console.log('[createShipment] Updated sender coordinates:', geocodedLocations.sender);
  }

  // Update receiver location with geocoded coordinates if available
  if (geocodedLocations.receiver && !shipmentData.receiver.location.lat) {
    shipmentData.receiver.location = {
      ...shipmentData.receiver.location,
      lat: geocodedLocations.receiver.lat,
      lng: geocodedLocations.receiver.lng,
    };
    console.log('[createShipment] Updated receiver coordinates:', geocodedLocations.receiver);
  }

  const shipment = await Shipment.create(shipmentData);
  shipment.eta = await predictETA(shipment);
  shipment.routeSuggestions = suggestRoutes(shipment.sender?.location, shipment.receiver?.location);
  shipment.qrCode = await QRCode.toDataURL(`${process.env.CLIENT_URL}/track/${trackingId}`);

  // Auto-assign best driver if available
  console.log('[createShipment] Attempting auto-assignment...');
  try {
    const availableDrivers = await User.find({
      role: 'driver',
      isActive: true,
      'driverProfile.isAvailable': true,
    }).select('name email phone driverProfile');

    if (availableDrivers && availableDrivers.length > 0) {
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

      if (bestDriver) {
        shipment.driver = bestDriver._id;
        shipment.assignedAt = new Date();
        console.log('[createShipment] Auto-assigned driver:', bestDriver.name);

        // Update driver's total deliveries
        bestDriver.driverProfile = bestDriver.driverProfile || {};
        bestDriver.driverProfile.totalDeliveries = (bestDriver.driverProfile.totalDeliveries || 0) + 1;
        await bestDriver.save();
      } else {
        console.log('[createShipment] No suitable driver found for auto-assignment');
      }
    } else {
      console.log('[createShipment] No available drivers for auto-assignment');
    }
  } catch (error) {
    console.error('[createShipment] Auto-assignment error:', error.message);
    // Continue without driver assignment if auto-assignment fails
  }

  await shipment.save();

  await Notification.create({
    user: req.user._id,
    title: 'Shipment Booked',
    message: `Your shipment ${trackingId} has been booked.${shipment.driver ? ' Driver assigned automatically.' : ''}`,
    type: 'shipment',
    relatedShipment: shipment._id,
  });

  res.status(201).json({ success: true, shipment });
};

export const getMyShipments = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { customer: req.user._id };
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [shipments, total] = await Promise.all([
    Shipment.find(filter).populate('driver', 'name phone').sort('-createdAt').skip(skip).limit(Number(limit)),
    Shipment.countDocuments(filter),
  ]);
  res.json({ success: true, shipments, total, pages: Math.ceil(total / limit) });
};

export const trackShipment = async (req, res) => {
  const shipment = await Shipment.findOne({ trackingId: req.params.trackingId })
    .populate('driver', 'name phone driverProfile')
    .populate('customer', 'name email');
  if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

  const delayCheck = detectDelay(shipment);
  if (delayCheck.isDelayed && !shipment.isDelayed) {
    shipment.isDelayed = true;
    shipment.delayReason = delayCheck.reason;
    await shipment.save();
  }
  res.json({ success: true, shipment });
};

export const getShipment = async (req, res) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate('driver', 'name phone driverProfile')
    .populate('customer', 'name email')
    .populate('warehouse', 'name code location');
  if (!shipment) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, shipment });
};

export const updateShipmentStatus = async (req, res) => {
  const { status, location, notes } = req.body;
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) return res.status(404).json({ success: false, message: 'Not found' });

  const prev = shipment.status;
  addTimeline(shipment, status, notes, location?.address);
  if (location) shipment.currentLocation = location;
  if (status === 'delivered') shipment.deliveredAt = new Date();

  const delayCheck = detectDelay(shipment);
  shipment.isDelayed = delayCheck.isDelayed;
  if (delayCheck.isDelayed) shipment.delayReason = delayCheck.reason;

  await shipment.save();
  await DeliveryHistory.create({
    shipment: shipment._id,
    driver: req.user._id,
    action: 'status_update',
    previousStatus: prev,
    newStatus: status,
    location,
    performedBy: req.user._id,
    notes,
  });

  const io = req.app.get('io');
  io?.to(`shipment:${shipment._id}`).emit('shipment:update', shipment);
  io?.to(`user:${shipment.customer}`).emit('notification', { type: 'shipment', shipment });

  await Notification.create({
    user: shipment.customer,
    title: 'Shipment Update',
    message: `${shipment.trackingId}: ${statusMessages[status]}`,
    type: shipment.isDelayed ? 'delay' : 'shipment',
    relatedShipment: shipment._id,
  });

  res.json({ success: true, shipment });
};

export const assignDriver = async (req, res) => {
  const shipment = await Shipment.findByIdAndUpdate(
    req.params.id,
    { driver: req.body.driverId, assignedAt: new Date() },
    { new: true }
  ).populate('driver', 'name email');
  if (!shipment) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, shipment });
};

export const getAllShipments = async (req, res) => {
  const { status, search, page = 1, limit = 15 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.trackingId = new RegExp(search, 'i');
  const skip = (page - 1) * limit;
  const [shipments, total] = await Promise.all([
    Shipment.find(filter).populate('customer driver', 'name email phone').sort('-createdAt').skip(skip).limit(Number(limit)),
    Shipment.countDocuments(filter),
  ]);
  res.json({ success: true, shipments, total });
};

export const uploadDeliveryProof = async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) return res.status(404).json({ success: false, message: 'Not found' });
  shipment.deliveryProof = {
    image: req.body.imageUrl || req.file?.path || '',
    signedBy: req.body.signedBy,
    deliveredAt: new Date(),
  };
  addTimeline(shipment, 'delivered', 'Delivered with proof');
  await shipment.save();
  res.json({ success: true, shipment });
};

export const refreshETA = async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) return res.status(404).json({ success: false, message: 'Not found' });
  shipment.eta = await predictETA(shipment);
  await shipment.save();
  res.json({ success: true, eta: shipment.eta });
};

export const getRouteSuggestions = async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) return res.status(404).json({ success: false, message: 'Not found' });
  const routes = suggestRoutes(shipment.sender?.location, shipment.receiver?.location);
  res.json({ success: true, routes });
};
