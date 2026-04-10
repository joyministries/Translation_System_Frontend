import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from './NavBar';

export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isDashboard = location.pathname.includes('dashboard');
  const isBooksPage = location.pathname.includes('browse') && !location.pathname.includes('exams');
  const isBookDetails = location.pathname.includes('book/');
  const isExamsPage = location.pathname.includes('browse-exams');
  const isExamDetails = location.pathname.includes('exam/');
  const isMyExams = location.pathname.includes('my-exams');

  // Show tabs for books and exams related pages
  const showBooksTabs = isDashboard || isBooksPage || isBookDetails;
  const showExamsTabs = isMyExams || isExamsPage || isExamDetails;
  const showAnyTabs = showBooksTabs || showExamsTabs;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar 
        title="Team Impact Christian University"
        subtitle="Book and Exam translation platform"
      />
      
      {/* Navigation Tabs */}
      {showAnyTabs && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-content align-items centergap-1">
              {/* Books Tabs */}
              {showBooksTabs && (
                <>
                  <button
                    onClick={() => navigate('/student/dashboard')}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                      isDashboard
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My Library
                  </button>
                  <button
                    onClick={() => navigate('/student/browse')}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                      isBooksPage || isBookDetails
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Browse Books
                  </button>
                </>
              )}

              {/* Exams Tabs */}
              {showExamsTabs && (
                <>
                  <button
                    onClick={() => navigate('/student/my-exams')}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                      isMyExams
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My Exams
                  </button>
                  <button
                    onClick={() => navigate('/student/browse-exams')}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                      isExamsPage || isExamDetails
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Browse Exams
                  </button>
                </>
              )}

              {/* Separator */}
              {showBooksTabs && showExamsTabs && <div className="border-l border-slate-200 mx-4 my-2"></div>}

              {/* Switch Section Buttons */}
              {!showExamsTabs && showBooksTabs && (
                <button
                  onClick={() => navigate('/student/my-exams')}
                  className="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-colors"
                >
                  View Exams
                </button>
              )}
              
              {!showBooksTabs && showExamsTabs && (
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-colors"
                >
                  View Books
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}
