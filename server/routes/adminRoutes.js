import express from 'express';
import {
  getUsers,
  updateUser,
  deleteUser,
  getDashboardStats,
  createWarehouse,
} from '../controllers/adminController.js';
import Warehouse from '../models/Warehouse.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getDashboardStats);
router.get('/warehouses', async (req, res) => {
  const warehouses = await Warehouse.find().populate('manager', 'name email');
  res.json({ success: true, warehouses });
});
router.post('/warehouses', createWarehouse);

export default router;
