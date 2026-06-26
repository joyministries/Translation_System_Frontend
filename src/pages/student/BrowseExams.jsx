import { useState, useEffect } from 'react';
import { MdSearch, MdAssignment } from 'react-icons/md';
import { ExamCard } from '../../components/student/ExamCard';
import { studentAPI } from '../../api/student.jsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Skeleton shimmer card for loading state
function ExamCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-slate-100" />
        <div className="flex-1 pt-1 space-y-2">
          <div className="h-3.5 bg-slate-200 rounded w-full" />
          <div className="h-5 w-20 bg-slate-100 rounded-md" />
        </div>
      </div>
      <div className="mb-4">
        <div className="h-6 w-36 bg-slate-100 rounded-md" />
      </div>
      <div className="mt-auto pt-4 border-t border-slate-50">
        <div className="h-3 bg-slate-100 rounded w-24" />
      </div>
    </div>
  );
}

export function BrowseExams() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allExams, setAllExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'
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
            dateUploaded: exam.created_at || new Date().toISOString(),
            file_path: exam.file_path || '',
            answerKey: associatedKey || null
          };
        });
        setAllExams(formattedExams);
      } catch (error) {
        toast.error('Could not load exams. Please check your connection and try again.');
        setAllExams([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);


  const filteredExams = allExams.filter(exam => {
    const title = exam.title?.toLowerCase() || '';
    const matchesSearch = title.includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedExams = [...filteredExams].sort((a, b) => {
    const titleA = a.title || '';
    const titleB = b.title || '';
    return sortOrder === 'asc'
      ? titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' })
      : titleB.localeCompare(titleA, undefined, { numeric: true, sensitivity: 'base' });
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
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by exam title..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50 transition"
            />
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-3">
            <label htmlFor="sortOrder" className="text-sm font-semibold text-slate-600 whitespace-nowrap">
              Sort Title:
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50 transition text-sm font-medium text-slate-700 cursor-pointer min-w-[140px]"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="mb-5">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{sortedExams.length}</span>{' '}
            {sortedExams.length === 1 ? 'exam' : 'exams'}
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
      ) : sortedExams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedExams.map((exam) => (
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
              onClick={() => {
                setSearchQuery('');
                setSortOrder('desc');
              }}
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
