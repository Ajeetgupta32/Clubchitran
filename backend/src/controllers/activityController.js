import fs from 'fs';
import path from 'path';
import prisma from '../config/db.js';
import { processUpload, uploadDir } from '../middleware/uploadMiddleware.js';

export const createActivity = async (req, res) => {
  try {
    const { title, description, category, venue, eventDate, deadline, coordinatorIds } = req.body;

    if (!title || !description || !category || !venue || !eventDate || !deadline) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    let bannerUrl = null;
    if (req.file) {
      const uploadRes = await processUpload(req.file);
      bannerUrl = uploadRes.url;
    }

    const parsedCoordinatorIds = typeof coordinatorIds === 'string' 
      ? JSON.parse(coordinatorIds || '[]') 
      : (coordinatorIds || []);

    const activity = await prisma.activity.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        venue: venue.trim(),
        eventDate: new Date(eventDate),
        deadline: new Date(deadline),
        status: 'PUBLISHED', // Default to published for convenience, or DRAFT
        bannerUrl,
        createdById: req.user.id,
        coordinators: {
          create: parsedCoordinatorIds.map((coordId) => ({
            coordinator: { connect: { id: coordId } }
          }))
        }
      },
      include: {
        coordinators: {
          include: {
            coordinator: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error creating activity' });
  }
};

export const getActivities = async (req, res) => {
  try {
    const { role } = req.user;
    const { status, category, search } = req.query;

    const whereClause = {};

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role === 'STUDENT') {
      // Students only see published or completed activities
      whereClause.status = status || { in: ['PUBLISHED', 'COMPLETED'] };

      const activities = await prisma.activity.findMany({
        where: whereClause,
        orderBy: { eventDate: 'desc' },
        include: {
          coordinators: {
            include: {
              coordinator: {
                include: { user: { select: { name: true, email: true } } }
              }
            }
          },
          participations: {
            where: {
              student: { userId: req.user.id }
            },
            include: {
              submissions: {
                orderBy: { submittedAt: 'desc' },
                take: 1
              },
              attendance: true
            }
          },
          _count: {
            select: { participations: true }
          }
        }
      });

      // Format with student's current enrollment status
      const formatted = activities.map((act) => {
        const studentParticipation = act.participations[0] || null;
        const latestSubmission = studentParticipation?.submissions[0] || null;
        const isPresent = Boolean(studentParticipation?.attendance);

        return {
          ...act,
          isRegistered: Boolean(studentParticipation),
          participationId: studentParticipation?.id || null,
          submissionStatus: latestSubmission ? latestSubmission.status : null,
          latestSubmission,
          attendanceStatus: isPresent ? 'PRESENT' : null,
          participantCount: act._count.participations
        };
      });

      return res.status(200).json({ success: true, activities: formatted });
    }

    if (role === 'COORDINATOR') {
      // Coordinator can view assigned activities or all published activities
      const coordinatorRecord = await prisma.coordinator.findUnique({
        where: { userId: req.user.id }
      });

      if (!coordinatorRecord) {
        return res.status(404).json({ success: false, message: 'Coordinator profile not found' });
      }

      if (status) {
        whereClause.status = status;
      }

      // Filter by assignment
      const assignedOnly = req.query.assignedOnly !== 'false';
      if (assignedOnly) {
        whereClause.coordinators = {
          some: { coordinatorId: coordinatorRecord.id }
        };
      }

      const activities = await prisma.activity.findMany({
        where: whereClause,
        orderBy: { eventDate: 'desc' },
        include: {
          coordinators: {
            include: {
              coordinator: {
                include: { user: { select: { name: true, email: true } } }
              }
            }
          },
          _count: {
            select: { participations: true }
          }
        }
      });

      // Add submission summary stats for coordinator
      const activityIds = activities.map((a) => a.id);
      const pendingSubmissions = await prisma.photoSubmission.groupBy({
        by: ['participationId'],
        where: {
          status: 'PENDING',
          participation: { activityId: { in: activityIds } }
        }
      });

      const formatted = activities.map((act) => ({
        ...act,
        participantCount: act._count.participations,
        pendingSubmissionsCount: pendingSubmissions.filter((p) => p.participationId).length
      }));

      return res.status(200).json({ success: true, activities: formatted });
    }

    // Role === ADMIN
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { eventDate: 'desc' },
      include: {
        coordinators: {
          include: {
            coordinator: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        },
        createdBy: {
          select: { name: true, email: true }
        },
        _count: {
          select: { participations: true }
        }
      }
    });

    const formatted = activities.map((act) => ({
      ...act,
      participantCount: act._count.participations
    }));

    return res.status(200).json({ success: true, activities: formatted });
  } catch (error) {
    console.error('Get activities error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving activities' });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } },
        coordinators: {
          include: {
            coordinator: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        },
        _count: {
          select: { participations: true }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    let studentParticipation = null;
    if (req.user.role === 'STUDENT') {
      studentParticipation = await prisma.participation.findFirst({
        where: {
          activityId: id,
          student: { userId: req.user.id }
        },
        include: {
          submissions: {
            orderBy: { submittedAt: 'desc' },
            include: { verifiedBy: { select: { name: true, role: true } } }
          },
          attendance: true
        }
      });
    }

    return res.status(200).json({
      success: true,
      activity: {
        ...activity,
        participantCount: activity._count.participations,
        studentParticipation
      }
    });
  } catch (error) {
    console.error('Get activity by ID error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving activity details' });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, venue, eventDate, deadline, status, coordinatorIds } = req.body;

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    let bannerUrl = existing.bannerUrl;
    if (req.file) {
      const uploadRes = await processUpload(req.file);
      bannerUrl = uploadRes.url;

      // Clean up previous local banner if replaced
      if (existing.bannerUrl && existing.bannerUrl.startsWith('/uploads/')) {
        try {
          const oldFile = path.join(uploadDir, path.basename(existing.bannerUrl));
          if (fs.existsSync(oldFile)) {
            await fs.promises.unlink(oldFile);
          }
        } catch (e) {
          console.warn('[Storage] Error cleaning old banner:', e.message);
        }
      }
    }

    const dataToUpdate = {
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(category && { category: category.trim() }),
      ...(venue && { venue: venue.trim() }),
      ...(eventDate && { eventDate: new Date(eventDate) }),
      ...(deadline && { deadline: new Date(deadline) }),
      ...(status && { status }),
      bannerUrl
    };

    // If coordinators provided, update relation
    if (coordinatorIds !== undefined) {
      const parsedCoordinatorIds = typeof coordinatorIds === 'string'
        ? JSON.parse(coordinatorIds || '[]')
        : (coordinatorIds || []);

      // Delete existing assignments and reconnect
      await prisma.activityCoordinator.deleteMany({ where: { activityId: id } });

      if (parsedCoordinatorIds.length > 0) {
        dataToUpdate.coordinators = {
          create: parsedCoordinatorIds.map((coordId) => ({
            coordinator: { connect: { id: coordId } }
          }))
        };
      }
    }

    const updated = await prisma.activity.update({
      where: { id },
      data: dataToUpdate,
      include: {
        coordinators: {
          include: {
            coordinator: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      activity: updated
    });
  } catch (error) {
    console.error('Update activity error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error updating activity' });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    await prisma.$transaction(async (tx) => {
      // Unlink any certificates pointing to this activity
      await tx.certificate.updateMany({
        where: { activityId: id },
        data: { activityId: null }
      });

      // Unlink any certificate requests
      await tx.certificateRequest.updateMany({
        where: { activityId: id },
        data: { activityId: null }
      });

      // Find all participations
      const participations = await tx.participation.findMany({
        where: { activityId: id },
        select: { id: true }
      });
      const partIds = participations.map((p) => p.id);

      if (partIds.length > 0) {
        // Delete photo submissions
        await tx.photoSubmission.deleteMany({
          where: { participationId: { in: partIds } }
        });

        // Delete attendances
        await tx.attendance.deleteMany({
          where: { participationId: { in: partIds } }
        });

        // Delete participations
        await tx.participation.deleteMany({
          where: { id: { in: partIds } }
        });
      }

      // Delete coordinator assignments
      await tx.activityCoordinator.deleteMany({
        where: { activityId: id }
      });

      // Finally delete the activity
      await tx.activity.delete({ where: { id } });
    });

    // Clean up local banner image on device if stored locally
    if (existing.bannerUrl && existing.bannerUrl.startsWith('/uploads/')) {
      try {
        const bannerFile = path.join(uploadDir, path.basename(existing.bannerUrl));
        if (fs.existsSync(bannerFile)) {
          await fs.promises.unlink(bannerFile);
          console.log('[Storage] Deleted local banner file from device:', bannerFile);
        }
      } catch (err) {
        console.warn('[Storage] Error deleting local banner file:', err.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error deleting activity' });
  }
};

export const publishActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'PUBLISHED', 'COMPLETED', or 'DRAFT'

    const updated = await prisma.activity.update({
      where: { id },
      data: { status: status || 'PUBLISHED' }
    });

    return res.status(200).json({
      success: true,
      message: `Activity status updated to ${updated.status}`,
      activity: updated
    });
  } catch (error) {
    console.error('Publish activity error:', error);
    return res.status(500).json({ success: false, message: 'Error updating activity status' });
  }
};

export const registerForActivity = async (req, res) => {
  try {
    const { activityId } = req.body;

    if (!activityId) {
      return res.status(400).json({ success: false, message: 'Activity ID is required' });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(403).json({ success: false, message: 'Only registered students can participate' });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    if (activity.status !== 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'Activity is not open for registration' });
    }

    if (new Date() > new Date(activity.deadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    // Check duplicate participation
    const existing = await prisma.participation.findUnique({
      where: {
        studentId_activityId: {
          studentId: student.id,
          activityId
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this activity'
      });
    }

    const participation = await prisma.participation.create({
      data: {
        studentId: student.id,
        activityId,
        status: 'REGISTERED'
      },
      include: {
        activity: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for activity!',
      participation
    });
  } catch (error) {
    // Check for Prisma unique constraint code P2002
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this activity'
      });
    }
    console.error('Register for activity error:', error);
    return res.status(500).json({ success: false, message: 'Error registering for activity' });
  }
};

export const getPublicActivities = async (req, res) => {
  try {
    const { category, search } = req.query;

    const whereClause = {
      status: 'PUBLISHED'
    };

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } }
      ];
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { eventDate: 'asc' },
      include: {
        coordinators: {
          include: {
            coordinator: {
              include: { user: { select: { name: true } } }
            }
          }
        },
        _count: {
          select: { participations: true }
        }
      }
    });

    const formatted = activities.map((act) => ({
      id: act.id,
      title: act.title,
      description: act.description,
      category: act.category,
      venue: act.venue,
      eventDate: act.eventDate,
      deadline: act.deadline,
      bannerUrl: act.bannerUrl,
      participantCount: act._count.participations,
      coordinators: act.coordinators.map((c) => c.coordinator.user.name)
    }));

    return res.status(200).json({ success: true, activities: formatted });
  } catch (error) {
    console.error('Get public activities error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving public activities' });
  }
};

