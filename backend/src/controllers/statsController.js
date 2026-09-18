import prisma from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const { branch, section, year, activityId, submissionStatus, attendanceStatus } = req.query;

    // Apply optional branch filter
    const studentWhere = {};
    if (branch && branch !== 'ALL') studentWhere.branch = branch;
    if (section && section !== 'ALL') studentWhere.section = section;
    if (year && year !== 'ALL') studentWhere.year = year;

    const [
      totalStudents,
      totalCoordinators,
      totalActivities,
      publishedActivities,
      pendingSubmissions,
      verifiedSubmissions,
      rejectedSubmissions,
      totalAttendances
    ] = await Promise.all([
      prisma.student.count({ where: studentWhere }),
      prisma.coordinator.count(),
      prisma.activity.count(),
      prisma.activity.count({ where: { status: 'PUBLISHED' } }),
      prisma.photoSubmission.count({
        where: {
          status: 'PENDING',
          ...(Object.keys(studentWhere).length > 0 ? { participation: { student: studentWhere } } : {})
        }
      }),
      prisma.photoSubmission.count({
        where: {
          status: 'VERIFIED',
          ...(Object.keys(studentWhere).length > 0 ? { participation: { student: studentWhere } } : {})
        }
      }),
      prisma.photoSubmission.count({
        where: {
          status: 'REJECTED',
          ...(Object.keys(studentWhere).length > 0 ? { participation: { student: studentWhere } } : {})
        }
      }),
      prisma.attendance.count({
        where: {
          status: 'PRESENT',
          ...(Object.keys(studentWhere).length > 0 ? { participation: { student: studentWhere } } : {})
        }
      })
    ]);

    const totalParticipations = await prisma.participation.count({
      where: Object.keys(studentWhere).length > 0 ? { student: studentWhere } : {}
    });

    const attendanceRate = totalParticipations > 0 
      ? Math.round((totalAttendances / totalParticipations) * 100) 
      : 0;

    const recentActivities = await prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { participations: true } },
        coordinators: {
          include: {
            coordinator: {
              include: { user: { select: { name: true } } }
            }
          }
        }
      }
    });

    const categoryStats = await prisma.activity.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalCoordinators,
        totalActivities,
        publishedActivities,
        pendingSubmissions,
        verifiedSubmissions,
        rejectedSubmissions,
        totalAttendances,
        attendanceRate,
        recentActivities: recentActivities.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          status: a.status,
          eventDate: a.eventDate,
          participantCount: a._count.participations,
          coordinators: a.coordinators.map((c) => c.coordinator.user.name)
        })),
        categoryBreakdown: categoryStats.map((c) => ({
          category: c.category,
          count: c._count.id
        }))
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving admin statistics' });
  }
};

export const getCoordinatorStats = async (req, res) => {
  try {
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: req.user.id }
    });

    if (!coordinator) {
      return res.status(404).json({ success: false, message: 'Coordinator not found' });
    }

    const assignedBranch = coordinator.assignedBranch;
    const assignedSection = coordinator.assignedSection;

    const studentFilter = {
      branch: assignedBranch,
      ...(assignedSection ? { section: assignedSection } : {})
    };

    // Assigned activities or activities with students in coordinator's assigned branch/section
    const assignedActivities = await prisma.activityCoordinator.findMany({
      where: { coordinatorId: coordinator.id },
      include: {
        activity: {
          include: {
            _count: {
              select: {
                participations: {
                  where: { student: studentFilter }
                }
              }
            }
          }
        }
      }
    });

    // Counts strictly restricted to coordinator's assigned branch and section!
    const [branchStudentsCount, pendingSubmissions, verifiedSubmissions, rejectedSubmissions, totalAttendances] = await Promise.all([
      prisma.student.count({
        where: studentFilter
      }),
      prisma.photoSubmission.count({
        where: {
          status: 'PENDING',
          participation: { student: studentFilter }
        }
      }),
      prisma.photoSubmission.count({
        where: {
          status: 'VERIFIED',
          participation: { student: studentFilter }
        }
      }),
      prisma.photoSubmission.count({
        where: {
          status: 'REJECTED',
          participation: { student: studentFilter }
        }
      }),
      prisma.attendance.count({
        where: {
          status: 'PRESENT',
          participation: { student: studentFilter }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        assignedBranch,
        assignedSection: assignedSection || null,
        branchStudentsCount,
        totalAssignedActivities: assignedActivities.length,
        pendingSubmissions,
        verifiedSubmissions,
        rejectedSubmissions,
        totalAttendances,
        assignedActivities: assignedActivities.map((a) => ({
          id: a.activity.id,
          title: a.activity.title,
          category: a.activity.category,
          eventDate: a.activity.eventDate,
          status: a.activity.status,
          participantCount: a.activity._count.participations
        }))
      }
    });
  } catch (error) {
    console.error('Get coordinator stats error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving coordinator statistics' });
  }
};

