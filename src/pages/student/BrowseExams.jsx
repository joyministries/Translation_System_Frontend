import { useState, useEffect } from 'react';
import { MdSearch, MdAssignment } from 'react-icons/md';
import { ExamCard } from '../../components/student/ExamCard';
import { studentAPI } from '../../api/student.jsx';
import { useNavigate } from 'react-router-dom';

// Skeleton shimmer card for loading state
function ExamCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-2 w-full bg-slate-200" />
      <div className="px-5 pt-5 pb-3 flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-5 w-20 bg-slate-100 rounded-full" />
        </div>
      </div>
      <div className="px-5 pb-3">
        <div className="h-6 w-36 bg-slate-100 rounded-full" />
      </div>
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
        <div className="h-3 bg-slate-100 rounded w-24" />
        <div className="h-7 w-20 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

export function BrowseExams() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allExams, setAllExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch exams and answer keys from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exams, keys] = await Promise.all([
          studentAPI.getExams(),
          studentAPI.getAnswerKeys()
        ]);
        const formattedExams = (exams || []).map(exam => {
          const associatedKey = (keys || []).find(k => k.exam_id === exam.id || k.title?.includes(exam.title));
          return {
            id: exam.id || '',
            title: exam.title || 'Untitled',
            subject: exam.subject || '',
            dateUploaded: exam.created_at || new Date().toISOString(),
            file_path: exam.file_path || '',
            answerKey: associatedKey || null
          };
        });
        setAllExams(formattedExams);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAllExams([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = ['All', ...new Set(allExams.map(exam => exam.subject).filter(Boolean))];

  const filteredExams = allExams.filter(exam => {
    const title = exam.title?.toLowerCase() || '';
    const subject = exam.subject?.toLowerCase() || '';
    const matchesSearch = title.includes(searchQuery.toLowerCase()) ||
                         subject.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exam.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
            <MdAssignment className="text-white text-xl" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Browse Exams</h1>
        </div>
        <p className="text-slate-500 pl-1">Prepare for your exams with materials uploaded by your institution</p>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-8">
        {/* Search Bar */}
        <div className="relative mb-4">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exam title or subject..."
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50 transition"
          />
        </div>

        {/* Category Filters */}
        {!isLoading && categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  selectedCategory === category
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="mb-5">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredExams.length}</span>{' '}
            {filteredExams.length === 1 ? 'exam' : 'exams'}
            {searchQuery && ` matching `}
            {searchQuery && <span className="font-semibold text-violet-600">"{searchQuery}"</span>}
          </p>
        </div>
      )}

      {/* Exams Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <ExamCardSkeleton key={i} />)}
        </div>
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="cursor-pointer"
              onClick={() => navigate(`/student/exam/${exam.id}`)}
            >
              <ExamCard exam={exam} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 py-20 px-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <MdAssignment className="text-slate-400 text-3xl" />
          </div>
          <p className="text-slate-700 text-lg font-semibold">No exams found</p>
          <p className="text-slate-400 text-sm mt-1">
            {searchQuery
              ? 'Try different search terms or clear the filters.'
              : 'No exams are available yet. Check back later.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
