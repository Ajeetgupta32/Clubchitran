import express from 'express';
import {
  getAdminStats,
  getCoordinatorStats,
  getStudentStats,
  getLeaderboard,
  updateStudentPointsAndAward
} from '../controllers/statsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Leaderboard for Home page and general view
router.get('/leaderboard', getLeaderboard);

// Authenticated stats
router.use(authenticate);

router.get('/admin', authorize('ADMIN'), getAdminStats);
router.get('/coordinator', authorize('COORDINATOR'), getCoordinatorStats);
router.get('/student', authorize('STUDENT'), getStudentStats);

// Admin-only: Update student points and awards
router.patch('/student/:id/points', authorize('ADMIN'), updateStudentPointsAndAward);

export default router;
