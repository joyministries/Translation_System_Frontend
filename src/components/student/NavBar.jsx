
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { MdLogout } from 'react-icons/md';

export const NavBar = ({title, subtitle}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3 min-w-fit">
            <div className="text-white">
              <h1 className="text-xl font-bold leading-tight">{title}</h1>
              <p className="text-blue-100 text-sm">{subtitle}</p>
            </div>
          </div>


          {/* Right: User Info and Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right hidden sm:block mr-4">
                <p className="text-white font-medium text-sm">{user.name || user.email}</p>
                <p className="text-blue-100 text-xs">{user.role}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200"
              title="Logout"
            >
              <MdLogout size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );}