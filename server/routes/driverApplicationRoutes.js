import express from 'express';
import {
  getDriverApplications,
  getDriverApplication,
  approveDriverApplication,
  rejectDriverApplication,
  suspendDriver,
  activateDriver,
  updateApplicationStatus,
} from '../controllers/driverApplicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getDriverApplications);
router.get('/:id', getDriverApplication);
router.put('/:id/status', updateApplicationStatus);
router.post('/:id/approve', approveDriverApplication);
router.post('/:id/reject', rejectDriverApplication);
router.post('/:id/suspend', suspendDriver);
router.post('/:id/activate', activateDriver);

export default router;
