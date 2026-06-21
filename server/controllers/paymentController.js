import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Payment from '../models/Payment.js';
import Shipment from '../models/Shipment.js';
import { getRazorpay, isRazorpayConfigured } from '../config/razorpay.js';

/** Amount in paise (Razorpay requires integer, min ₹1) */
const toPaise = (rupees) => Math.max(100, Math.round(rupees * 100));

const assertShipmentOwner = async (shipmentId, userId) => {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) return { error: { status: 404, message: 'Shipment not found' } };
  if (shipment.customer.toString() !== userId.toString()) {
    return { error: { status: 403, message: 'Not authorized' } };
  }
  if (shipment.paymentStatus === 'paid') {
    return { error: { status: 400, message: 'Shipment already paid' } };
  }
  return { shipment };
};

/**
 * GET /api/payments/config — public Razorpay key + enabled flag
 */
export const getPaymentConfig = (req, res) => {
  res.json({
    success: true,
    razorpayEnabled: isRazorpayConfigured(),
    keyId: process.env.RAZORPAY_KEY_ID || null,
  });
};

/**
 * POST /api/payments/create-order — create Razorpay order for UPI / Card
 */
export const createRazorpayOrder = async (req, res) => {
  if (!isRazorpayConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Online payments not configured. Add RAZORPAY keys to server .env or use COD.',
    });
  }

  const { shipmentId, method } = req.body;
  if (!['upi', 'card'].includes(method)) {
    return res.status(400).json({ success: false, message: 'Method must be upi or card' });
  }

  const { shipment, error } = await assertShipmentOwner(shipmentId, req.user._id);
  if (error) return res.status(error.status).json({ success: false, message: error.message });

  const razorpay = getRazorpay();
  const amountPaise = toPaise(shipment.estimatedCost);
  const receipt = `lumina_${shipment.trackingId}_${Date.now()}`.slice(0, 40);

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes: {
      shipmentId: shipment._id.toString(),
      trackingId: shipment.trackingId,
      userId: req.user._id.toString(),
      method,
    },
  });

  // Reuse pending payment for same shipment or create new
  let payment = await Payment.findOne({
    shipment: shipmentId,
    status: 'pending',
    method: { $in: ['upi', 'card'] },
  });

  if (payment) {
    payment.amount = shipment.estimatedCost;
    payment.method = method;
    payment.razorpay = { orderId: order.id };
    await payment.save();
  } else {
    payment = await Payment.create({
      user: req.user._id,
      shipment: shipmentId,
      amount: shipment.estimatedCost,
      method,
      status: 'pending',
      transactionId: `PENDING-${uuidv4().slice(0, 12).toUpperCase()}`,
      invoiceNumber: `INV-${Date.now()}`,
      razorpay: { orderId: order.id },
    });
  }

  shipment.paymentMethod = method;
  await shipment.save();

  res.json({
    success: true,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    },
    paymentId: payment._id,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
};

/**
 * POST /api/payments/verify — verify Razorpay signature after checkout
 */
export const verifyRazorpayPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentId,
    method,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }

  const payment = await Payment.findById(paymentId);
  if (!payment || payment.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }

  if (payment.status === 'completed') {
    return res.json({ success: true, payment, message: 'Already verified' });
  }

  payment.status = 'completed';
  payment.transactionId = razorpay_payment_id;
  payment.method = method || payment.method;
  payment.razorpay = {
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  };
  await payment.save();

  const shipment = await Shipment.findByIdAndUpdate(
    payment.shipment,
    { paymentStatus: 'paid', paymentMethod: payment.method },
    { new: true }
  );

  res.json({
    success: true,
    payment,
    shipment,
    message: 'Payment verified successfully',
  });
};

/**
 * POST /api/payments/cod — Cash on Delivery (no gateway)
 */
export const processCOD = async (req, res) => {
  const { shipmentId } = req.body;
  const { shipment, error } = await assertShipmentOwner(shipmentId, req.user._id);
  if (error) return res.status(error.status).json({ success: false, message: error.message });

  const payment = await Payment.create({
    user: req.user._id,
    shipment: shipmentId,
    amount: shipment.estimatedCost,
    method: 'cod',
    status: 'pending',
    transactionId: `COD-${uuidv4().slice(0, 8).toUpperCase()}`,
    invoiceNumber: `INV-${Date.now()}`,
  });

  shipment.paymentStatus = 'cod';
  shipment.paymentMethod = 'cod';
  await shipment.save();

  res.status(201).json({
    success: true,
    payment,
    message: 'COD selected — pay driver on delivery',
  });
};

/**
 * POST /api/payments/retry — new Razorpay order for unpaid shipment
 */
export const retryPayment = async (req, res) => {
  req.body.shipmentId = req.body.shipmentId || req.params.shipmentId;
  return createRazorpayOrder(req, res);
};

export const getPaymentHistory = async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('shipment', 'trackingId status estimatedCost paymentStatus')
    .sort('-createdAt');
  res.json({ success: true, payments, razorpayEnabled: isRazorpayConfigured() });
};

export const getInvoice = async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('shipment', 'trackingId sender receiver estimatedCost');
  if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, invoice: payment });
};
