import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import AdminLayout from './components/layouts/AdminLayout';
import CoordinatorLayout from './components/layouts/CoordinatorLayout';
import StudentLayout from './components/layouts/StudentLayout';

// Public & Auth Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PublicGalleryPage from './pages/public/PublicGalleryPage';
import PublicActivitiesPage from './pages/public/PublicActivitiesPage';
import PublicLeaderboardPage from './pages/public/PublicLeaderboardPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminActivities from './pages/admin/AdminActivities';
import AdminStudents from './pages/admin/AdminStudents';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminTopPicks from './pages/admin/AdminTopPicks';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';

// Coordinator Pages
import CoordDashboard from './pages/coordinator/CoordDashboard';
import CoordActivities from './pages/coordinator/CoordActivities';
import CoordSubmissions from './pages/coordinator/CoordSubmissions';
import CoordAttendance from './pages/coordinator/CoordAttendance';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentActivities from './pages/student/StudentActivities';
import StudentSubmissions from './pages/student/StudentSubmissions';
import StudentProfile from './pages/student/StudentProfile';

// Certificate Management Pages
import AdminCertificates from './pages/admin/AdminCertificates';
import { CoordCertificates } from './pages/coordinator/CoordCertificates';
import { StudentCertificates } from './pages/student/StudentCertificates';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500
            }
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<PublicGalleryPage />} />
          <Route path="/activities" element={<PublicActivitiesPage />} />
          <Route path="/leaderboard" element={<PublicLeaderboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/activities" element={<AdminActivities />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/submissions" element={<AdminSubmissions />} />
              <Route path="/admin/top-picks" element={<AdminTopPicks />} />
              <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
              <Route path="/admin/certificates" element={<AdminCertificates />} />
            </Route>
          </Route>

          {/* Coordinator Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['COORDINATOR']} />}>
            <Route element={<CoordinatorLayout />}>
              <Route path="/coordinator/dashboard" element={<CoordDashboard />} />
              <Route path="/coordinator/activities" element={<CoordActivities />} />
              <Route path="/coordinator/submissions" element={<CoordSubmissions />} />
              <Route path="/coordinator/attendance" element={<CoordAttendance />} />
              <Route path="/coordinator/certificates" element={<CoordCertificates />} />
            </Route>
          </Route>

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/activities" element={<StudentActivities />} />
              <Route path="/student/submissions" element={<StudentSubmissions />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/certificates" element={<StudentCertificates />} />
            </Route>
          </Route>

          {/* Catch all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
