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

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoading(true);
        // Fetch real translation stats from API
        const response = await adminAPI.translations.getStats();

        console.log('Stats response:', response);

        // Handle different response formats
        let langStats = [];
        let dailyStats = [];

        if (response.data) {
          // axios response format
          if (response.data.languageStats) langStats = response.data.languageStats;
          if (response.data.dailyStats) dailyStats = response.data.dailyStats;
        } else {
          // Direct response format
          if (response.languageStats) langStats = response.languageStats;
          if (response.dailyStats) dailyStats = response.dailyStats;
        }

        setLanguageData(Array.isArray(langStats) ? langStats : []);
        setDailyData(Array.isArray(dailyStats) ? dailyStats : []);

        if (langStats.length === 0 || dailyStats.length === 0) {
          console.warn('No stats data returned from API');
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast.error('Failed to load statistics');
        // Set empty arrays on error instead of using mock data
        setLanguageData([]);
        setDailyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  const hasLanguageData = languageData && languageData.length > 0;
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
          Top 10 Languages by Translation Count
        </h2>

        {!loading && hasLanguageData ? (
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={languageData}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="language"
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
                <Bar
                  dataKey="translations"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Translations"
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
              <p className="text-gray-500 text-lg">No translation activity yet.</p>
              <p className="text-gray-400 text-sm mt-1">
                Start translating to see language statistics.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Daily Translation Trend Chart */}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Translations</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {languageData.reduce((sum, item) => sum + (item.translations || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Languages Supported</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {languageData.length}
          </p>
        </div>
      </div>
    </div>
  );
}
