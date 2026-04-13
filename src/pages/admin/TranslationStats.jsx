import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';
import { CheckCircle, Activity, Globe, FileText, AlertCircle, RefreshCw, Download } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PIE_COLORS = ['#6366f1', '#eab308'];

export function TranslationStats() {
  const navigate = useNavigate();
  const [statsByContent, setStatsByContent] = useState(null);
  const [byStatus, setByStatus] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [overview, setOverview] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [recentFailures, setRecentFailures] = useState([]);
  const [translationsList, setTranslationsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoading(true);
        const [statsResponse, listResponse] = await Promise.all([
          adminAPI.translations.getStats(),
          adminAPI.translations.list().catch(err => {
            console.error('Failed to fetch translations list:', err);
            return { data: [] };
          })
        ]);

        const data = statsResponse.data;
        setJobs(data.jobs);
        setRecentFailures(data.recent_failures);
        setLanguages(data.top_languages);
        setStatsByContent(data.by_content_type);
        setByStatus(data.by_status);
        const listRaw = listResponse.data;
        console.log("listRaw", listRaw);
        const allTranslations = Array.isArray(listRaw) ? listRaw : (listRaw?.items || listRaw?.translations || []);

        // Filter to only show those 'done'/'completed' within the last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const filteredTranslations = allTranslations.filter(item => {
          const itemDate = new Date(item.created_at || new Date());
          return itemDate >= oneDayAgo;
        });

        setTranslationsList(filteredTranslations);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  const handleDownload = async (translationId) => {
    const toastId = toast.loading('Preparing download...');
    try {
      const { blob, filename } = await adminAPI.translations.download(translationId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `Translation_${translationId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!', { id: toastId });
    } catch (error) {
      toast.error('Failed to download file.', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  // Formatting Pie Chart Data
  const pieData = statsByContent
    ? Object.keys(statsByContent).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: statsByContent[key],
    }))
    : [];

  const totalStatus = byStatus
    ? (byStatus.completed || 0) + (byStatus.failed || 0) + (byStatus.pending || 0) + (byStatus.processing || 0)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-full rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-gray-200"
          >
            <MdArrowBack className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Translation Statistics</h1>
            <p className="text-gray-500 text-sm mt-1">Overview of your system's performance</p>
          </div>
        </div>
      </div>

      {/* Top Row: High-Level KPI Cards */}
      {overview && jobs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Translations</p>
              <h3 className="text-3xl font-bold text-gray-900">{overview.total_translations}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Success Rate</p>
              <h3 className="text-3xl font-bold text-emerald-600">{overview.success_rate}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 rounded-xl bg-purple-50 text-purple-600">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Jobs</p>
              <h3 className="text-3xl font-bold text-gray-900">{jobs.active}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Middle Row: Graphical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            By Content Type
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            Top Languages
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="language"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 13 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 13 }}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {languages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Status Breakdown & Recent Failures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Status Breakdown</h2>
          {byStatus && totalStatus > 0 ? (
            <div className="space-y-6">
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                <Tooltip title="Completed">
                  <div style={{ width: `${(byStatus.completed / totalStatus) * 100}%` }} className="h-full bg-emerald-500 transition-all duration-500 hover:opacity-90" />
                </Tooltip>
                {byStatus.processing > 0 && <div style={{ width: `${(byStatus.processing / totalStatus) * 100}%` }} className="h-full bg-blue-500 transition-all duration-500 hover:opacity-90" />}
                {byStatus.pending > 0 && <div style={{ width: `${(byStatus.pending / totalStatus) * 100}%` }} className="h-full bg-amber-400 transition-all duration-500 hover:opacity-90" />}
                {byStatus.failed > 0 && <div style={{ width: `${(byStatus.failed / totalStatus) * 100}%` }} className="h-full bg-red-500 transition-all duration-500 hover:opacity-90" />}
              </div>
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-gray-600">Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{byStatus.completed}</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Processing</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{byStatus.processing}</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-sm font-medium text-gray-600">Pending</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{byStatus.pending}</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-gray-600">Failed</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{byStatus.failed}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center border border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 text-sm">No status data available.</p>
            </div>
          )}
        </div>

        {/* Recent Failures */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
            Recent Failures
            <AlertCircle className="w-5 h-5 text-gray-400" />
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            {recentFailures && recentFailures.length > 0 ? (
              <ul className="w-full space-y-3">
                {recentFailures.map((failure, idx) => (
                  <li key={idx} className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
                    Job #{failure.id || idx} failed
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-gray-700 font-medium text-center">No recent failures to report</p>
                <p className="text-gray-500 text-sm text-center mt-1">Everything is running smoothly.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Translations List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Translations</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {translationsList.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Content Type</th>
                <th className="px-6 py-4 font-medium">Language</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium flex justify-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {translationsList.length > 0 ? (
                translationsList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">#{item.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium capitalize">{item.content_type || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.target_language}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${item.status === 'completed' || item.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                          item.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.created_at || new Date()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm flex justify-end">
                      {(item.status === 'completed' || item.status === 'done') ? (
                        <button
                          onClick={() => handleDownload(item.id || item.translation_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm px-3 py-1.5">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">No translations found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
