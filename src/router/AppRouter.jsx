import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { AdminGuard, StudentGuard } from './Guards';
import { AdminLayout } from '../components/admin/AdminLayout';
import { StudentLayout } from '../components/student/StudentLayout';
import { Dashboard } from '../pages/admin/Dashboard';
import { Books } from '../pages/admin/Books';
import { Exams } from '../pages/admin/Exams';
import { AnswerKeys } from '../pages/admin/AnswerKeys';
import { Languages } from '../pages/admin/Languages';
import { Stats } from '../pages/admin/Stats';
import { Institutions } from '../pages/admin/Institutions';
import { StudentDashboard } from '../pages/student/StudentDashbboard';
import { BookDetails } from '../pages/student/BookDetails';
import { BrowseBooks } from '../pages/student/BrowseBooks';
import { MyExams } from '../pages/student/MyExams';
import { BrowseExams } from '../pages/student/BrowseExams';
import { ExamDetails } from '../pages/student/ExamDetails';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        

        {/* Admin Routes (FE2) */}
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
          <Route path="answer-keys" element={<AnswerKeys />} />
          <Route path="languages" element={<Languages />} />
          <Route path="stats" element={<Stats />} />
          <Route path="institutions" element={<Institutions />} />
          {/* FE2 Routes: Additional pages will be added here */}
        </Route>

        {/* Student Routes (FE1) */}
        <Route
          path="/student/*"
          element={
            <StudentGuard>
              <StudentLayout />
            </StudentGuard>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="browse" element={<BrowseBooks />} />
          <Route path="book/:bookId" element={<BookDetails />} />
          <Route path="my-exams" element={<MyExams />} />
          <Route path="browse-exams" element={<BrowseExams />} />
          <Route path="exam/:examId" element={<ExamDetails />} />
          {/* FE1 Routes: Active Translations, History, Profile will be added here */}
        </Route>

        {/* Default redirect */}
        <Route path="/admin/" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/student/" element={<Navigate to="/student/dashboard" />} />
      </Routes>
    </Router>
  );
}
