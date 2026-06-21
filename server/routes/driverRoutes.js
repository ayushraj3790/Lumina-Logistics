import express from 'express';
import {
  getAssignedDeliveries,
  acceptDelivery,
  updateLocation,
  getDriverStats,
  getAvailableDrivers,
  assignBestDriverToShipment,
} from '../controllers/driverController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/deliveries', authorize('driver'), getAssignedDeliveries);
router.put('/deliveries/:id/accept', authorize('driver'), acceptDelivery);
router.put('/location', authorize('driver'), updateLocation);
router.get('/stats', authorize('driver'), getDriverStats);
router.get('/available', authorize('admin'), getAvailableDrivers);
router.post('/assign/:shipmentId', authorize('admin'), assignBestDriverToShipment);

export default router;
