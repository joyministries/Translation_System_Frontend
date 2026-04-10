import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDownload, MdCalendarToday } from 'react-icons/md';

export function ExamDetails() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isDownloading, setIsDownloading] = useState(false);

  // Mock exam data - Replace with API call using examId
  const exam = {
    id: examId,
    title: 'Mathematics Final Exam',
    subject: 'Mathematics',
    dateUploaded: '2026-04-10',
    description: 'A comprehensive final examination covering all mathematical topics from the semester including algebra, geometry, calculus, and statistics.',
  };

  const availableLanguages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Arabic',
    'Japanese',
    'Portuguese',
  ];

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // TODO: Replace with actual API call to backend
      // const response = await fetch(`/api/exams/${examId}/download?language=${selectedLanguage}`);
      // const blob = await response.blob();
      
      // Mock download simulation
      setTimeout(() => {
        alert(`Exam download started for "${exam.title}" in ${selectedLanguage}`);
        setIsDownloading(false);
      }, 1500);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download exam. Please try again.');
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <MdArrowBack className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Exam Info */}
          <div className="lg:col-span-2">
            {/* Exam Header */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{exam.title}</h1>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">Subject</p>
                  <p className="text-slate-900">{exam.subject}</p>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <MdCalendarToday className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Posted:</span>
                  <span>{new Date(exam.dateUploaded).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About This Exam</h2>
              <p className="text-slate-700 leading-relaxed">{exam.description}</p>
            </div>
          </div>

          {/* Right Column - Translation & Download */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Download Exam</h2>

              {/* Language Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Select Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  📝 Exam will be available in <span className="font-semibold">{selectedLanguage}</span>
                </p>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className={`w-full px-4 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                  isDownloading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                <MdDownload className="w-5 h-5" />
                {isDownloading ? 'Downloading...' : 'Download Exam'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
