import express from 'express';
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  publishActivity,
  registerForActivity,
  getPublicActivities
} from '../controllers/activityController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public route: accessible to visitors on the home page
router.get('/public', getPublicActivities);

// Authenticated routes
router.use(authenticate);

router.get('/', getActivities);
router.get('/:id', getActivityById);

// Admin-only endpoints
router.post('/', authorize('ADMIN'), upload.single('banner'), createActivity);
router.put('/:id', authorize('ADMIN'), upload.single('banner'), updateActivity);
router.delete('/:id', authorize('ADMIN'), deleteActivity);
router.patch('/:id/publish', authorize('ADMIN'), publishActivity);

// Student registration endpoint
router.post('/register', authorize('STUDENT'), registerForActivity);

export default router;
