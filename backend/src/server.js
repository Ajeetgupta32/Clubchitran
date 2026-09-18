import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (safe fallback for local proof photos and banners)
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'College Club Management API', timestamp: new Date() });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/certificates', certificateRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

import prisma from './config/db.js';
import { hashPassword } from './utils/tokenUtils.js';

const ensureAdminAccount = async () => {
  try {
    const adminEmail = 'admin@college.edu';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const passwordHash = await hashPassword('Admin@123');
      await prisma.user.create({
        data: {
          name: 'Dr. Rajesh Sharma (Dean / Admin)',
          email: adminEmail,
          passwordHash,
          role: 'ADMIN'
        }
      });
      console.log('Fixed Admin account ensured: admin@college.edu / Admin@123');
    }
  } catch (err) {
    console.error('Error ensuring admin account:', err.message);
  }
};

app.listen(PORT, async () => {
  await ensureAdminAccount();
  console.log(`=========================================`);
  console.log(`  College Club API Server Running         `);
  console.log(`  Port: ${PORT}                            `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});
