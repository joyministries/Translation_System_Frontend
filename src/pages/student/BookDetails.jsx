
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDownload, MdCalendarToday, MdPages, MdPerson, MdBookmark } from 'react-icons/md';

export function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isDownloading, setIsDownloading] = useState(false);

  // Mock book data - Replace with API call using bookId
  const book = {
    id: bookId,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    originalLanguage: 'English',
    subject: 'Literature & Fiction',
    description: 'A classic novel about the American Dream in the Jazz Age. This masterpiece explores themes of wealth, love, and the corruption of the American Dream. The story follows Jay Gatsby and his obsessive pursuit of Daisy Buchanan, set in the glamorous but morally empty world of 1920s New York.',
    pages: 180,
    dateUploaded: '2026-04-10',
    publisher: 'Scribner',
    isbn: '978-0743273565',
    coverImage: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&q=80',
    rating: 4.5,
    reviews: 250,
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
      // const response = await fetch(`/api/books/${bookId}/download?language=${selectedLanguage}`);
      // const blob = await response.blob();
      
      // Mock download simulation
      setTimeout(() => {
        // Create a mock PDF download
        const link = document.createElement('a');
        link.href = '#'; // Replace with actual PDF URL from API
        link.download = `${book.title}-${selectedLanguage}.pdf`;
        
        // Show success message
        alert(`PDF download started for "${book.title}" in ${selectedLanguage}`);
        
        setIsDownloading(false);
      }, 1500);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF. Please try again.');
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
    </div>
  );
}