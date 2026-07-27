
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth_store';
import { MdLogout, MdEdit } from 'react-icons/md';
import { authAPI } from '../../api/auth';
import { EditUserDialog } from '../shared/EditUserDialog';

export const NavBar = ({title, subtitle}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // API logout failed or already logged out; clean up client session regardless.
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
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

            {/* Right: User Info, Edit Profile, and Logout */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right hidden sm:block mr-2">
                  <p className="text-white font-medium text-sm">{user.full_name || user.name || user.email}</p>
                  <p className="text-blue-100 text-xs">{user.role}</p>
                </div>
              )}
              <button
                onClick={() => setIsEditDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors duration-200"
                title="Edit Profile"
              >
                <MdEdit size={18} />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
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

      <EditUserDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        user={user}
      />
    </>
  );
}