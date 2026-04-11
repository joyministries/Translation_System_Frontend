import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDownload, MdCalendarToday } from 'react-icons/md';
import { studentAPI } from '../../api/student.jsx';
import { Modal } from '../../components/shared/Modal';

export function ExamDetails() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedLanguageId, setSelectedLanguageId] = useState(1); // Track language ID for API
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([
    { id: 1, name: 'English', code: 'en' },
    { id: 2, name: 'Spanish', code: 'es' },
    { id: 3, name: 'French', code: 'fr' },
    { id: 4, name: 'German', code: 'de' },
    { id: 5, name: 'Chinese', code: 'zh' },
    { id: 6, name: 'Arabic', code: 'ar' },
    { id: 7, name: 'Japanese', code: 'ja' },
    { id: 8, name: 'Portuguese', code: 'pt' },
  ]);



  useEffect(() => {
    const fetchExam = async () => {
      try {
        const fetchedExam = await studentAPI.getExam(examId);
        if (!fetchedExam) {
          setNotFound(true);
        } else {
          setExam(fetchedExam);
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  // Fetch available languages from API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await studentAPI.getAvailableLanguages();
        
        // Parse language objects: { id, name, code }
        if (Array.isArray(response) && response.length > 0) {
          setAvailableLanguages(response);
          
          // Set first language as default
          if (response[0].id) {
            setSelectedLanguageId(response[0].id);
            setSelectedLanguage(response[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching available languages:', error);
        // Keep default languages if API fails
      }
    };
    fetchLanguages();
  }, []);

  // Handle language selection change
  const handleLanguageChange = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    const selectedLang = availableLanguages.find(lang => lang.id === selectedId);
    
    if (selectedLang) {
      setSelectedLanguageId(selectedLang.id);
      setSelectedLanguage(selectedLang.name);
      console.log(`Selected: ${selectedLang.name} (ID: ${selectedLang.id})`);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Step 1: Trigger translation job with correct parameter order
      const jobResponse = await studentAPI.triggerTranslation('exam', examId, selectedLanguageId);
      const jobId = jobResponse.job_id;
      console.log('Translation job triggered:', jobId);

      if (!jobId) {
        throw new Error('Failed to start translation job.');
      }

      // Step 2: Poll for translation completion
      const completedJob = await studentAPI.pollTranslationStatus(jobId);
      console.log('Translation job completed:', completedJob);

      // Step 3: Get the translation_id from the completed job response
      const translationId = completedJob.translation_id || completedJob.id;
      if (!translationId) {
        throw new Error('No translation ID returned from server.');
      }

      // Step 4: Download the translated file
      const blob = await studentAPI.downloadTranslation(translationId);

      // Step 5: Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exam.title}-${selectedLanguage}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Translation downloaded successfully');
      setIsDownloading(false);
    } catch (error) {
      console.error('Download error:', error);
      setError(error.message || 'Failed to download exam. Please try again.');
      setIsErrorModalOpen(true);
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-600">Loading exam details...</p>
        </div>
      )}

      {/* Not Found State */}
      {notFound && (
        <>
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Exam Not Found</h1>
            <p className="text-slate-600 mb-6">The exam you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/student/browse-exams')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Browse All Exams
            </button>
          </div>
        </>
      )}

      {/* Loaded State */}
      {!isLoading && !notFound && exam && (
        <>
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
                  <p className="text-slate-700 leading-relaxed">{exam.description || 'No description available.'}</p>
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
                      value={selectedLanguageId}
                      onChange={handleLanguageChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                    >
                      {availableLanguages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
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
        </>
      )}

      {/* Error Modal */}
      <Modal
        isOpen={isErrorModalOpen}
        title="Download Error"
        actions={
          <button
            onClick={() => {
              setIsErrorModalOpen(false);
              setError('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Close
          </button>
        }
      >
        <p className="text-gray-700">{error}</p>
      </Modal>
    </div>
  );
}
