import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

// Admin Guard - Check if user is admin
export function AdminGuard({ children }) {
  const { role, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (role !== 'admin') {
    navigate('/login');
    return null;
  }

  return children;
}

// Student Guard - Check if user is student
export function StudentGuard({ children }) {
  const { role, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (role !== 'student') {
    navigate('/login');
    return null;
  }

  return children;
}
