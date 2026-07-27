import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminGuard, StudentGuard } from './Guards';
import { Spinner } from '../components/shared/Spinner';

// Lazy-load page components
const Login = lazy(() => import('../pages/auth/Login').then(m => ({ default: m.Login })));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const VerifyPasswordChange = lazy(() => import('../pages/auth/VerifyPasswordChange').then(m => ({ default: m.VerifyPasswordChange })));
const AdminLayout = lazy(() => import('../components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const StudentLayout = lazy(() => import('../components/student/StudentLayout').then(m => ({ default: m.StudentLayout })));
const Dashboard = lazy(() => import('../pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const Books = lazy(() => import('../pages/admin/Books').then(m => ({ default: m.Books })));
const Exams = lazy(() => import('../pages/admin/Exams').then(m => ({ default: m.Exams })));
const Languages = lazy(() => import('../pages/admin/Languages').then(m => ({ default: m.Languages })));
const Users = lazy(() => import('../pages/admin/Users').then(m => ({ default: m.Users })));
const BookDetails = lazy(() => import('../pages/student/BookDetails').then(m => ({ default: m.BookDetails })));
const BrowseBooks = lazy(() => import('../pages/student/BrowseBooks').then(m => ({ default: m.BrowseBooks })));
const BrowseExams = lazy(() => import('../pages/student/BrowseExams').then(m => ({ default: m.BrowseExams })));
const ExamDetails = lazy(() => import('../pages/student/ExamDetails').then(m => ({ default: m.ExamDetails })));
const TranslationStats = lazy(() => import('../pages/admin/TranslationStats').then(m => ({ default: m.TranslationStats })));
const AdminBookDetails = lazy(() => import('../pages/admin/AdminBookDetails').then(m => ({ default: m.AdminBookDetails })));
const AdminExamDetails = lazy(() => import('../pages/admin/AdminExamDetails').then(m => ({ default: m.AdminExamDetails })));

export function AppRouter() {
  return (
    <Router>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50"><Spinner /></div>}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<ResetPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/set-password" element={<ResetPassword />} />
          <Route path="/verify-password-change" element={<VerifyPasswordChange />} />
          <Route path="/auth/change-password/confirm" element={<VerifyPasswordChange />} />
          <Route path="/auth/verify-password-change" element={<VerifyPasswordChange />} />
          <Route path="/auth/confirm-password-change" element={<VerifyPasswordChange />} />


          {/* Admin Routes*/}
          <Route
            path="/admin/*"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="books" element={<Books />} />
            <Route path="exams" element={<Exams />} />
            <Route path="languages" element={<Languages />} />
            <Route path="users" element={<Users />} />
            <Route path="translation-stats" element={<TranslationStats />} />
            <Route path="book/:bookId" element={<AdminBookDetails />} />
            <Route path="exam/:examId" element={<AdminExamDetails />} />

          </Route>

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <StudentGuard>
                <StudentLayout />
              </StudentGuard>
            }
          >
            <Route path="browse" element={<BrowseBooks />} />
            <Route path="book/:bookId" element={<BookDetails />} />
            <Route path="browse-exams" element={<BrowseExams />} />
            <Route path="exam/:examId" element={<ExamDetails />} />
          </Route>

          {/* Default redirect */}
          <Route path="/admin/" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/student/" element={<Navigate to="/student/browse" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
