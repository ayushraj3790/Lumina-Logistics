import express from 'express';
import { sendMessage, getChats, getChat } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.post('/message', sendMessage);
router.get('/', getChats);
router.get('/:id', getChat);

export default router;
