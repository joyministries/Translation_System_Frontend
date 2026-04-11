import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from './NavBar';

export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isBooksPage = location.pathname.includes('browse') && !location.pathname.includes('exams') || location.pathname.includes('book/');
  const isExamsPage = location.pathname.includes('browse-exams') || location.pathname.includes('exam/');

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar 
        title="Team Impact Christian University"
        subtitle="Book and Exam translation platform"
      />
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-content align-items centergap-1">
            <button
              onClick={() => navigate('/student/browse')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                isBooksPage
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              All Books
            </button>
            <button
              onClick={() => navigate('/student/browse-exams')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                isExamsPage
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              All Exams
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}
