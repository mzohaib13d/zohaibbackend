import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getProfile } from '../controllers/profileController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getProfile);

export default router;