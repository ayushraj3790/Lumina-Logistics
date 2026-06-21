import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cod', 'upi', 'card'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    transactionId: { type: String, unique: true },
    invoiceNumber: { type: String, unique: true },
    metadata: { upiId: String, cardLast4: String },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
