import express from 'express';
import {
  getMyCertificates,
  getCertificateById,
  requestCertificate,
  getCoordinatorRequests,
  getAdminRequests,
  approveRequest,
  rejectRequest,
  issueCertificateDirectly,
  updateCertificate,
  getAllCertificates,
  deleteCertificate,
  issueWorkshopAttendeeCertificates,
  issueTopPerformerCertificate,
  issueTopPicksPhysicalCertificates,
  updatePhysicalCertificateStatus
} from '../controllers/certificateController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Verification lookup
router.get('/view/:id', getCertificateById);

// Student Certificates
router.get('/my', authenticate, authorize('STUDENT'), getMyCertificates);
router.get('/my-certificates', authenticate, authorize('STUDENT'), getMyCertificates);

// Coordinator Certificate Requests
router.post('/request', authenticate, authorize('COORDINATOR'), requestCertificate);
router.get('/coordinator/requests', authenticate, authorize('COORDINATOR'), getCoordinatorRequests);

// Admin Certificate Management
router.get('/admin/requests', authenticate, authorize('ADMIN'), getAdminRequests);
router.post('/admin/requests/:id/approve', authenticate, authorize('ADMIN'), approveRequest);
router.put('/admin/requests/:id/approve', authenticate, authorize('ADMIN'), approveRequest);
router.post('/admin/requests/:id/reject', authenticate, authorize('ADMIN'), rejectRequest);
router.put('/admin/requests/:id/reject', authenticate, authorize('ADMIN'), rejectRequest);
router.post('/admin/issue', authenticate, authorize('ADMIN'), issueCertificateDirectly);
router.post('/admin/issue-workshop-attendees', authenticate, authorize('ADMIN'), issueWorkshopAttendeeCertificates);
router.post('/admin/issue-top-performer', authenticate, authorize('ADMIN'), issueTopPerformerCertificate);
router.post('/admin/issue-top-picks', authenticate, authorize('ADMIN'), issueTopPicksPhysicalCertificates);
router.patch('/admin/:id/physical-status', authenticate, authorize('ADMIN'), updatePhysicalCertificateStatus);
router.put('/admin/:id', authenticate, authorize('ADMIN'), updateCertificate);
router.delete('/admin/:id', authenticate, authorize('ADMIN'), deleteCertificate);
router.get('/admin/all', authenticate, authorize('ADMIN'), getAllCertificates);

export default router;
