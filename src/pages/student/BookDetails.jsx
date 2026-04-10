
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDownload, MdCalendarToday, MdPages, MdPerson, MdBookmark } from 'react-icons/md';
import { studentAPI } from '../../api/student.jsx';
import { Modal } from '../../components/shared/Modal';

export function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedLanguageId, setSelectedLanguageId] = useState(1); // Track language ID for API
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [book, setBook] = useState(null);
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
    const fetchBook = async () => {
      try {
        const fetchedBook = await studentAPI.getBook(bookId);
        if (!fetchedBook) {
          setNotFound(true);
        } else {
          setBook(fetchedBook);
        }
      } catch (error) {
        console.error('Error fetching book:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  // Fetch available languages from API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await studentAPI.getAvailableLanguages();
        console.log("Fetched languages:", response);
        
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading book details...</p>
      </div>
    );
  }

  // Show not found state
  if (notFound || !book) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <MdArrowBack className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Book Not Found</h1>
          <p className="text-slate-600 mb-6">The book you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/student/browse')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Browse All Books
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Step 1: Trigger translation job with correct parameter order
      const jobResponse = await studentAPI.triggerTranslation('book', bookId, selectedLanguageId);
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
      link.download = `${book.title}-${selectedLanguage}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Translation downloaded successfully');
      setIsDownloading(false);
    } catch (error) {
      console.error('Download error:', error);
      setError(error.message || 'Failed to download PDF. Please try again.');
      setIsErrorModalOpen(true);
      setIsDownloading(false);
    }
  };



  const languageColors = {
    English: 'bg-blue-100 text-blue-800',
    Spanish: 'bg-red-100 text-red-800',
    French: 'bg-purple-100 text-purple-800',
    German: 'bg-amber-100 text-amber-800',
    Chinese: 'bg-red-100 text-red-800',
    Arabic: 'bg-emerald-100 text-emerald-800',
    Japanese: 'bg-pink-100 text-pink-800',
    Portuguese: 'bg-green-100 text-green-800',
  };

  const languageColorClass = languageColors[book.originalLanguage] || 'bg-slate-100 text-slate-800';

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
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Book Info */}
          <div className="lg:col-span-2">
            {/* Book Cover & Header */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
                {/* Cover Image */}
                <div className="sm:col-span-1">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>

                {/* Book Basic Info */}
                <div className="sm:col-span-2">
                  <div className="flex flex-col h-full">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{book.title}</h1>

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${languageColorClass}`}>
                        {book.originalLanguage}
                      </span>
                      <span className="text-yellow-500 text-sm font-medium">
                        ★ {book.rating} ({book.reviews} reviews)
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 text-slate-700">
                        <MdPerson className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Author:</span>
                        <span>{book.author}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <MdBookmark className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Subject:</span>
                        <span>{book.subject}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <MdPages className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Pages:</span>
                        <span>{book.pages}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <MdCalendarToday className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Published:</span>
                        <span>{book.dateUploaded}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About This Book</h2>
              <p className="text-slate-700 leading-relaxed text-lg">{book.description}</p>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
                <div>
                  <p className="text-sm font-medium text-slate-600">Publisher</p>
                  <p className="text-slate-900">{book.publisher}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">ISBN</p>
                  <p className="text-slate-900">{book.isbn}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Translation & Download */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Get Translation</h2>

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
              {selectedLanguage !== book.originalLanguage && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    📚 This book will be translated from <span className="font-semibold">{book.originalLanguage}</span> to <span className="font-semibold">{selectedLanguage}</span>
                  </p>
                </div>
              )}

              {selectedLanguage === book.originalLanguage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-900">
                    ✓ This is the original language of the book
                  </p>
                </div>
              )}

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
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

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