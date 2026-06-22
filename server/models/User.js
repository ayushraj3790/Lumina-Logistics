import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: false, minlength: 6, select: false },
    googleId: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ['customer', 'driver', 'admin', 'warehouse'],
      default: 'customer',
    },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: { type: Boolean, default: true },
    // Driver approval status
    driverStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'suspended'],
      default: null,
    },
    driverRejectionReason: { type: String },
    driverReviewedAt: { type: Date },
    driverReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Driver-specific fields
    driverProfile: {
      licenseNumber: String,
      vehicleType: String,
      vehicleNumber: String,
      rating: { type: Number, default: 5, min: 0, max: 5 },
      totalDeliveries: { type: Number, default: 0 },
      earnings: { type: Number, default: 0 },
      isAvailable: { type: Boolean, default: true },
      currentLocation: {
        lat: Number,
        lng: Number,
        updatedAt: Date,
      },
    },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
