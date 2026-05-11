import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { AdminGuard, StudentGuard } from './Guards';
import { AdminLayout } from '../components/admin/AdminLayout';
import { StudentLayout } from '../components/student/StudentLayout';
import { Dashboard } from '../pages/admin/Dashboard';
import { Books } from '../pages/admin/Books';
import { Exams } from '../pages/admin/Exams';
import { Languages } from '../pages/admin/Languages';
import { Users } from '../pages/admin/Users';
import { BookDetails } from '../pages/student/BookDetails';
import { BrowseBooks } from '../pages/student/BrowseBooks';
import { BrowseExams } from '../pages/student/BrowseExams';
import { ExamDetails } from '../pages/student/ExamDetails';
import { TranslationStats } from '../pages/admin/TranslationStats';
import { AdminBookDetails } from '../pages/admin/AdminBookDetails';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        

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
    </Router>
  );
}
