import prisma from '../config/db.js';
import { processUpload } from '../middleware/uploadMiddleware.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

export const uploadPhotoSubmission = async (req, res) => {
  try {
    const { activityId, caption } = req.body;

    if (!activityId) {
      return res.status(400).json({ success: false, message: 'Activity ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo proof is required' });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(403).json({ success: false, message: 'Only students can submit photo proofs' });
    }

    // Ensure student is registered for this activity
    let participation = await prisma.participation.findUnique({
      where: {
        studentId_activityId: {
          studentId: student.id,
          activityId
        }
      }
    });

    // If not registered yet, auto-register them if activity is published and deadline permits
    if (!participation) {
      const activity = await prisma.activity.findUnique({ where: { id: activityId } });
      if (!activity || activity.status !== 'PUBLISHED') {
        return res.status(400).json({ success: false, message: 'Activity is not active for submissions' });
      }

      participation = await prisma.participation.create({
        data: {
          studentId: student.id,
          activityId,
          status: 'REGISTERED'
        }
      });
    }

    // Process photo upload (Cloudinary or local storage fallback)
    const uploadResult = await processUpload(req.file, 'college_club/proofs');

    // Create the submission record. Notice: Attendance is STRICTLY NOT created here!
    const submission = await prisma.photoSubmission.create({
      data: {
        participationId: participation.id,
        photoUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        caption: caption ? caption.trim() : null,
        status: 'PENDING',
        rejectionReason: null
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Photo submitted successfully! Your submission is now Pending verification.',
      submission
    });
  } catch (error) {
    console.error('Upload photo submission error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error submitting photograph' });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { role } = req.user;
    const { activityId, status, search, branch, section } = req.query;

    const whereClause = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (activityId && activityId !== 'ALL') {
      whereClause.participation = {
        activityId
      };
    }

    if (role === 'STUDENT') {
      // Students only view their own submissions
      whereClause.participation = {
        ...(whereClause.participation || {}),
        student: { userId: req.user.id }
      };
    } else if (role === 'COORDINATOR') {
      // Coordinator is strictly locked to their single assigned branch!
      const coordinator = await prisma.coordinator.findUnique({
        where: { userId: req.user.id }
      });

      if (!coordinator) {
        return res.status(404).json({ success: false, message: 'Coordinator profile not found' });
      }

      whereClause.participation = {
        ...(whereClause.participation || {}),
        student: {
          branch: coordinator.assignedBranch,
          ...(coordinator.assignedSection ? { section: coordinator.assignedSection } : {})
        }
      };
    } else if (role === 'ADMIN') {
      // Admin can filter by branch and section
      const studentFilter = {};
      if (branch && branch !== 'ALL') studentFilter.branch = branch;
      if (section && section !== 'ALL') studentFilter.section = section;

      if (Object.keys(studentFilter).length > 0) {
        whereClause.participation = {
          ...(whereClause.participation || {}),
          student: studentFilter
        };
      }
    }

    // If searching student name or studentId (for Admin and Coordinator)
    if (search && role !== 'STUDENT') {
      whereClause.participation = {
        ...(whereClause.participation || {}),
        student: {
          ...(whereClause.participation?.student || {}),
          OR: [
            { studentId: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } }
          ]
        }
      };
    }

    const submissions = await prisma.photoSubmission.findMany({
      where: whereClause,
      orderBy: { submittedAt: 'desc' },
      include: {
        participation: {
          include: {
            activity: {
              select: { id: true, title: true, eventDate: true, venue: true, category: true }
            },
            student: {
              include: {
                user: { select: { name: true, email: true } }
              }
            },
            attendance: true
          }
        },
        verifiedBy: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    const formatted = submissions.map((sub) => ({
      id: sub.id,
      photoUrl: sub.photoUrl,
      caption: sub.caption,
      status: sub.status,
      rejectionReason: sub.rejectionReason,
      isTopPick: sub.isTopPick,
      topPickRank: sub.topPickRank,
      submittedAt: sub.submittedAt,
      verifiedAt: sub.verifiedAt,
      verifiedBy: sub.verifiedBy ? sub.verifiedBy.name : null,
      activityId: sub.participation.activity.id,
      activityTitle: sub.participation.activity.title,
      activityDate: sub.participation.activity.eventDate,
      venue: sub.participation.activity.venue,
      studentId: sub.participation.student.studentId,
      studentName: sub.participation.student.user.name,
      studentEmail: sub.participation.student.user.email,
      branch: sub.participation.student.branch,
      section: sub.participation.student.section,
      year: sub.participation.student.year,
      semester: sub.participation.student.semester,
      studentPoints: sub.participation.student.points,
      isAttendanceMarked: Boolean(sub.participation.attendance)
    }));

    return res.status(200).json({ success: true, submissions: formatted });
  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving submissions' });
  }
};

export const verifySubmission = async (req, res) => {
  try {
    const { id } = req.params; // Submission ID

    const submission = await prisma.photoSubmission.findUnique({
      where: { id },
      include: {
        participation: {
          include: {
            activity: true,
            student: {
              include: { user: { select: { name: true } } }
            }
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const studentBranch = submission.participation.student.branch;
    const studentSection = submission.participation.student.section;

    // Role check: If Coordinator, verify they are assigned to this student's branch and section!
    if (req.user.role === 'COORDINATOR') {
      const coordinator = await prisma.coordinator.findUnique({
        where: { userId: req.user.id }
      });

      const sectionMismatch = coordinator?.assignedSection && coordinator.assignedSection !== studentSection;
      if (!coordinator || coordinator.assignedBranch !== studentBranch || sectionMismatch) {
        return res.status(403).json({
          success: false,
          message: `Forbidden. You are assigned to coordinate branch '${coordinator?.assignedBranch}'${coordinator?.assignedSection ? ` (Section ${coordinator?.assignedSection})` : ''} only, but this student is in branch '${studentBranch}' (Section ${studentSection}).`
        });
      }
    }

    // Execute atomic transaction:
    // 1. Mark submission as VERIFIED
    // 2. Mark student as PRESENT in Attendance table
    // 3. Mark participation as COMPLETED
    // 4. Award +100 activity points to the student!
    const POINTS_PER_VERIFICATION = 100;

    const result = await prisma.$transaction(async (tx) => {
      const updatedSubmission = await tx.photoSubmission.update({
        where: { id },
        data: {
          status: 'VERIFIED',
          rejectionReason: null,
          verifiedById: req.user.id,
          verifiedAt: new Date()
        }
      });

      const attendance = await tx.attendance.upsert({
        where: { participationId: submission.participationId },
        update: {
          status: 'PRESENT',
          markedById: req.user.id,
          markedAt: new Date()
        },
        create: {
          participationId: submission.participationId,
          status: 'PRESENT',
          markedById: req.user.id,
          markedAt: new Date()
        }
      });

      await tx.participation.update({
        where: { id: submission.participationId },
        data: { status: 'COMPLETED' }
      });

      // Award student points
      const updatedStudent = await tx.student.update({
        where: { id: submission.participation.studentId },
        data: {
          points: { increment: POINTS_PER_VERIFICATION }
        }
      });

      return { updatedSubmission, attendance, updatedStudent };
    });

    return res.status(200).json({
      success: true,
      message: `Photograph verified! ${submission.participation.student.user.name} is marked Present and awarded +100 points.`,
      submission: result.updatedSubmission,
      attendance: result.attendance,
      studentPoints: result.updatedStudent.points
    });
  } catch (error) {
    console.error('Verify submission error:', error);
    return res.status(500).json({ success: false, message: 'Error verifying submission' });
  }
};

export const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required so the student knows what to correct'
      });
    }

    const submission = await prisma.photoSubmission.findUnique({
      where: { id },
      include: {
        participation: {
          include: {
            student: true
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const studentBranch = submission.participation.student.branch;
    const studentSection = submission.participation.student.section;

    // Role check: If Coordinator, verify they are assigned to this student's branch and section!
    if (req.user.role === 'COORDINATOR') {
      const coordinator = await prisma.coordinator.findUnique({
        where: { userId: req.user.id }
      });

      const sectionMismatch = coordinator?.assignedSection && coordinator.assignedSection !== studentSection;
      if (!coordinator || coordinator.assignedBranch !== studentBranch || sectionMismatch) {
        return res.status(403).json({
          success: false,
          message: `Forbidden. You are assigned to coordinate branch '${coordinator?.assignedBranch}'${coordinator?.assignedSection ? ` (Section ${coordinator?.assignedSection})` : ''} only, but this student is in branch '${studentBranch}' (Section ${studentSection}).`
        });
      }
    }

    // Atomic transaction to mark REJECTED and remove attendance if any
    const updatedSubmission = await prisma.$transaction(async (tx) => {
      // If attendance was previously created, remove it
      await tx.attendance.deleteMany({
        where: { participationId: submission.participationId }
      });

      return tx.photoSubmission.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason.trim(),
          isTopPick: false,
          topPickRank: null,
          verifiedById: req.user.id,
          verifiedAt: new Date()
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Photograph submission has been rejected. Student will be notified with your feedback.',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Reject submission error:', error);
    return res.status(500).json({ success: false, message: 'Error rejecting submission' });
  }
};

/**
 * Public endpoint to fetch the Top 3 student photos for the Home Page
 */
export const getTopPicks = async (req, res) => {
  try {
    const topPicks = await prisma.photoSubmission.findMany({
      where: {
        isTopPick: true,
        status: 'VERIFIED'
      },
      orderBy: { topPickRank: 'asc' },
      take: 3,
      include: {
        participation: {
          include: {
            activity: { select: { title: true, eventDate: true, category: true } },
            student: {
              include: { user: { select: { name: true } } }
            }
          }
        }
      }
    });

    const formatted = topPicks.map((pick) => ({
      id: pick.id,
      rank: pick.topPickRank,
      photoUrl: pick.photoUrl,
      caption: pick.caption,
      studentName: pick.participation.student.user.name,
      studentId: pick.participation.student.studentId,
      branch: pick.participation.student.branch,
      section: pick.participation.student.section,
      year: pick.participation.student.year,
      activityTitle: pick.participation.activity.title,
      activityCategory: pick.participation.activity.category,
      awardedAt: pick.topPickAwardedAt
    }));

    return res.status(200).json({ success: true, topPicks: formatted });
  } catch (error) {
    console.error('Get top picks error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving top photo picks' });
  }
};

/**
 * Admin endpoint to set/update the Top 3 photo picks
 * @param req.body.picks Array of { submissionId: string, rank: 1 | 2 | 3 }
 */
export const setTopPicks = async (req, res) => {
  try {
    const { picks } = req.body;

    if (!Array.isArray(picks)) {
      return res.status(400).json({ success: false, message: 'Picks must be an array of { submissionId, rank }' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Reset existing top picks
      await tx.photoSubmission.updateMany({
        where: { isTopPick: true },
        data: { isTopPick: false, topPickRank: null, topPickAwardedAt: null }
      });

      // 2. Assign new top picks
      for (const pick of picks) {
        if (pick.submissionId && pick.rank) {
          await tx.photoSubmission.update({
            where: { id: pick.submissionId },
            data: {
              isTopPick: true,
              topPickRank: Number(pick.rank),
              topPickAwardedAt: new Date()
            }
          });
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Top 3 Photo Picks updated successfully! Selected students will receive a Club Certificate.'
    });
  } catch (error) {
    console.error('Set top picks error:', error);
    return res.status(500).json({ success: false, message: 'Error updating Top 3 Photo Picks' });
  }
};

/**
 * Public Gallery: Retrieves ALL verified student photos with date and event/activity name
 */
export const getPublicGallerySubmissions = async (req, res) => {
  try {
    const { activityId, category, search } = req.query;

    const where = {
      status: 'VERIFIED'
    };

    if (activityId && activityId !== 'ALL') {
      where.participation = {
        activityId
      };
    }

    if (category && category !== 'ALL') {
      where.participation = {
        ...(where.participation || {}),
        activity: { category }
      };
    }

    if (search) {
      where.OR = [
        { caption: { contains: search, mode: 'insensitive' } },
        { participation: { activity: { title: { contains: search, mode: 'insensitive' } } } },
        { participation: { student: { user: { name: { contains: search, mode: 'insensitive' } } } } },
        { participation: { student: { branch: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const verifiedSubmissions = await prisma.photoSubmission.findMany({
      where,
      orderBy: { verifiedAt: 'desc' },
      include: {
        participation: {
          include: {
            activity: {
              select: { id: true, title: true, eventDate: true, venue: true, category: true }
            },
            student: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    const gallery = verifiedSubmissions.map((sub) => ({
      id: sub.id,
      photoUrl: sub.photoUrl,
      caption: sub.caption,
      submittedAt: sub.submittedAt,
      verifiedAt: sub.verifiedAt,
      isTopPick: sub.isTopPick,
      topPickRank: sub.topPickRank,
      activityId: sub.participation.activity.id,
      activityTitle: sub.participation.activity.title,
      activityCategory: sub.participation.activity.category,
      activityDate: sub.participation.activity.eventDate,
      venue: sub.participation.activity.venue,
      studentName: sub.participation.student.user.name,
      studentBranch: sub.participation.student.branch,
      studentSection: sub.participation.student.section,
      studentYear: sub.participation.student.year
    }));

    return res.status(200).json({
      success: true,
      count: gallery.length,
      gallery
    });
  } catch (error) {
    console.error('Get public gallery error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching gallery photos' });
  }
};

/**
 * Admin: Delete a photo submission completely
 */
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.photoSubmission.findUnique({
      where: { id },
      include: {
        participation: {
          include: {
            student: true,
            activity: true
          }
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Photo submission not found' });
    }

    // If it was verified and student was awarded points, adjust points
    if (existing.status === 'VERIFIED' && existing.participation?.student) {
      await prisma.student.update({
        where: { id: existing.participation.student.id },
        data: {
          points: {
            decrement: Math.min(existing.participation.student.points, 100)
          }
        }
      }).catch((e) => console.error('Error adjusting student points on delete:', e));

      // Remove attendance if no other verified photo for this participation
      const otherVerified = await prisma.photoSubmission.findFirst({
        where: {
          participationId: existing.participationId,
          id: { not: id },
          status: 'VERIFIED'
        }
      });

      if (!otherVerified) {
        await prisma.attendance.deleteMany({
          where: { participationId: existing.participationId }
        }).catch((e) => console.error('Error removing attendance on photo delete:', e));
      }
    }

    // Remove photo from Cloudinary if publicId exists
    if (existing.publicId && isCloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(existing.publicId);
      } catch (err) {
        console.warn('[Cloudinary] Error destroying image:', err.message);
      }
    }

    // Delete the photo submission record
    await prisma.photoSubmission.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Photo submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete photo submission error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error deleting photo submission' });
  }
};

