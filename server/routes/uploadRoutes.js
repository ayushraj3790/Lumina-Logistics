import express from 'express';
import { uploadDriverDocument, submitDriverApplication } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

// Upload single document
router.post('/driver/:userId/document', upload.single('document'), uploadDriverDocument);

// Submit complete driver application
router.post('/driver/:userId/application', submitDriverApplication);

export default router;
