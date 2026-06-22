import mongoose from 'mongoose';

const driverApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Personal Information
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    aadhaar: { type: String, required: true },
    pan: { type: String, required: true },
    
    // License Information
    licenseNumber: { type: String, required: true },
    licenseUpload: { type: String, required: true }, // Cloudinary URL
    
    // Vehicle Information
    vehicleType: {
      type: String,
      enum: ['bike', 'car', 'truck', 'van'],
      required: true,
    },
    vehicleNumber: { type: String, required: true },
    rcUpload: { type: String, required: true }, // Cloudinary URL
    insuranceUpload: { type: String, required: true }, // Cloudinary URL
    
    // Bank Information
    bankName: { type: String, required: true },
    accountHolder: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifsc: { type: String, required: true },
    cancelledChequeUpload: { type: String, required: true }, // Cloudinary URL
    
    // Emergency Contact
    emergencyContactName: { type: String, required: true },
    emergencyContactPhone: { type: String, required: true },
    emergencyContactRelation: { type: String, required: true },
    
    // Address
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    
    // Application Status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    
    // Review Information
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    notes: { type: String },
    
    // Invite Code (optional)
    inviteCode: { type: String },
  },
  { timestamps: true }
);

const DriverApplication = mongoose.model('DriverApplication', driverApplicationSchema);
export default DriverApplication;
