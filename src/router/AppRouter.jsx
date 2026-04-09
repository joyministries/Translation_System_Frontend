import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { AdminGuard, StudentGuard } from './Guards';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Dashboard } from '../pages/admin/Dashboard';
import { StudentLayout } from '../components/student/StudentLayout';
import { Books } from '../pages/student/Books';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          {/* FE2 Routes: Add Books, Exams, Languages, Stats here */}
        </Route>

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <StudentGuard>
              <StudentLayout>
                <Outlet />
              </StudentLayout>
            </StudentGuard>
          }
        >
          <Route path="books" element={<Books />} />
          {/* FE1 Routes: Add BookDetail, TranslationViewer here */}
        </Route>

        {/* Default redirect to student books */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
