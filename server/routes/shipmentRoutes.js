import express from 'express';
import {
  createShipment,
  getMyShipments,
  trackShipment,
  getShipment,
  updateShipmentStatus,
  assignDriver,
  getAllShipments,
  uploadDeliveryProof,
  refreshETA,
  getRouteSuggestions,
} from '../controllers/shipmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
router.get('/track/:trackingId', trackShipment);
router.use(protect);
router.post('/', authorize('customer', 'admin'), createShipment);
router.get('/my', authorize('customer'), getMyShipments);
router.get('/all', authorize('admin'), getAllShipments);
router.get('/:id', getShipment);
router.get('/:id/eta', refreshETA);
router.get('/:id/routes', getRouteSuggestions);
router.put('/:id/status', authorize('driver', 'admin', 'warehouse'), updateShipmentStatus);
router.put('/:id/assign', authorize('admin'), assignDriver);
router.post('/:id/proof', authorize('driver'), upload.single('proof'), uploadDeliveryProof);

export default router;
