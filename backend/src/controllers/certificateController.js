import prisma from '../config/db.js';

// Helper to generate sequential certificate serial numbers e.g. CC-CERT-2026-0001
const generateCertificateNumber = async () => {
  const currentYear = new Date().getFullYear();
  const count = await prisma.certificate.count();
  const serial = String(count + 1).padStart(4, '0');
  return `CC-CERT-${currentYear}-${serial}`;
};

/**
 * 1. STUDENT: Get my certificates
 */
export const getMyCertificates = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        studentId: student.id,
        status: 'ISSUED'
      },
      orderBy: { issuedDate: 'desc' },
      include: {
        activity: { select: { id: true, title: true, eventDate: true, category: true } },
        issuedBy: { select: { name: true } }
      }
    });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error('Get my certificates error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching certificates' });
  }
};

/**
 * 2. PUBLIC / ANY ROLE: Get single certificate by ID or Certificate Number
 */
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id },
          { certificateNo: id }
        ]
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        activity: { select: { id: true, title: true, eventDate: true, venue: true, category: true } },
        issuedBy: { select: { name: true, role: true } }
      }
    });

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found or invalid identifier' });
    }

    return res.status(200).json({
      success: true,
      certificate
    });
  } catch (error) {
    console.error('Get certificate by id error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving certificate' });
  }
};

/**
 * 3. COORDINATOR: Request permission from Admin to issue a certificate for a student
 * Strictly verified against coordinator's assigned branch & section!
 */