export const getStudentStats = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const participations = await prisma.participation.findMany({
      where: { studentId: student.id },
      include: {
        activity: true,
        attendance: true,
        submissions: {
          orderBy: { submittedAt: 'desc' },
          take: 1
        }
      }
    });

    const totalEnrolled = participations.length;
    const totalPresent = participations.filter((p) => Boolean(p.attendance)).length;
    const pendingProofs = participations.filter(
      (p) => p.submissions[0]?.status === 'PENDING'
    ).length;
    const rejectedProofs = participations.filter(
      (p) => p.submissions[0]?.status === 'REJECTED'
    ).length;

    return res.status(200).json({
      success: true,
      stats: {
        points: student.points,
        awardStatus: student.awardStatus,
        totalEnrolled,
        totalPresent,
        pendingProofs,
        rejectedProofs,
        attendanceRate: totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 100) : 0,
        recentParticipations: participations.map((p) => ({
          activityId: p.activity.id,
          title: p.activity.title,
          category: p.activity.category,
          eventDate: p.activity.eventDate,
          registeredAt: p.registeredAt,
          submissionStatus: p.submissions[0]?.status || 'NOT_SUBMITTED',
          rejectionReason: p.submissions[0]?.rejectionReason || null,
          photoUrl: p.submissions[0]?.photoUrl || null,
          isPresent: Boolean(p.attendance)
        }))
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving student statistics' });
  }
};

/**
 * Public or authenticated Leaderboard of top students ranked by points
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { branch, limit = 20 } = req.query;

    const whereClause = {};
    if (branch && branch !== 'ALL') {
      whereClause.branch = branch;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy: [{ points: 'desc' }, { createdAt: 'asc' }],
      take: Number(limit),
      include: {
        user: { select: { name: true, email: true } },
        _count: {
          select: {
            participations: {
              where: { attendance: { isNot: null } }
            }
          }
        }
      }
    });

    const leaderboard = students.map((s, index) => ({
      rank: index + 1,
      id: s.id,
      studentId: s.studentId,
      name: s.user.name,
      email: s.user.email,
      branch: s.branch,
      section: s.section,
      year: s.year,
      points: s.points,
      awardStatus: s.awardStatus,
      verifiedActivitiesCount: s._count.participations
    }));

    return res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving leaderboard' });
  }
};

/**
 * Admin updates points and award recognition status for a student
 */
export const updateStudentPointsAndAward = async (req, res) => {
  try {
    const { id } = req.params; // Student ID
    const { points, awardStatus, pointsDelta, reason } = req.body;

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const updateData = {};
    if (points !== undefined) {
      updateData.points = Number(points);
    } else if (pointsDelta !== undefined) {
      updateData.points = { increment: Number(pointsDelta) };
    }

    if (awardStatus !== undefined) {
      updateData.awardStatus = awardStatus ? awardStatus.trim() : null;
    }

    const updated = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Points/Award status updated for ${student.user.name}`,
      student: updated
    });
  } catch (error) {
    console.error('Update points and award error:', error);
    return res.status(500).json({ success: false, message: 'Error updating student points' });
  }
};
