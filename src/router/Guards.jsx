import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

// Admin Guard - Check if user is admin
export function AdminGuard({ children }) {
  const { role, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role !== 'admin') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, role, navigate]);

  if (!isAuthenticated || role !== 'admin') {
    return null;
  }

  return children;
}

// Student Guard - Check if user is student
export function StudentGuard({ children }) {
  const { role, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role !== 'student') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, role, navigate]);

  if (!isAuthenticated || role !== 'student') {
    return null;
  }

  return children;
}