export const requestCertificate = async (req, res) => {
  try {
    const { studentId, title, reason, activityId } = req.body;

    if (!studentId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and justification reason are required'
      });
    }

    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: req.user.id }
    });

    if (!coordinator) {
      return res.status(403).json({ success: false, message: 'Coordinator profile not found' });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check branch and section scoping
    const branchMismatch = coordinator.assignedBranch !== student.branch;
    const sectionMismatch = coordinator.assignedSection && coordinator.assignedSection !== student.section;

    if (branchMismatch || sectionMismatch) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. You can only request certificates for students in your assigned branch '${coordinator.assignedBranch}'${coordinator.assignedSection ? ` (Sec ${coordinator.assignedSection})` : ''}.`
      });
    }

    const certificateRequest = await prisma.certificateRequest.create({
      data: {
        coordinatorId: coordinator.id,
        studentId: student.id,
        studentName: student.user.name,
        branch: student.branch,
        title: title ? title.trim() : 'Certificate of Recognition',
        reason: reason.trim(),
        activityId: activityId || null,
        status: 'PENDING'
      },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        activity: { select: { title: true } }
      }
    });

    return res.status(201).json({
      success: true,
      message: `Certificate request for ${student.user.name} submitted to Admin for approval!`,
      request: certificateRequest
    });
  } catch (error) {
    console.error('Request certificate error:', error);
    return res.status(500).json({ success: false, message: 'Error submitting certificate request' });
  }
};

/**
 * 4. COORDINATOR: View requests submitted by this coordinator
 */
export const getCoordinatorRequests = async (req, res) => {
  try {
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: req.user.id }
    });

    if (!coordinator) {
      return res.status(403).json({ success: false, message: 'Coordinator profile not found' });
    }

    const requests = await prisma.certificateRequest.findMany({
      where: { coordinatorId: coordinator.id },
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        activity: { select: { id: true, title: true } },
        certificate: true
      }
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get coordinator requests error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
};

/**
 * 5. ADMIN: View all certificate requests from coordinators
 */
export const getAdminRequests = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'ALL') where.status = status;

    if (search) {
      where.OR = [
        { studentName: { contains: search, mode: 'insensitive' } },
        { branch: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } }
      ];
    }

    const requests = await prisma.certificateRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        coordinator: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        student: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        activity: { select: { id: true, title: true } },
        certificate: true
      }
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get admin requests error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving certificate requests' });
  }
};

/**
 * 6. ADMIN: Approve Certificate Request and issue certificate (allows editing studentName, branch, title, description)
 */
export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params; // Request ID
    const { studentName, branch, title, description } = req.body;

    const request = await prisma.certificateRequest.findUnique({
      where: { id },
      include: { student: { include: { user: true } } }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Certificate request not found' });
    }

    if (request.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'This certificate request has already been approved' });
    }

    const finalStudentName = studentName?.trim() || request.studentName || request.student.user.name;
    const finalBranch = branch?.trim() || request.branch || request.student.branch;
    const finalTitle = title?.trim() || request.title || 'Certificate of Recognition';
    const finalDesc = description?.trim() || request.reason;

    const certificateNo = await generateCertificateNumber();

    const result = await prisma.$transaction(async (tx) => {
      const certificate = await tx.certificate.create({
        data: {
          certificateNo,
          studentId: request.studentId,
          studentName: finalStudentName,
          branch: finalBranch,
          title: finalTitle,
          description: finalDesc,
          activityId: request.activityId,
          issuedById: req.user.id,
          requestId: request.id,
          status: 'ISSUED',
          issuedDate: new Date()
        }
      });

      const updatedRequest = await tx.certificateRequest.update({
        where: { id: request.id },
        data: {
          status: 'APPROVED',
          rejectionReason: null
        }
      });

      return { certificate, updatedRequest };
    });

    return res.status(200).json({
      success: true,
      message: `Certificate ${certificateNo} issued successfully for ${finalStudentName}!`,
      certificate: result.certificate,
      request: result.updatedRequest
    });
  } catch (error) {
    console.error('Approve certificate request error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error approving certificate request' });
  }
};

/**
 * 7. ADMIN: Reject Certificate Request
 */
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const request = await prisma.certificateRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Certificate request not found' });
    }

    const updatedRequest = await prisma.certificateRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason ? rejectionReason.trim() : 'Declined by Admin'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Certificate request declined',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Reject certificate request error:', error);
    return res.status(500).json({ success: false, message: 'Error rejecting certificate request' });
  }
};

/**
 * 8. ADMIN: Directly Issue a Certificate to any student (no request needed)
 */
export const issueCertificateDirectly = async (req, res) => {
  try {
    const { studentId, studentName, branch, title, description, activityId } = req.body;

    if (!studentId || !title) {
      return res.status(400).json({ success: false, message: 'Student and certificate title are required' });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const finalStudentName = studentName?.trim() || student.user.name;
    const finalBranch = branch?.trim() || student.branch;
    const certificateNo = await generateCertificateNumber();

    const certificate = await prisma.certificate.create({
      data: {
        certificateNo,
        studentId: student.id,
        studentName: finalStudentName,
        branch: finalBranch,
        title: title.trim(),
        description: description ? description.trim() : null,
        activityId: activityId || null,
        issuedById: req.user.id,
        status: 'ISSUED',
        issuedDate: new Date()
      },
      include: {
        student: { include: { user: true } },
        activity: true
      }
    });

    return res.status(201).json({
      success: true,
      message: `Certificate ${certificateNo} directly issued to ${finalStudentName}!`,
      certificate
    });
  } catch (error) {
    console.error('Direct issue certificate error:', error);
    return res.status(500).json({ success: false, message: 'Error issuing certificate' });
  }
};

/**
 * 9. ADMIN: Edit / Update existing certificate details
 * "and also make option to edit the changes inn certificates"
 */
export const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, branch, title, description, issuedDate, status } = req.body;

    const existingCert = await prisma.certificate.findUnique({
      where: { id }
    });

    if (!existingCert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        ...(studentName && { studentName: studentName.trim() }),
        ...(branch && { branch: branch.trim() }),
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(issuedDate && { issuedDate: new Date(issuedDate) }),
        ...(status && { status })
      },
      include: {
        student: { include: { user: true } },
        activity: true,
        issuedBy: { select: { name: true } }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Certificate ${updated.certificateNo} details updated successfully!`,
      certificate: updated
    });
  } catch (error) {
    console.error('Update certificate error:', error);
    return res.status(500).json({ success: false, message: 'Error updating certificate' });
  }
};

/**
 * 10. ADMIN: Get all certificates with search and branch filter
 */
export const getAllCertificates = async (req, res) => {
  try {
    const { search, branch, status } = req.query;

    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (branch && branch !== 'ALL') where.branch = branch;

    if (search) {
      where.OR = [
        { certificateNo: { contains: search, mode: 'insensitive' } },
        { studentName: { contains: search, mode: 'insensitive' } },
        { branch: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } }
      ];
    }

    const certificates = await prisma.certificate.findMany({
      where,
      orderBy: { issuedDate: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        activity: { select: { id: true, title: true, eventDate: true } },
        issuedBy: { select: { name: true } },
        request: {
          include: {
            coordinator: { include: { user: { select: { name: true } } } }
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error('Get all certificates error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching certificates' });
  }
};

/**
 * 11. ADMIN: Delete / Revoke Certificate
 */
export const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.certificate.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    await prisma.certificate.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: `Certificate ${existing.certificateNo} has been deleted successfully`
    });
  } catch (error) {
    console.error('Delete certificate error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error deleting certificate' });
  }
};
