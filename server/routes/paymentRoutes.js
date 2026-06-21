import express from 'express';
import {
  getPaymentConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
  processCOD,
  retryPayment,
  getPaymentHistory,
  getInvoice,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/config', getPaymentConfig);

router.use(protect);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);
router.post('/cod', processCOD);
router.post('/retry/:shipmentId', retryPayment);
router.get('/history', getPaymentHistory);
router.get('/invoice/:id', getInvoice);

export default router;
