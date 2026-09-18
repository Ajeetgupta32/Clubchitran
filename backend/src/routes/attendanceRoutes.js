import express from 'express';
import { getAttendanceList, exportAttendanceExcel } from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// View attendance records
router.get('/', getAttendanceList);

// Export attendance report as ExcelJS .xlsx
router.get('/export/:activityId', authorize('ADMIN', 'COORDINATOR'), exportAttendanceExcel);

export default router;
