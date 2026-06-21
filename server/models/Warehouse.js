import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    capacity: { type: Number, default: 1000 },
    currentInventory: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;
