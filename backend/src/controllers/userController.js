import prisma from '../config/db.js';
import { hashPassword } from '../utils/tokenUtils.js';

export const getStudents = async (req, res) => {
  try {
    const { branch, section, year, search } = req.query;

    const whereClause = {};

    if (req.user.role === 'COORDINATOR') {
      const coordinator = await prisma.coordinator.findUnique({
        where: { userId: req.user.id }
      });
      if (!coordinator) {
        return res.status(403).json({ success: false, message: 'Coordinator profile not found' });
      }
      whereClause.branch = coordinator.assignedBranch;
      if (coordinator.assignedSection) {
        whereClause.section = coordinator.assignedSection;
      }
    } else {
      if (branch && branch !== 'ALL') whereClause.branch = branch;
      if (section && section !== 'ALL') whereClause.section = section;
    }

    if (year && year !== 'ALL') whereClause.year = year;

    if (search) {
      whereClause.OR = [
        { studentId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy: [{ points: 'desc' }, { studentId: 'asc' }],
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true }
        },
        _count: {
          select: {
            participations: true
          }
        }
      }
    });

    const formatted = students.map((s) => ({
      id: s.id,
      userId: s.userId,
      studentId: s.studentId,
      name: s.user.name,
      email: s.user.email,
      branch: s.branch,
      section: s.section,
      year: s.year,
      semester: s.semester,
      phone: s.phone,
      points: s.points,
      awardStatus: s.awardStatus,
      joinedAt: s.user.createdAt,
      totalParticipations: s._count.participations
    }));

    return res.status(200).json({ success: true, count: formatted.length, students: formatted });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving students' });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { name, email, password, studentId, branch, section, year, semester, phone } = req.body;

    if (!name || !email || !password || !studentId || !branch || !section || !year || !semester) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const existingId = await prisma.student.findUnique({
      where: { studentId: studentId.trim() }
    });

    if (existingId) {
      return res.status(400).json({ success: false, message: 'Student ID / Roll Number already exists' });
    }

    let cleanPhone = null;
    if (phone) {
      cleanPhone = phone.trim().replace(/[\s-]/g, '');
      const existingPhone = await prisma.student.findFirst({
        where: { phone: cleanPhone }
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'This mobile number is already registered with another student account. Each student can register only once with their mobile number.'
        });
      }
    }

    const passwordHash = await hashPassword(password);

    const studentUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'STUDENT',
        student: {
          create: {
            studentId: studentId.trim(),
            branch: branch.trim(),
            section: section.trim().toUpperCase(),
            year: year.trim(),
            semester: semester.trim(),
            phone: cleanPhone,
            points: 0
          }
        }
      },
      include: {
        student: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: studentUser.student
    });
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ success: false, message: 'Error creating student' });
  }
};

export const updateStudentDetails = async (req, res) => {
  try {
    const { id } = req.params; // Student ID
    const { name, studentId, branch, section, year, semester, phone } = req.body;

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if new studentId conflicts
    if (studentId && studentId.trim() !== student.studentId) {
      const existingId = await prisma.student.findUnique({
        where: { studentId: studentId.trim() }
      });
      if (existingId) {
        return res.status(400).json({ success: false, message: 'Roll Number / Student ID is already in use by another student' });
      }
    }

    // Check if new phone conflicts
    let cleanPhone = undefined;
    if (phone !== undefined) {
      cleanPhone = phone ? phone.trim().replace(/[\s-]/g, '') : null;
      if (cleanPhone) {
        const existingPhone = await prisma.student.findFirst({
          where: {
            phone: cleanPhone,
            id: { not: id }
          }
        });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: 'This mobile number is already registered with another student account.'
          });
        }
      }
    }

    // Update user name if changed
    if (name && name.trim() !== student.user.name) {
      await prisma.user.update({
        where: { id: student.userId },
        data: { name: name.trim() }
      });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...(studentId && { studentId: studentId.trim() }),
        ...(branch && { branch: branch.trim() }),
        ...(section && { section: section.trim().toUpperCase() }),
        ...(year && { year: year.trim() }),
        ...(semester && { semester: semester.trim() }),
        ...(phone !== undefined && { phone: cleanPhone })
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Update student details error:', error);
    return res.status(500).json({ success: false, message: 'Error updating student details' });
  }
};

export const getCoordinators = async (req, res) => {
  try {
    const coordinators = await prisma.coordinator.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedActivities: {
          include: {
            activity: { select: { id: true, title: true, status: true } }
          }
        }
      },
      orderBy: { user: { name: 'asc' } }
    });

    const formatted = coordinators.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.user.name,
      email: c.user.email,
      department: c.department,
      assignedBranch: c.assignedBranch,
      assignedSection: c.assignedSection,
      phone: c.phone,
      assignedActivities: c.assignedActivities.map((a) => a.activity)
    }));

    return res.status(200).json({ success: true, coordinators: formatted });
  } catch (error) {
    console.error('Get coordinators error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving coordinators' });
  }
};

/**
 * Admin promotes an existing Student to Coordinator and assigns ONE Branch
 */
