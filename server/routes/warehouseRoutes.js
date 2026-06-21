import express from 'express';
import {
  getWarehouseStats,
  scanPackage,
  updateStorageStatus,
  getInventory,
} from '../controllers/warehouseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('warehouse'));
router.get('/stats', getWarehouseStats);
router.post('/scan', scanPackage);
router.get('/inventory', getInventory);
router.put('/package/:trackingId', updateStorageStatus);

export default router;
