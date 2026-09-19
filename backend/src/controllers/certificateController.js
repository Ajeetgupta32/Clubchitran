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
    const { 
      studentId, 
      studentName, 
      branch, 
      title, 
      description, 
      activityId,
      deliveryType,
      certificateType,
      isPhysical,
      isTopPerformer,
      rank,
      physicalStatus,
      physicalRemarks
    } = req.body;

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

    const isPhys = Boolean(isPhysical || deliveryType === 'PHYSICAL');

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
        deliveryType: isPhys ? 'PHYSICAL' : (deliveryType || 'DIGITAL'),
        certificateType: certificateType || (isTopPerformer ? 'TOP_PERFORMER' : 'PARTICIPATION'),
        isPhysical: isPhys,
        isTopPerformer: Boolean(isTopPerformer || isPhys),
        rank: rank ? parseInt(rank, 10) : null,
        physicalStatus: isPhys ? (physicalStatus || 'READY_FOR_COLLECTION') : null,
        physicalRemarks: isPhys ? (physicalRemarks || 'Official physical copy') : null,
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
    const { 
      studentName, 
      branch, 
      title, 
      description, 
      issuedDate, 
      status,
      deliveryType,
      certificateType,
      isPhysical,
      isTopPerformer,
      rank,
      physicalStatus,
      physicalRemarks
    } = req.body;

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
        ...(status && { status }),
        ...(deliveryType && { deliveryType }),
        ...(certificateType && { certificateType }),
        ...(isPhysical !== undefined && { isPhysical: Boolean(isPhysical) }),
        ...(isTopPerformer !== undefined && { isTopPerformer: Boolean(isTopPerformer) }),
        ...(rank !== undefined && { rank: rank ? parseInt(rank, 10) : null }),
        ...(physicalStatus !== undefined && { physicalStatus }),
        ...(physicalRemarks !== undefined && { physicalRemarks: physicalRemarks ? physicalRemarks.trim() : null })
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
 * 10. ADMIN: Get all certificates with search, branch, deliveryType and topPerformer filters
 */
