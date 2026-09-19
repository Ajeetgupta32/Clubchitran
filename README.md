# College Club Activity & Attendance Management System

A modern, responsive, full-stack college club activity and attendance management platform built with **React (Vite) + Tailwind CSS**, **Node.js (Express)**, **PostgreSQL (Prisma ORM)**, **JWT + bcrypt**, **Multer** (device filesystem storage), and **ExcelJS**.

---

## Key Features & User Roles

### 1. Admin
* **Full System Control**: Oversee all college activities, students, coordinators, and attendance.
* **Activity Lifecycle**: Create, edit, delete, and publish activities with banner photos, category, event date, registration deadline, and venue.
* **Coordinator Assignment**: Assign one or multiple faculty coordinators to supervise specific activities.
* **Photo Proof Verification**: Inspect uploaded student photographs with zoomable preview, approve to mark student **Present**, or reject with an explanatory reason.
* **Directory Management**: Register and filter students by Branch, Section, and Year; register club coordinators with department affiliations.
* **Excel Reporting**: Generate and download attendance `.xlsx` spreadsheets for any club activity.
* **Dashboard Analytics**: Live metrics on student enrollments, active activities, pending reviews, and verified attendance rates.

### 2. Coordinator
* **Assigned Activities Only**: Filtered access restricted to activities where the coordinator is assigned.
* **Submission Review**: View student photo submissions for assigned events.
* **Verification / Rejection**: Verify photographs to confirm presence, or reject with a required reason so the student knows what to correct.
* **Attendance & Excel**: View confirmed attendees and download official `.xlsx` attendance reports for assigned activities.

### 3. Student
* **Discover Activities**: Browse upcoming hackathons, workshops, cultural nights, and club events.
* **Register**: One-click event registration before deadlines (duplicate registration is prevented).
* **Proof Upload**: Upload photo proof (e.g. selfie at the venue with ID or project booth).
* **Live Status Tracking**: View submission status (`Pending Review`, `Verified`, or `Rejected`).
* **Re-upload Capability**: If rejected, view the coordinator's exact feedback and submit an updated photo proof.
* **Student Profile**: View academic profile (Roll Number, Department, Section, Year/Semester) and update contact information.

---

## Core Attendance Integrity Rule

> **Critical Rule**: Attendance is **NEVER** marked just because a photograph was uploaded. Uploading proof places the submission into `PENDING` state. Only when an Admin or assigned Coordinator **verifies and approves** the photo does the system atomically mark the student as **Present** and store the attendance record.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v3, React Router DOM v6, Lucide React, Axios, React Hot Toast |
| **Backend** | Node.js (ESM), Express.js, Prisma ORM, JWT, bcryptjs, Multer, ExcelJS, Morgan |
| **Database** | PostgreSQL 18 |
| **File Uploads** | Multer disk storage (stored directly on device in `uploads/` directory) |
| **Excel Reports** | ExcelJS (`.xlsx` formatted with headers, styles, auto-widths, and status pills) |

---

## Database Schema (Prisma)

```
Users ──(1:1)──► Students / Coordinators
  │
  ├──(1:N)──► Activities (Created by Admin)
  │             ▲
  │             └──(M:N)── ActivityCoordinators (Assigned)
  │
  └──(1:N)──► Participations (Unique: [studentId, activityId])
                │
                ├──(1:N)──► PhotoSubmissions (Pending / Verified / Rejected)
                │
                └──(1:1)──► Attendances (Present - Created only upon verification)
```

---

## Seed Accounts (Quick 1-Click Login)

The login page includes quick-fill buttons for all roles:

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Admin** | Dr. Rajesh Sharma | `admin@college.edu` | `Admin@123` | Dean / Super Admin |
| **Coordinator 1** | Prof. Priya Verma | `coordinator1@college.edu` | `Coord@123` | Computer Science & Engineering |
| **Coordinator 2** | Prof. Vikram Malhotra | `coordinator2@college.edu` | `Coord@123` | Electronics & Communication |
| **Student 1** | Aarav Patel | `student1@college.edu` | `Student@123` | Roll: 2023CSE0101 (Verified Present) |
| **Student 2** | Ananya Iyer | `student2@college.edu` | `Student@123` | Roll: 2023ECE0204 (Proof Pending Review) |
| **Student 3** | Rohan Gupta | `student3@college.edu` | `Student@123` | Roll: 2024IT0302 (Proof Rejected with Reason) |

---

## Excel Attendance Report Format

The exported `.xlsx` file generated via ExcelJS includes:
1. **Institution Banner**: Navy Blue header with event title and metadata.
2. **Formatted Columns**:
   * Student ID
   * Student Name
   * Branch
   * Section
   * Year / Semester
   * Activity Name
   * Activity Date
   * Attendance Status (Present badge)
3. **Summary Row**: Total verified present count.

---

## How to Run Locally

### 1. Prerequisites
* Node.js v18+ (tested on Node v22)
* PostgreSQL running on port 5432

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev
# Backend runs on http://localhost:5050
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Access the Application
Open your browser at [http://localhost:5173](http://localhost:5173) and log in using any demo account or register a new student account.
