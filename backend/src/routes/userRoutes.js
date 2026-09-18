import express from 'express';
import {
  getStudents,
  createStudent,
  updateStudentDetails,
  getCoordinators,
  createCoordinator,
  promoteStudentToCoordinator,
  getBranchStudentStrength,
  getBranchesAndSections,
  updateStudentProfile,
  resetUserPasswordByAdmin,
  deleteStudent,
  deleteCoordinator
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Students directory (Admin sees all; Coordinator sees assigned branch)
router.get('/students', authorize('ADMIN', 'COORDINATOR'), getStudents);
router.post('/students', authorize('ADMIN'), createStudent);
router.put('/students/:id', authorize('ADMIN'), updateStudentDetails);
router.delete('/students/:id', authorize('ADMIN'), deleteStudent);

// Admin Password Management (Reset/Change student or coordinator password)
router.post('/reset-password', authorize('ADMIN'), resetUserPasswordByAdmin);

router.get('/coordinators', authorize('ADMIN'), getCoordinators);
router.post('/coordinators', authorize('ADMIN'), createCoordinator);
router.delete('/coordinators/:id', authorize('ADMIN'), deleteCoordinator);
router.post('/promote-coordinator', authorize('ADMIN'), promoteStudentToCoordinator);

router.get('/branches/strength', authorize('ADMIN'), getBranchStudentStrength);
router.get('/meta/branches-sections', getBranchesAndSections);

// Student profile update
router.put('/student/profile', authorize('STUDENT'), updateStudentProfile);

export default router;
