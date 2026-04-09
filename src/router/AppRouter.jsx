import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { AdminGuard, StudentGuard } from './Guards';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Dashboard } from '../pages/admin/Dashboard';

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

        {/* Student Routes - Placeholder for FE1 */}
        <Route path="/student/*" element={<Navigate to="/login" />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
