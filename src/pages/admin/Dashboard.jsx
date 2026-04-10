import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin.api.js';
import { Skeleton } from '../../components/shared/Spinner';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useAuthStore } from '../../store/auth.store';

function StatCard({ title, value, icon, loading }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

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

function ActivityItem({ title, subtitle, status, bgColor }) {
  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-800',
    processing: 'bg-blue-100 text-blue-800',
    pending: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalTranslationJobs: 0,
    activeLanguages: 0,
    jobsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch stats function
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.stats.get();
      setStats({
        totalBooks: response.totalBooks || 0,
        totalTranslationJobs: response.totalTranslationJobs || 0,
        activeLanguages: response.activeLanguages || 0,
        jobsToday: response.jobsToday || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Mock data for demo
      setStats({
        totalBooks: 143,
        totalTranslationJobs: 1247,
        activeLanguages: 10,
        jobsToday: 23,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchStats();

    // Set auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);

    return () => clearInterval(interval);
  }, []);

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
        <p className="text-gray-600 mt-2">Monitor and manage educational content across 3 institutions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Books"
          value={stats.totalBooks}
          icon="📚"
          loading={loading}
        />
        <StatCard
          title="Total Translation Jobs"
          value={stats.totalTranslationJobs}
          icon="🔄"
          loading={loading}
        />
        <StatCard
          title="Active Languages"
          value={stats.activeLanguages}
          icon="🌐"
          loading={loading}
        />
        <StatCard
          title="Jobs Today"
          value={stats.jobsToday}
          icon="⏱️"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
          <div className="space-y-1">
            <ActivityItem
              title="Introduction to Biology"
              subtitle="Book"
              status="completed"
            />
            <ActivityItem
              title="Mathematics Final Exam"
              subtitle="Exam"
              status="processing"
            />
            <ActivityItem
              title="Chemistry Essentials"
              subtitle="Book"
              status="completed"
            />
          </div>
        </div>

        {/* Translation Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Translation Activity</h3>
          <div className="space-y-1">
            <ActivityItem
              title="Swahili"
              subtitle="45 translations"
              status="completed"
            />
            <ActivityItem
              title="Yoruba"
              subtitle="23 translations"
              status="processing"
            />
            <ActivityItem
              title="Hausa"
              subtitle="31 translations"
              status="completed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

