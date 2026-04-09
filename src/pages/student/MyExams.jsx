import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { ExamCard } from '../../components/student/ExamCard';

export function MyExams() {
  const navigate = useNavigate();
  const [userExamLibrary, setUserExamLibrary] = useState([]);

  // Load user exam library from localStorage on mount
  useEffect(() => {
    const library = JSON.parse(localStorage.getItem('userExamLibrary')) || [];
    setUserExamLibrary(library);
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Exams</h1>
        <p className="text-slate-600">Exams you've added to your collection</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/student/browse-exams')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MdAdd className="w-5 h-5" />
          Add Exams to Library
        </button>
      </div>

      {/* Exams Grid */}
      {userExamLibrary.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userExamLibrary.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600 text-lg">Your exam library is empty</p>
          <p className="text-slate-500 mt-2">Start by adding exams from our collection</p>
          <button
            onClick={() => navigate('/student/browse-exams')}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            Browse & Add Exams
          </button>
        </div>
      )}
    </div>
  );
}
