import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Warehouse from '../models/Warehouse.js';
import Shipment from '../models/Shipment.js';
import { connectDB } from '../config/db.js';
import { generateTrackingId } from './trackingId.js';
import { calculateShipmentCost } from './costCalculator.js';
import { predictETA } from '../services/aiService.js';
import { geocodeShipmentLocations } from './geocode.js';

const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Warehouse.deleteMany(), Shipment.deleteMany()]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@lumina.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
  });

  const warehouse = await Warehouse.create({
    name: 'Mumbai Central Hub',
    code: 'WH-MUM-01',
    location: { address: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400069', lat: 19.1136, lng: 72.8697 },
    capacity: 500,
    currentInventory: 12,
  });

  const warehouseMgr = await User.create({
    name: 'Raj Warehouse',
    email: 'warehouse@lumina.com',
    password: 'warehouse123',
    role: 'warehouse',
    warehouseId: warehouse._id,
    isVerified: true,
  });
  warehouse.manager = warehouseMgr._id;
  await warehouse.save();

  const driver = await User.create({
    name: 'Amit Driver',
    email: 'driver@lumina.com',
    password: 'driver123',
    role: 'driver',
    phone: '9876543210',
    isVerified: true,
    driverProfile: {
      licenseNumber: 'DL-12345',
      vehicleType: 'Van',
      vehicleNumber: 'MH-01-AB-1234',
      rating: 4.8,
      totalDeliveries: 156,
      earnings: 45000,
      isAvailable: true,
      currentLocation: { lat: 19.076, lng: 72.8777, updatedAt: new Date() },
    },
  });

  const customer = await User.create({
    name: 'Priya Customer',
    email: 'customer@lumina.com',
    password: 'customer123',
    role: 'customer',
    phone: '9123456789',
    isVerified: true,
  });

  const trackingId = generateTrackingId();
  
  // Geocode demo shipment locations
  console.log('[Seed] Geocoding demo shipment locations...');
  const senderLocation = { address: 'Bandra', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' };
  const receiverLocation = { address: 'Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001' };
  const geocodedLocations = await geocodeShipmentLocations(senderLocation, receiverLocation);
  
  const senderCoords = geocodedLocations.sender || { lat: 19.0596, lng: 72.8295 };
  const receiverCoords = geocodedLocations.receiver || { lat: 28.6315, lng: 77.2167 };
  
  console.log('[Seed] Sender coordinates:', senderCoords);
  console.log('[Seed] Receiver coordinates:', receiverCoords);

  const eta = await predictETA({
    sender: { location: senderCoords },
    receiver: { location: receiverCoords },
    deliverySpeed: 'express',
  });

  await Shipment.create({
    trackingId,
    customer: customer._id,
    driver: driver._id,
    warehouse: warehouse._id,
    sender: {
      name: 'Priya',
      phone: '9123456789',
      location: { ...senderLocation, lat: senderCoords.lat, lng: senderCoords.lng },
    },
    receiver: {
      name: 'Rahul',
      phone: '9988776655',
      location: { ...receiverLocation, lat: receiverCoords.lat, lng: receiverCoords.lng },
    },
    package: { type: 'parcel', weight: 2.5, dimensions: { length: 30, width: 20, height: 15 } },
    deliverySpeed: 'express',
    status: 'in_transit',
    estimatedCost: calculateShipmentCost({ weight: 2.5, deliverySpeed: 'express' }),
    paymentStatus: 'paid',
    paymentMethod: 'upi',
    timeline: [
      { status: 'pending', message: 'Shipment created', timestamp: new Date(Date.now() - 3 * 86400000) },
      { status: 'picked_up', message: 'Picked up', timestamp: new Date(Date.now() - 2 * 86400000) },
      { status: 'in_warehouse', message: 'At Mumbai hub', timestamp: new Date(Date.now() - 86400000) },
      { status: 'in_transit', message: 'In transit to Delhi', timestamp: new Date() },
    ],
    currentLocation: { lat: 23.5, lng: 75.5, address: 'En route' },
    eta,
    assignedAt: new Date(),
  });

  console.log('\n✅ Seed completed!\n');
  console.log('Demo accounts (password shown):');
  console.log('  Admin:     admin@lumina.com / admin123');
  console.log('  Customer:  customer@lumina.com / customer123');
  console.log('  Driver:    driver@lumina.com / driver123');
  console.log('  Warehouse: warehouse@lumina.com / warehouse123');
  console.log(`  Sample tracking ID: ${trackingId}\n`);
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