export const promoteStudentToCoordinator = async (req, res) => {
  try {
    const { studentId, assignedBranch, assignedSection } = req.body;

    if (!studentId || !assignedBranch) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and the assigned branch are required.'
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Atomic promotion:
    // 1. Change user role to COORDINATOR
    // 2. Create or update Coordinator record with the single assignedBranch
    const coordinator = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: student.userId },
        data: { role: 'COORDINATOR' }
      });

      return tx.coordinator.upsert({
        where: { userId: student.userId },
        create: {
          userId: student.userId,
          department: assignedBranch.trim(),
          assignedBranch: assignedBranch.trim(),
          assignedSection: assignedSection ? assignedSection.trim().toUpperCase() : null,
          phone: student.phone
        },
        update: {
          department: assignedBranch.trim(),
          assignedBranch: assignedBranch.trim(),
          assignedSection: assignedSection ? assignedSection.trim().toUpperCase() : null
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: `Successfully promoted ${student.user.name} to Coordinator for branch '${assignedBranch.trim()}'.`,
      coordinator
    });
  } catch (error) {
    console.error('Promote student to coordinator error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error promoting student' });
  }
};

/**
 * Admin creates a new Coordinator from scratch with assigned branch
 */
export const createCoordinator = async (req, res) => {
  try {
    const { name, email, password, assignedBranch, department, assignedSection, phone } = req.body;
    const targetBranch = (assignedBranch || department)?.trim();

    if (!name || !email || !password || !targetBranch) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and assigned branch are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const coordinatorUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'COORDINATOR',
        coordinator: {
          create: {
            department: targetBranch,
            assignedBranch: targetBranch,
            assignedSection: assignedSection ? assignedSection.trim().toUpperCase() : null,
            phone: phone ? phone.trim() : null
          }
        }
      },
      include: {
        coordinator: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Coordinator created successfully',
      coordinator: coordinatorUser.coordinator
    });
  } catch (error) {
    console.error('Create coordinator error:', error);
    return res.status(500).json({ success: false, message: 'Error creating coordinator' });
  }
};

/**
 * Branch student strength breakdown for Admin filters
 * Example: CSE -> 120 Students (Sec A: 40, Sec B: 42, Sec C: 38)
 */
export const getBranchStudentStrength = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      select: { branch: true, section: true }
    });

    const strengthMap = {};

    for (const s of students) {
      const b = s.branch || 'Unassigned';
      const sec = s.section || 'A';

      if (!strengthMap[b]) {
        strengthMap[b] = {
          branch: b,
          totalStudents: 0,
          sections: {}
        };
      }

      strengthMap[b].totalStudents += 1;
      strengthMap[b].sections[sec] = (strengthMap[b].sections[sec] || 0) + 1;
    }

    return res.status(200).json({
      success: true,
      strength: strengthMap
    });
  } catch (error) {
    console.error('Get branch strength error:', error);
    return res.status(500).json({ success: false, message: 'Error calculating branch strength' });
  }
};

export const getBranchesAndSections = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      select: { branch: true, section: true, year: true }
    });

    const defaultBranches = [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Communication Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering'
    ];

    const defaultSections = ['A', 'B', 'C', 'D'];
    const defaultYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    const branches = Array.from(new Set([...defaultBranches, ...students.map((s) => s.branch).filter(Boolean)]));
    const sections = Array.from(new Set([...defaultSections, ...students.map((s) => s.section).filter(Boolean)]));
    const years = Array.from(new Set([...defaultYears, ...students.map((s) => s.year).filter(Boolean)]));

    return res.status(200).json({
      success: true,
      branches,
      sections,
      years
    });
  } catch (error) {
    console.error('Get branches error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching branches and sections' });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: name.trim() }
      });
    }

    if (phone !== undefined) {
      const cleanPhone = phone ? phone.trim().replace(/[\s-]/g, '') : null;
      if (cleanPhone) {
        const existingPhone = await prisma.student.findFirst({
          where: {
            phone: cleanPhone,
            id: { not: student.id }
          }
        });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: 'This mobile number is already registered with another student account.'
          });
        }
      }

      await prisma.student.update({
        where: { id: student.id },
        data: { phone: cleanPhone }
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { student: true }
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updated
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

/**
 * Admin Reset / Change User Password
 * If a student or coordinator forgot their password, Admin can set a new password.
 */
export const resetUserPasswordByAdmin = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return res.status(200).json({
      success: true,
      message: `Password updated successfully for ${user.name} (${user.email}).`
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    return res.status(500).json({ success: false, message: 'Error updating user password' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id }, { userId: id }]
      },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    await prisma.user.delete({
      where: { id: student.userId }
    });

    return res.status(200).json({
      success: true,
      message: `Student account for ${student.user?.name || 'student'} deleted successfully`
    });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error deleting student' });
  }
};

export const deleteCoordinator = async (req, res) => {
  try {
    const { id } = req.params;

    const coordinator = await prisma.coordinator.findFirst({
      where: {
        OR: [{ id }, { userId: id }]
      },
      include: { user: true }
    });

    if (!coordinator) {
      return res.status(404).json({ success: false, message: 'Coordinator not found' });
    }

    await prisma.user.delete({
      where: { id: coordinator.userId }
    });

    return res.status(200).json({
      success: true,
      message: `Coordinator account for ${coordinator.user?.name || 'coordinator'} deleted successfully`
    });
  } catch (error) {
    console.error('Delete coordinator error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error deleting coordinator' });
  }
};
