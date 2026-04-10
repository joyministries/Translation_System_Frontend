import { useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { ExamCard } from '../../components/student/ExamCard';

export function BrowseExams() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userExamLibrary, setUserExamLibrary] = useState(
    JSON.parse(localStorage.getItem('userExamLibrary')) || []
  );

  // Mock exams data - Replace with API call
  const allExams = [
    {
      id: 1,
      title: 'Mathematics Final Exam',
      subject: 'Mathematics',
      dateUploaded: '2026-04-10',
    },
    {
      id: 2,
      title: 'English Midterm Exam',
      subject: 'English',
      dateUploaded: '2026-04-08',
    },
    {
      id: 3,
      title: 'Science Comprehensive Exam',
      subject: 'Science',
      dateUploaded: '2026-04-05',
    },
    {
      id: 4,
      title: 'History Quiz',
      subject: 'History',
      dateUploaded: '2026-03-28',
    },
    {
      id: 5,
      title: 'Biology Practical Exam',
      subject: 'Biology',
      dateUploaded: '2026-03-25',
    },
    {
      id: 6,
      title: 'Chemistry Exam',
      subject: 'Chemistry',
      dateUploaded: '2026-03-20',
    },
    {
      id: 7,
      title: 'Physics Final Exam',
      subject: 'Physics',
      dateUploaded: '2026-03-15',
    },
    {
      id: 8,
      title: 'Geography Assessment',
      subject: 'Geography',
      dateUploaded: '2026-03-10',
    },
  ];

  const categories = ['All', ...new Set(allExams.map(exam => exam.subject))];

  // Filter exams based on search and category
  const filteredExams = allExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exam.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToLibrary = (exam) => {
    if (!userExamLibrary.find(e => e.id === exam.id)) {
      const updatedLibrary = [...userExamLibrary, exam];
      setUserExamLibrary(updatedLibrary);
      localStorage.setItem('userExamLibrary', JSON.stringify(updatedLibrary));
    }
  };

  const handleRemoveFromLibrary = (examId) => {
    const updatedLibrary = userExamLibrary.filter(e => e.id !== examId);
    setUserExamLibrary(updatedLibrary);
    localStorage.setItem('userExamLibrary', JSON.stringify(updatedLibrary));
  };

  const isInLibrary = (examId) => userExamLibrary.some(e => e.id === examId);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse & Add Exams</h1>
        <p className="text-slate-600">Search for exams and add them to your library</p>
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
            <ExamCard
              key={exam.id}
              exam={exam}
              actionButton={
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInLibrary(exam.id)) {
                      handleRemoveFromLibrary(exam.id);
                    } else {
                      handleAddToLibrary(exam);
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isInLibrary(exam.id)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'
                  }`}
                  title={isInLibrary(exam.id) ? 'Remove from library' : 'Add to library'}
                >
                  {isInLibrary(exam.id) ? 'Added ✓' : 'Add'}
                </button>
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600 text-lg">No exams found matching your search.</p>
          <p className="text-slate-500 mt-2">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
}
