import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';

export function Stats() {
  const navigate = useNavigate();
  const [languageData, setLanguageData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [translationStats, setTranslationStats] = useState(null);
  const [jobStats, setJobStats] = useState(null);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoading(true);
        // Fetch real translation stats from API
        const response = await adminAPI.translations.getStats();

        console.log('Stats response:', response);

        // The API returns data structure directly
        const data = response?.data || response;

        // Extract translations stats
        const translations = data.translations || null;
        const jobs = data.jobs || null;

        setTranslationStats(translations);
        setJobStats(jobs);

        // For backward compatibility with charts, create chart data
        const langStats = [];
        const dailyStats = [];

        if (translations) {
          Object.entries(translations).forEach(([key, value]) => {
            if (key !== 'total') {
              langStats.push({ language: key, translations: value });
            }
          });
        }

        setLanguageData(langStats);
        setDailyData(dailyStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast.error('Failed to load statistics');
        // Set empty values on error
        setLanguageData([]);
        setDailyData([]);
        setTranslationStats(null);
        setJobStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  const hasLanguageData = translationStats && (translationStats.completed > 0 || translationStats.failed > 0 || translationStats.pending > 0);
  const hasDailyData = dailyData && dailyData.length > 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
      >
        <MdArrowBack className="w-5 h-5" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>

      {/* Language Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Translation Status Overview
        </h2>

        {!loading && translationStats ? (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { status: 'Completed', count: translationStats.completed || 0 },
                  { status: 'Failed', count: translationStats.failed || 0 },
                  { status: 'Pending', count: translationStats.pending || 0 },
                ]}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="status"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [value, 'Count']}
                  labelStyle={{ color: '#111827' }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Translation Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-3" />
              <p className="text-gray-600">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-500 text-lg">No translation data available.</p>
              <p className="text-gray-400 text-sm mt-1">
                Start translating to see statistics.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Daily Translation Trend Chart - Hidden if no daily data */}
      {hasDailyData && (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Translation Activity (Last 14 Days)
        </h2>

        {!loading && hasDailyData ? (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyData}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [value, 'Translations']}
                  labelStyle={{ color: '#111827' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="translations"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Daily Translations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-3" />
              <p className="text-gray-600">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-500 text-lg">No translation activity yet.</p>
              <p className="text-gray-400 text-sm mt-1">
                Start translating to see daily trends.
              </p>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Translations</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {translationStats?.total || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {translationStats?.completed || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Failed</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {translationStats?.failed || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {translationStats?.pending || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Jobs</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {jobStats?.total || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
