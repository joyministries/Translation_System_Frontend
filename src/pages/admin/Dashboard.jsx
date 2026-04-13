import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth_store.jsx';
import { adminAPI } from '../../api/admin.jsx';
import { 
  BookUp, 
  ClipboardList, 
  KeyRound, 
  Languages, 
  Users, 
  Globe2, 
  Building2, 
  CheckCircle2, 
  RefreshCw,
  BarChart3
} from 'lucide-react';

function QuickActionCard({ label, description, icon: Icon, onClick, colorTheme }) {
  const themeClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 group-hover:bg-blue-100',
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100',
    pink: 'from-pink-500 to-pink-600 text-pink-600 bg-pink-50 group-hover:bg-pink-100',
    amber: 'from-amber-500 to-amber-600 text-amber-600 bg-amber-50 group-hover:bg-amber-100',
    rose: 'from-rose-500 to-rose-600 text-rose-600 bg-rose-50 group-hover:bg-rose-100',
    sky: 'from-sky-500 to-sky-600 text-sky-600 bg-sky-50 group-hover:bg-sky-100',
  };

  const selectedTheme = themeClasses[colorTheme] || themeClasses.blue;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left active:scale-[0.98] overflow-hidden"
    >
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br ${selectedTheme.split(' ').slice(0, 2).join(' ')} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out`} />
      <div className={`inline-flex items-center justify-center p-4 rounded-xl mb-4 transition-colors duration-300 ${selectedTheme.split(' ').slice(2).join(' ')}`}>
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1 relative z-10">{label}</h3>
      <p className="text-sm text-gray-500 leading-relaxed font-medium relative z-10">{description}</p>
    </button>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ overview: null, jobs: null, loading: true });

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await adminAPI.translations.getStats();
        if (mounted) {
          setStats({
            overview: res.data.overview,
            jobs: res.data.jobs,
            loading: false
          });
        }
      } catch (error) {
        console.error('Failed to load summary stats', error);
        if (mounted) {
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
        </h1>
        <p className="text-gray-500 mt-2 font-medium text-lg">Manage your translation system and monitor overall progress.</p>
      </div>

      {/* KPI Stats Overview */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          System Overview
        </h2>
        
        {stats.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : (stats.overview && stats.jobs) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">Total Translations</p>
                  <h3 className="text-4xl font-black text-gray-900">{stats.overview.total_translations}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Globe2 className="w-6 h-6 stroke-[2]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">Success Rate</p>
                  <h3 className="text-4xl font-black text-emerald-600">{stats.overview.success_rate}</h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">Active Jobs</p>
                  <h3 className="text-4xl font-black text-purple-600">{stats.jobs.active}</h3>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <RefreshCw className="w-6 h-6 stroke-[2]" />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
      
      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-gray-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            label="Upload Book"
            description="Add new books to the repository for translation"
            icon={BookUp}
            colorTheme="blue"
            onClick={() => navigate('/admin/books')}
          />
          <QuickActionCard
            label="Import Exams"
            description="Upload multi-format examination templates"
            icon={ClipboardList}
            colorTheme="indigo"
            onClick={() => navigate('/admin/exams')}
          />
          <QuickActionCard
            label="Answer Keys"
            description="Manage grading criteria and answer key data"
            icon={KeyRound}
            colorTheme="emerald"
            onClick={() => navigate('/admin/answer-keys')}
          />
          <QuickActionCard
            label="Translations"
            description="View deep analytics and translation history"
            icon={Languages}
            colorTheme="pink"
            onClick={() => navigate('/admin/translation-stats')}
          />
          <QuickActionCard
            label="Users"
            description="Manage administrators and students access"
            icon={Users}
            colorTheme="amber"
            onClick={() => navigate('/admin/users')}
          />
          <QuickActionCard
            label="Languages"
            description="Enable or refine system language support"
            icon={Globe2}
            colorTheme="rose"
            onClick={() => navigate('/admin/languages')}
          />
          <QuickActionCard
            label="Institutions"
            description="Map schools to their respective material"
            icon={Building2}
            colorTheme="sky"
            onClick={() => navigate('/admin/institutions')}
          />
        </div>
      </section>
    </div>
  );
}

