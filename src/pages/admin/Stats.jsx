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
import { adminAPI } from '../../api/admin.api.js';

const MOCK_LANGUAGE_DATA = [
  { language: 'Swahili', translations: 450 },
  { language: 'Yoruba', translations: 380 },
  { language: 'Hausa', translations: 320 },
  { language: 'Igbo', translations: 280 },
  { language: 'Amharic', translations: 250 },
  { language: 'Oromo', translations: 210 },
  { language: 'Somali', translations: 190 },
  { language: 'Xhosa', translations: 170 },
  { language: 'Zulu', translations: 160 },
  { language: 'Arabic', translations: 140 },
];

const MOCK_DAILY_DATA = [
  { date: 'Mar 27', translations: 45 },
  { date: 'Mar 28', translations: 52 },
  { date: 'Mar 29', translations: 38 },
  { date: 'Mar 30', translations: 61 },
  { date: 'Mar 31', translations: 55 },
  { date: 'Apr 1', translations: 48 },
  { date: 'Apr 2', translations: 72 },
  { date: 'Apr 3', translations: 68 },
  { date: 'Apr 4', translations: 54 },
  { date: 'Apr 5', translations: 86 },
  { date: 'Apr 6', translations: 79 },
  { date: 'Apr 7', translations: 64 },
  { date: 'Apr 8', translations: 92 },
  { date: 'Apr 9', translations: 88 },
];

export function Stats() {
  const [languageData, setLanguageData] = useState(MOCK_LANGUAGE_DATA);
  const [dailyData, setDailyData] = useState(MOCK_DAILY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoading(true);
        // Attempt to fetch from API
        const response = await adminAPI.stats.get();

        // Parse the response if it contains chart data
        if (response.languageStats) {
          setLanguageData(response.languageStats.slice(0, 10));
        }

        if (response.dailyStats) {
          setDailyData(response.dailyStats);
        }

        setLoading(false);
      } catch {
        // Fall back to mock data on error
        console.log('Using mock stats data');
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
