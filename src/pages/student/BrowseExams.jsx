import { useState, useEffect } from 'react';
import { MdSearch, MdArrowBack } from 'react-icons/md';
import { ExamCard } from '../../components/student/ExamCard';
import { studentAPI } from '../../api/student.jsx';
import { useNavigate } from 'react-router-dom';

export function BrowseExams() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allExams, setAllExams] = useState([]);
  const [answerKeys, setAnswerKeys] = useState([]);
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
          // Find the associated answer key document
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
        setAnswerKeys(keys || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAllExams([]); // Empty state on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = ['All', ...new Set(allExams.map(exam => exam.subject))];

  // Filter exams based on search and category
  const filteredExams = allExams.filter(exam => {
    const title = exam.title?.toLowerCase() || '';
    const subject = exam.subject?.toLowerCase() || '';
    
    const matchesSearch = title.includes(searchQuery.toLowerCase()) ||
                         subject.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exam.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
      >
        <MdArrowBack className="w-5 h-5" />
        Back
      </button>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Exams</h1>
        <p className="text-slate-600">Search for exams</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <MdSearch className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by exam title or subject..."
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-6">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filteredExams.length}</span> exams
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Exams Grid */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="cursor-pointer"
              onClick={() =>  {
                navigate(`/student/exam/${exam.id}`)
                console.log("Navigating to exam details for exam ID:", exam.id);
              }}
            >
              <ExamCard exam={exam} />
            </div>
          ))}
        </div>
      ) : allExams.length === 0 && !isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600 text-lg">No exams available</p>
          <p className="text-slate-500 mt-2">Exams may not be uploaded yet by administrators.</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600 text-lg">No exams found matching your search.</p>
          <p className="text-slate-500 mt-2">Try adjusting your search terms or filters.</p>
        </div>
      ) : null}
    </div>
  );
}
