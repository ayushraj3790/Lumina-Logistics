import mongoose from 'mongoose';

const deliveryHistorySchema = new mongoose.Schema(
  {
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    previousStatus: String,
    newStatus: String,
    location: { lat: Number, lng: Number, address: String },
    notes: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const DeliveryHistory = mongoose.model('DeliveryHistory', deliveryHistorySchema);
export default DeliveryHistory;