export const getAllCertificates = async (req, res) => {
  try {
    const { search, branch, status, deliveryType, certificateType, isTopPerformer } = req.query;

    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (branch && branch !== 'ALL') where.branch = branch;
    if (deliveryType && deliveryType !== 'ALL') where.deliveryType = deliveryType;
    if (certificateType && certificateType !== 'ALL') where.certificateType = certificateType;
    if (isTopPerformer === 'true') where.isTopPerformer = true;
    if (isTopPerformer === 'false') where.isTopPerformer = false;

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

/**
 * 12. ADMIN: Send digital certificates to all workshop attend members
 * Finds all students who attended the workshop (Attendance marked PRESENT),
 * checks for existing certificates to avoid duplicates, and issues verified digital certificates.
 */
export const issueWorkshopAttendeeCertificates = async (req, res) => {
  try {
    const { activityId, customTitle, customDescription } = req.body;

    if (!activityId) {
      return res.status(400).json({ success: false, message: 'Activity ID is required' });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Workshop/Activity not found' });
    }

    // Find all participations with verified attendance (status = PRESENT)
    const attendances = await prisma.attendance.findMany({
      where: {
        participation: { activityId },
        status: 'PRESENT'
      },
      include: {
        participation: {
          include: {
            student: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        }
      }
    });

    if (attendances.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No verified attendees found for this workshop yet. Please verify student attendance or photo proofs first.'
      });
    }

    // Find students who already received a participation certificate for this activity
    const existingCerts = await prisma.certificate.findMany({
      where: {
        activityId,
        certificateType: 'PARTICIPATION'
      },
      select: { studentId: true }
    });
    const existingStudentIds = new Set(existingCerts.map((c) => c.studentId));

    const toIssue = attendances.filter((att) => !existingStudentIds.has(att.participation.studentId));

    if (toIssue.length === 0) {
      return res.status(200).json({
        success: true,
        message: `All ${attendances.length} workshop attendees have already received their certificates! No new certificates needed.`,
        issuedCount: 0,
        totalAttendees: attendances.length,
        alreadyIssuedCount: existingStudentIds.size
      });
    }

    const formattedDate = new Date(activity.eventDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const issuedCertificates = [];
    for (const item of toIssue) {
      const student = item.participation.student;
      const certificateNo = await generateCertificateNumber();

      const cert = await prisma.certificate.create({
        data: {
          certificateNo,
          studentId: student.id,
          studentName: student.user.name,
          branch: student.branch,
          title: customTitle ? customTitle.trim() : `Certificate of Participation - ${activity.title}`,
          description: customDescription 
            ? customDescription.trim() 
            : `Awarded for active visual creativity and successful attendance in the "${activity.title}" workshop conducted on ${formattedDate}.`,
          activityId: activity.id,
          issuedById: req.user.id,
          status: 'ISSUED',
          deliveryType: 'DIGITAL',
          certificateType: 'PARTICIPATION',
          isPhysical: false,
          isTopPerformer: false,
          issuedDate: new Date()
        },
        include: {
          student: { include: { user: true } },
          activity: true
        }
      });
      issuedCertificates.push(cert);
    }

    // Update activity record with timestamp
    await prisma.activity.update({
      where: { id: activityId },
      data: { certificatesIssuedAt: new Date() }
    });

    return res.status(201).json({
      success: true,
      message: `Successfully issued ${issuedCertificates.length} digital participation certificates to workshop attendees!`,
      issuedCount: issuedCertificates.length,
      totalAttendees: attendances.length,
      alreadyIssuedCount: existingStudentIds.size,
      certificates: issuedCertificates
    });
  } catch (error) {
    console.error('Issue workshop attendee certificates error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error issuing attendee certificates' });
  }
};

/**
 * 13. ADMIN: Award Physical Certificate to Top Performer
 * Generates an official physical parchment certificate with rank, custom recognition, and delivery tracking.
 */
export const issueTopPerformerCertificate = async (req, res) => {
  try {
    const { 
      studentId, 
      activityId, 
      rank, 
      title, 
      description, 
      physicalStatus, 
      physicalRemarks 
    } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    let activity = null;
    if (activityId) {
      activity = await prisma.activity.findUnique({ where: { id: activityId } });
    }

    const rankNum = rank ? parseInt(rank, 10) : 1;
    const rankLabel = rankNum === 1 ? '1st Place Winner' : rankNum === 2 ? '2nd Place Runner-Up' : rankNum === 3 ? '3rd Place Honor' : `Rank #${rankNum} Top Performer`;

    const certificateNo = await generateCertificateNumber();
    const defaultTitle = activity 
      ? `Certificate of Excellence - ${rankLabel} (${activity.title})`
      : `Certificate of Excellence - ${rankLabel}`;

    const defaultDesc = activity 
      ? `Conferred with highest distinction for outstanding photographic mastery, creative vision, and securing ${rankLabel} in the ${activity.title} workshop.`
      : `Conferred with highest distinction for outstanding photographic mastery and ranking among the elite top performers.`;

    const certificate = await prisma.certificate.create({
      data: {
        certificateNo,
        studentId: student.id,
        studentName: student.user.name,
        branch: student.branch,
        title: title ? title.trim() : defaultTitle,
        description: description ? description.trim() : defaultDesc,
        activityId: activity ? activity.id : null,
        issuedById: req.user.id,
        status: 'ISSUED',
        deliveryType: 'PHYSICAL',
        certificateType: 'TOP_PERFORMER',
        isPhysical: true,
        isTopPerformer: true,
        rank: rankNum,
        physicalStatus: physicalStatus || 'READY_FOR_COLLECTION',
        physicalRemarks: physicalRemarks ? physicalRemarks.trim() : 'Official embossed parchment certificate with seal and commemorative medal',
        issuedDate: new Date()
      },
      include: {
        student: { include: { user: true } },
        activity: true,
        issuedBy: { select: { name: true } }
      }
    });

    if (activity) {
      await prisma.activity.update({
        where: { id: activity.id },
        data: { physicalCertsIssuedAt: new Date() }
      }).catch((e) => console.warn('Could not update physicalCertsIssuedAt:', e.message));
    }

    return res.status(201).json({
      success: true,
      message: `Physical Certificate of Excellence (${rankLabel}) successfully issued to ${student.user.name}!`,
      certificate
    });
  } catch (error) {
    console.error('Issue top performer physical certificate error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error issuing physical certificate' });
  }
};

