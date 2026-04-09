import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../shared/Button';

export function StudentLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Translation System</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{user?.name || 'Student'}</p>
              <p className="text-primary-100 text-xs">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="secondary"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
