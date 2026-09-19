import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting College Club Database Seeding ---');

  // Clear existing records in reverse dependency order
  await prisma.attendance.deleteMany();
  await prisma.photoSubmission.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.activityCoordinator.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.student.deleteMany();
  await prisma.coordinator.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash('Ajeetgupta123@', 10);
  const coordPasswordHash = await bcrypt.hash('Coord@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Ajeet Gupta (Tech Head) ',
      email: 'gulshangupta3124@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });
  console.log('Created Admin:', admin.email);

  // 2. Create Coordinators with single branch restriction
  const coord1User = await prisma.user.create({
    data: {
      name: 'Prof. Priya Verma',
      email: 'coordinator1@college.edu',
      passwordHash: coordPasswordHash,
      role: 'COORDINATOR',
      coordinator: {
        create: {
          department: 'Computer Science & Engineering',
          assignedBranch: 'Computer Science & Engineering',
          phone: '+91 98765 43210'
        }
      }
    },
    include: { coordinator: true }
  });

  const coord2User = await prisma.user.create({
    data: {
      name: 'Prof. Vikram Malhotra',
      email: 'coordinator2@college.edu',
      passwordHash: coordPasswordHash,
      role: 'COORDINATOR',
      coordinator: {
        create: {
          department: 'Electronics & Communication Engineering',
          assignedBranch: 'Electronics & Communication Engineering',
          phone: '+91 98765 43211'
        }
      }
    },
    include: { coordinator: true }
  });
  console.log('Created Coordinators:', coord1User.email, coord2User.email);

  // 3. Create Students with points and awards
  const student1User = await prisma.user.create({
    data: {
      name: 'Aarav Patel',
      email: 'student1@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      student: {
        create: {
          studentId: '2023CSE0101',
          branch: 'Computer Science & Engineering',
          section: 'A',
          year: '3rd Year',
          semester: '5th Sem',
          phone: '+91 91234 56780',
          points: 350,
          awardStatus: 'Monthly Star: Certificate & Gift Winner'
        }
      }
    },
    include: { student: true }
  });

  const student2User = await prisma.user.create({
    data: {
      name: 'Ananya Iyer',
      email: 'student2@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      student: {
        create: {
          studentId: '2023ECE0204',
          branch: 'Electronics & Communication Engineering',
          section: 'B',
          year: '3rd Year',
          semester: '5th Sem',
          phone: '+91 91234 56781',
          points: 240,
          awardStatus: 'Certificate of Excellence'
        }
      }
    },
    include: { student: true }
  });

  const student3User = await prisma.user.create({
    data: {
      name: 'Rohan Gupta',
      email: 'student3@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      student: {
        create: {
          studentId: '2024IT0302',
          branch: 'Information Technology',
          section: 'A',
          year: '2nd Year',
          semester: '3rd Sem',
          phone: '+91 91234 56782',
          points: 150,
          awardStatus: null
        }
      }
    },
    include: { student: true }
  });

  const student4User = await prisma.user.create({
    data: {
      name: 'Sneha Reddy',
      email: 'student4@college.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      student: {
        create: {
          studentId: '2024ME0412',
          branch: 'Mechanical Engineering',
          section: 'C',
          year: '2nd Year',
          semester: '3rd Sem',
          phone: '+91 91234 56783',
          points: 110,
          awardStatus: null
        }
      }
    },
    include: { student: true }
  });
  console.log('Created 4 Students with initial activity points');

  // 4. Create Activities
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const hackathon = await prisma.activity.create({
    data: {
      title: 'National Hackathon & Innovation Summit 2026',
      description: '36-hour flagship college hackathon exploring Generative AI, Sustainable Tech, and Smart IoT solutions. Teams build prototypes and pitch to industry experts.',
      category: 'Technical',
      venue: 'APJ Abdul Kalam Auditorium & CS Lab 4',
      eventDate: yesterday,
      deadline: yesterday,
      status: 'PUBLISHED',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
      createdById: admin.id,
      coordinators: {
        create: [
          { coordinatorId: coord1User.coordinator.id }
        ]
      }
    }
  });

  const roboticsWorkshop = await prisma.activity.create({
    data: {
      title: 'Autonomous Robotics & ROS2 Hands-on Workshop',
      description: 'A deep-dive technical workshop on Robot Operating System 2 (ROS2), sensor integration with LiDAR and ultrasonic sensors, and autonomous obstacle navigation.',
      category: 'Technical',
      venue: 'Robotics & Mechatronics Lab (Block B)',
      eventDate: nextWeek,
      deadline: new Date(nextWeek.getTime() - 2 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED',
      bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
      createdById: admin.id,
      coordinators: {
        create: [
          { coordinatorId: coord2User.coordinator.id }
        ]
      }
    }
  });

  const culturalFest = await prisma.activity.create({
    data: {
      title: 'Tarang: Annual Cultural Night & Battle of the Bands',
      description: 'The premier inter-college musical and cultural extravaganza featuring live rock band competitions, classical dance performances, and theater showcase under the stars.',
      category: 'Cultural',
      venue: 'Open Air Amphitheatre',
      eventDate: nextMonth,
      deadline: new Date(nextMonth.getTime() - 3 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED',
      bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
      createdById: admin.id,
      coordinators: {
        create: [
          { coordinatorId: coord1User.coordinator.id },
          { coordinatorId: coord2User.coordinator.id }
        ]
      }
    }
  });

  // 5. Participations & Submissions
  // 5a. Student 1: Aarav Patel -> VERIFIED & Marked PRESENT -> TOP PICK #1 (Gold)
  const part1 = await prisma.participation.create({
    data: {
      studentId: student1User.student.id,
      activityId: hackathon.id,
      status: 'COMPLETED'
    }
  });

  await prisma.photoSubmission.create({
    data: {
      participationId: part1.id,
      photoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
      caption: 'Present at team booth 14 presenting the AI Smart Campus Prototype.',
      status: 'VERIFIED',
      verifiedById: coord1User.id,
      verifiedAt: new Date(),
      isTopPick: true,
      topPickRank: 1,
      topPickAwardedAt: new Date()
    }
  });

  await prisma.attendance.create({
    data: {
      participationId: part1.id,
      status: 'PRESENT',
      markedById: coord1User.id,
      markedAt: new Date()
    }
  });

  // 5b. Student 2: Ananya Iyer -> Participated in Robotics -> VERIFIED & Marked PRESENT -> TOP PICK #2 (Silver)
  const part2a = await prisma.participation.create({
    data: {
      studentId: student2User.student.id,
      activityId: roboticsWorkshop.id,
      status: 'COMPLETED'
    }
  });

  await prisma.photoSubmission.create({
    data: {
      participationId: part2a.id,
      photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      caption: 'Configured the ultrasonic sensor array and calibrated the servo motors during the live hardware lab.',
      status: 'VERIFIED',
      verifiedById: coord2User.id,
      verifiedAt: new Date(),
      isTopPick: true,
      topPickRank: 2,
      topPickAwardedAt: new Date()
    }
  });

  await prisma.attendance.create({
    data: {
      participationId: part2a.id,
      status: 'PRESENT',
      markedById: coord2User.id,
      markedAt: new Date()
    }
  });

  // 5c. Student 4: Sneha Reddy -> Participated in Hackathon -> VERIFIED & Marked PRESENT -> TOP PICK #3 (Bronze)
  const part4 = await prisma.participation.create({
    data: {
      studentId: student4User.student.id,
      activityId: hackathon.id,
      status: 'COMPLETED'
    }
  });

  await prisma.photoSubmission.create({
    data: {
      participationId: part4.id,
      photoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      caption: 'Collaborative code sprint at Hackathon Hall B working on the green logistics dashboard.',
      status: 'VERIFIED',
      verifiedById: coord1User.id,
      verifiedAt: new Date(),
      isTopPick: true,
      topPickRank: 3,
      topPickAwardedAt: new Date()
    }
  });

  await prisma.attendance.create({
    data: {
      participationId: part4.id,
      status: 'PRESENT',
      markedById: coord1User.id,
      markedAt: new Date()
    }
  });

  // 5d. Student 2: Ananya Iyer -> Also registered for Hackathon -> PENDING PROOF
  const part2b = await prisma.participation.create({
    data: {
      studentId: student2User.student.id,
      activityId: hackathon.id,
      status: 'REGISTERED'
    }
  });

  await prisma.photoSubmission.create({
    data: {
      participationId: part2b.id,
      photoUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      caption: 'At the Hackathon registration desk with project badge.',
      status: 'PENDING'
    }
  });

  // 5e. Student 3: Rohan Gupta -> REJECTED PROOF with reason
  const part3 = await prisma.participation.create({
    data: {
      studentId: student3User.student.id,
      activityId: hackathon.id,
      status: 'REGISTERED'
    }
  });

  await prisma.photoSubmission.create({
    data: {
      participationId: part3.id,
      photoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      caption: 'Attendance proof photograph taken inside hall.',
      status: 'REJECTED',
      rejectionReason: 'Photograph is blurry and face is obscured. Please re-upload a clear selfie taken at the registration desk with your ID card clearly visible.',
      verifiedById: coord1User.id,
      verifiedAt: new Date()
    }
  });

  console.log('--- Database seeding finished successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
