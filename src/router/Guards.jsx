import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth_store';

/**
 * AdminGuard restricts access to admin-only routes.
 */
export function AdminGuard({ children }) {
  const { role, isAuthenticated, isInitializing } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated || role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, role, isInitializing, navigate]);

  if (isInitializing || !isAuthenticated || role !== 'admin') {
    return null;
  }

  return children;
}

/**
 * StudentGuard restricts access to student-only routes.
 */
export function StudentGuard({ children }) {
  const { role, isAuthenticated, isInitializing } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated || role !== 'student') {
      navigate('/login');
    }
  }, [isAuthenticated, role, isInitializing, navigate]);

  if (isInitializing || !isAuthenticated || role !== 'student') {
    return null;
  }

  return children;
}
