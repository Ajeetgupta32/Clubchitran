import prisma from '../config/db.js';
import { generateAttendanceExcel } from '../utils/excelGenerator.js';

export const getAttendanceList = async (req, res) => {
  try {
    const { role } = req.user;
    const { activityId, branch, section, year, search } = req.query;

    const whereClause = {
      status: 'PRESENT'
    };

    if (activityId && activityId !== 'ALL') {
      whereClause.participation = {
        activityId
      };
    }

    if (role === 'STUDENT') {
      whereClause.participation = {
        ...(whereClause.participation || {}),
        student: { userId: req.user.id }
      };
    } else if (role === 'COORDINATOR') {
      // Coordinator can ONLY view attendance for their single assigned branch!
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
      // Student filters (branch, section, year, search) for Admin
      const studentFilter = {};
      if (branch && branch !== 'ALL') studentFilter.branch = branch;
      if (section && section !== 'ALL') studentFilter.section = section;
      if (year && year !== 'ALL') studentFilter.year = year;

      if (Object.keys(studentFilter).length > 0) {
        whereClause.participation = {
          ...(whereClause.participation || {}),
          student: {
            ...(whereClause.participation?.student || {}),
            ...studentFilter
          }
        };
      }
    }

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

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { markedAt: 'desc' },
      include: {
        markedBy: { select: { id: true, name: true, role: true } },
        participation: {
          include: {
            activity: true,
            student: {
              include: { user: { select: { name: true, email: true } } }
            },
            submissions: {
              where: { status: 'VERIFIED' },
              take: 1,
              orderBy: { verifiedAt: 'desc' }
            }
          }
        }
      }
    });

    const formatted = attendances.map((att) => {
      const p = att.participation;
      const s = p.student;
      const verifiedSub = p.submissions[0];

      return {
        id: att.id,
        attendanceStatus: 'Present',
        markedAt: att.markedAt,
        markedByName: att.markedBy?.name || 'System Admin',
        studentId: s.studentId,
        studentName: s.user.name,
        studentEmail: s.user.email,
        branch: s.branch,
        section: s.section,
        year: s.year,
        semester: s.semester,
        activityId: p.activity.id,
        activityName: p.activity.title,
        activityDate: p.activity.eventDate,
        venue: p.activity.venue,
        photoProofUrl: verifiedSub?.photoUrl || null
      };
    });

    return res.status(200).json({ success: true, count: formatted.length, attendances: formatted });
  } catch (error) {
    console.error('Get attendance list error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving attendance records' });
  }
};

export const exportAttendanceExcel = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { role } = req.user;
    const { branch, section } = req.query;

    if (!activityId) {
      return res.status(400).json({ success: false, message: 'Activity ID is required for export' });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        coordinators: true
      }
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    let branchRestriction = null;
    let sectionRestriction = null;

    // Strict Coordinator Branch & Section Restriction:
    // Coordinator can generate reports ONLY for their assigned branch and section!
    if (role === 'COORDINATOR') {
      const coordinator = await prisma.coordinator.findUnique({
        where: { userId: req.user.id }
      });

      if (!coordinator) {
        return res.status(403).json({ success: false, message: 'Coordinator record not found' });
      }

      branchRestriction = coordinator.assignedBranch;
      sectionRestriction = coordinator.assignedSection || null;
    } else if (role === 'ADMIN') {
      if (branch && branch !== 'ALL') branchRestriction = branch;
      if (section && section !== 'ALL') sectionRestriction = section;
    }

    const studentFilter = {};
    if (branchRestriction) studentFilter.branch = branchRestriction;
    if (sectionRestriction) studentFilter.section = sectionRestriction;

    // Fetch verified attendance records
    const attendances = await prisma.attendance.findMany({
      where: {
        participation: {
          activityId,
          ...(Object.keys(studentFilter).length > 0 ? { student: studentFilter } : {})
        },
        status: 'PRESENT'
      },
      include: {
        participation: {
          include: {
            student: {
              include: { user: { select: { name: true } } }
            }
          }
        }
      },
      orderBy: {
        participation: {
          student: { studentId: 'asc' }
        }
      }
    });

    const attendees = attendances.map((att) => {
      const s = att.participation.student;
      return {
        studentId: s.studentId,
        studentName: s.user.name,
        branch: s.branch,
        section: s.section,
        year: s.year,
        semester: s.semester,
        yearSem: `${s.year} / ${s.semester}`,
        activityName: activity.title,
        activityDate: new Date(activity.eventDate).toLocaleDateString('en-GB'),
        attendanceStatus: 'Present'
      };
    });

    const filterTagParts = [];
    if (branchRestriction) filterTagParts.push(branchRestriction);
    if (sectionRestriction) filterTagParts.push(`Sec ${sectionRestriction}`);
    const filterTag = filterTagParts.length > 0 ? ` (${filterTagParts.join(' - ')})` : '';

    const workbook = await generateAttendanceExcel({
      activityTitle: `${activity.title}${filterTag}`,
      activityDate: new Date(activity.eventDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      category: activity.category,
      venue: activity.venue,
      attendees
    });

    const cleanTitle = activity.title.replace(/[^a-zA-Z0-9]/g, '_');
    const branchTag = branchRestriction ? `_${branchRestriction.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const sectionTag = sectionRestriction ? `_Sec${sectionRestriction}` : '';
    const filename = `Attendance_${cleanTitle}${branchTag}${sectionTag}_${Date.now()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export attendance excel error:', error);
    return res.status(500).json({ success: false, message: 'Error exporting Excel attendance report' });
  }
};
