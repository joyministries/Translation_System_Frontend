import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { Skeleton } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';
import toast from 'react-hot-toast';

function StatCard({ title, value, icon, loading }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          )}
        </div>
        <span className="text-4xl opacity-20">{icon}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalTranslations: 0,
    activeLanguages: 0,
    recentJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.stats.get();
      setStats({
        totalBooks: response.totalBooks || 0,
        totalTranslations: response.totalTranslations || 0,
        activeLanguages: response.activeLanguages || 0,
        recentJobs: response.jobsToday || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load statistics');
      // Set placeholder values for demo
      setStats({
        totalBooks: 12,
        totalTranslations: 284,
        activeLanguages: 18,
        recentJobs: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchStats}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Books"
          value={stats.totalBooks}
          icon="📚"
          loading={loading}
        />
        <StatCard
          title="Total Translations"
          value={stats.totalTranslations}
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
          value={stats.recentJobs}
          icon="📊"
          loading={loading}
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <EmptyState
          icon="📋"
          title="No Recent Activity"
          description="Upload books or manage languages to see activity here"
        />
      </div>
    </div>
  );
}
