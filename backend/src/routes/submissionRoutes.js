import express from 'express';
import {
  uploadPhotoSubmission,
  getSubmissions,
  verifySubmission,
  rejectSubmission,
  getTopPicks,
  setTopPicks,
  getPublicGallerySubmissions,
  deleteSubmission
} from '../controllers/submissionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes for Home page
router.get('/top-picks', getTopPicks);
router.get('/gallery', getPublicGallerySubmissions);

// All routes below require authentication
router.use(authenticate);

router.get('/', getSubmissions);

// Admin-only: Set Top 3 Photo Picks
router.post('/top-picks', authorize('ADMIN'), setTopPicks);

// Admin-only: Delete Photo Submission
router.delete('/:id', authorize('ADMIN'), deleteSubmission);

// Student photo upload proof
router.post('/', authorize('STUDENT'), upload.single('photo'), uploadPhotoSubmission);

// Admin / Coordinator verification and rejection
router.patch('/:id/verify', authorize('ADMIN', 'COORDINATOR'), verifySubmission);
router.patch('/:id/reject', authorize('ADMIN', 'COORDINATOR'), rejectSubmission);

export default router;
