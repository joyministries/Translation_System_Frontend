import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { AdminGuard } from './Guards';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Dashboard } from '../pages/admin/Dashboard';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
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
          {/* FE2 Routes: Books, Exams, Languages, Stats will be added here */}
        </Route>

        {/* Student Routes - Placeholder for FE1 */}
        <Route path="/student/*" element={<Navigate to="/login" />} />

        {/* Default redirect to admin */}
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </Router>
  );
}
