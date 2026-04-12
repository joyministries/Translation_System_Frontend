import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth_store';

// Admin Guard - Check if user is admin
export function AdminGuard({ children }) {
  const { role, isAuthenticated, isInitializing } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while initializing auth from localStorage
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role !== 'admin') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, role, isInitializing, navigate]);

  // Show nothing while initializing
  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated || role !== 'admin') {
    return null;
  }

  return children;
}

// Student Guard - Check if user is student
export function StudentGuard({ children }) {
  const { role, isAuthenticated, isInitializing } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while initializing auth from localStorage
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role !== 'student') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, role, isInitializing, navigate]);

  // Show nothing while initializing
  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated || role !== 'student') {
    return null;
  }

  return children;
}