/**
 * 14. ADMIN: 1-Click Auto-Issue Physical Certificates to All Top 3 Picks of an Activity
 */
export const issueTopPicksPhysicalCertificates = async (req, res) => {
  try {
    const { activityId } = req.body;

    if (!activityId) {
      return res.status(400).json({ success: false, message: 'Activity ID is required' });
    }

    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Find all Top Pick submissions for this activity
    const topPicks = await prisma.photoSubmission.findMany({
      where: {
        participation: { activityId },
        isTopPick: true
      },
      include: {
        participation: {
          include: {
            student: { include: { user: true } }
          }
        }
      },
      orderBy: { topPickRank: 'asc' }
    });

    if (topPicks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No Top Pick photos found for this activity yet. Please select Top Picks in Curate Top 3 Picks first.'
      });
    }

    const issued = [];
    for (const pick of topPicks) {
      const student = pick.participation.student;
      const rankNum = pick.topPickRank || (issued.length + 1);
      const rankLabel = rankNum === 1 ? '1st Place Winner' : rankNum === 2 ? '2nd Place Runner-Up' : rankNum === 3 ? '3rd Place Honor' : `Rank #${rankNum}`;

      // Check if this student already has a physical certificate for this activity
      const existing = await prisma.certificate.findFirst({
        where: {
          studentId: student.id,
          activityId: activity.id,
          isPhysical: true
        }
      });

      if (existing) continue; // skip already issued

      const certificateNo = await generateCertificateNumber();
      const cert = await prisma.certificate.create({
        data: {
          certificateNo,
          studentId: student.id,
          studentName: student.user.name,
          branch: student.branch,
          title: `Certificate of Excellence - ${rankLabel} (${activity.title})`,
          description: `Conferred with highest honors for photographic mastery, visual excellence, and securing ${rankLabel} in the ${activity.title} exhibition.`,
          activityId: activity.id,
          issuedById: req.user.id,
          status: 'ISSUED',
          deliveryType: 'PHYSICAL',
          certificateType: 'TOP_PERFORMER',
          isPhysical: true,
          isTopPerformer: true,
          rank: rankNum,
          physicalStatus: 'READY_FOR_COLLECTION',
          physicalRemarks: 'Official gold-foil parchment certificate with institutional seal & medal',
          issuedDate: new Date()
        },
        include: {
          student: { include: { user: true } },
          activity: true
        }
      });
      issued.push(cert);
    }

    await prisma.activity.update({
      where: { id: activity.id },
      data: { physicalCertsIssuedAt: new Date() }
    });

    return res.status(201).json({
      success: true,
      message: `Successfully issued ${issued.length} physical certificates to top performers!`,
      issuedCount: issued.length,
      certificates: issued
    });
  } catch (error) {
    console.error('Issue top picks physical certificates error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error issuing physical certificates' });
  }
};

/**
 * 15. ADMIN: Update Physical Certificate Dispatch / Delivery Status
 */
export const updatePhysicalCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { physicalStatus, physicalRemarks, isPhysical } = req.body;

    const existing = await prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        ...(physicalStatus && { physicalStatus }),
        ...(physicalRemarks !== undefined && { physicalRemarks: physicalRemarks ? physicalRemarks.trim() : null }),
        ...(isPhysical !== undefined && {
          isPhysical: Boolean(isPhysical),
          deliveryType: isPhysical ? 'PHYSICAL' : 'DIGITAL'
        })
      },
      include: {
        student: { include: { user: true } },
        activity: true
      }
    });

    return res.status(200).json({
      success: true,
      message: `Physical certificate status updated to "${updated.physicalStatus || 'Updated'}"!`,
      certificate: updated
    });
  } catch (error) {
    console.error('Update physical status error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error updating physical certificate status' });
  }
};

