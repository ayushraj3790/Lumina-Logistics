import mongoose from 'mongoose';

const locationSchema = {
  address: String,
  city: String,
  state: String,
  pincode: String,
  lat: Number,
  lng: Number,
};

const timelineSchema = {
  status: String,
  message: String,
  location: String,
  timestamp: { type: Date, default: Date.now },
};

const shipmentSchema = new mongoose.Schema(
  {
    trackingId: { type: String, unique: true, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    sender: {
      name: String,
      phone: String,
      email: String,
      location: locationSchema,
    },
    receiver: {
      name: String,
      phone: String,
      email: String,
      location: locationSchema,
    },
    package: {
      type: { type: String, enum: ['document', 'parcel', 'fragile', 'electronics', 'other'], default: 'parcel' },
      weight: { type: Number, required: true }, // kg
      dimensions: { length: Number, width: Number, height: Number }, // cm
      description: String,
    },
    deliverySpeed: {
      type: String,
      enum: ['standard', 'express', 'same-day'],
      default: 'standard',
    },
    status: {
      type: String,
      enum: ['pending', 'picked_up', 'in_warehouse', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'cancelled'],
      default: 'pending',
    },
    estimatedCost: { type: Number, required: true },
    actualCost: Number,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'cod'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cod', 'upi', 'card'], default: 'cod' },
    timeline: [timelineSchema],
    currentLocation: { lat: Number, lng: Number, address: String },
    eta: {
      predictedAt: Date,
      confidence: { type: Number, default: 85 },
      factors: { distance: Number, traffic: String, weather: String },
    },
    isDelayed: { type: Boolean, default: false },
    delayReason: String,
    deliveryProof: { image: String, signedBy: String, deliveredAt: Date },
    qrCode: String,
   routeSuggestions: [
  {
    type: {
      type: String,
    },
    name: String,
    distance: Number,
    duration: Number,
  },
],
    assignedAt: Date,
    deliveredAt: Date,
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

shipmentSchema.index({ trackingId: 1, status: 1, customer: 1 });

const Shipment = mongoose.model('Shipment', shipmentSchema);
export default Shipment;
