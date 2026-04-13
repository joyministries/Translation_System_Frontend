import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useAuthStore } from '../../store/auth_store.jsx';

function QuickActionButton({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg p-6 font-semibold transition-all hover:shadow-lg active:scale-95"
    >
      <div className="text-3xl mb-3">{icon}</div>
      {label}
    </button>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();


  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
      >
        <MdArrowBack className="w-5 h-5" />
        Back
      </button>

      {/* Welcome Section */}
      <div className="bg-white rounded-lg border-l-4 border-blue-500 shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</h2>
        <p className="text-gray-600 mt-2">Here's a summary of your system.</p>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <QuickActionButton
            label="Upload Book"
            icon="📤"
            onClick={() => navigate('/admin/books')}
          />
          <QuickActionButton
            label="Import Exams"
            icon="📋"
            onClick={() => navigate('/admin/exams')}
          />
          <QuickActionButton
            label="Import Answer Keys"
            icon="🔑"
            onClick={() => navigate('/admin/answer-keys')}
          />
          <QuickActionButton
            label="Content Library"
            icon="📚"
            onClick={() => navigate('/admin/content-library')}
          />
          <QuickActionButton
            label="Manage Users"
            icon="👥"
            onClick={() => navigate('/admin/users')}
          />
          <QuickActionButton
            label="Manage Languages"
            icon="🌐"
            onClick={() => navigate('/admin/languages')}
          />
          <QuickActionButton
            label="View Analytics"
            icon="📊"
            onClick={() => navigate('/admin/stats')}
          />
          <QuickActionButton
            label="Manage Institutions"
            icon="🏫"
            onClick={() => navigate('/admin/institutions')}
          />
        </div>
      </div>
    </div>
  );
}

