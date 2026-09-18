import prisma from '../config/db.js';
import { comparePassword, hashPassword, generateToken } from '../utils/tokenUtils.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        student: true,
        coordinator: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        student: user.student,
        coordinator: user.coordinator
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        student: true,
        coordinator: {
          include: {
            assignedActivities: {
              include: {
                activity: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        student: user.student,
        coordinator: user.coordinator
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, studentId, branch, section, year, semester, phone } = req.body;

    if (!name || !email || !password || !studentId || !branch || !section || !year || !semester || !phone) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields, including mobile number' });
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const existingStudentId = await prisma.student.findUnique({
      where: { studentId: studentId.trim() }
    });

    if (existingStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID / Roll Number already registered' });
    }

    const existingPhone = await prisma.student.findFirst({
      where: { phone: cleanPhone }
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already registered with another student account. Each student can register only once with their mobile number.'
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
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
            phone: cleanPhone
          }
        }
      },
      include: {
        student: true
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        student: user.student
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};
