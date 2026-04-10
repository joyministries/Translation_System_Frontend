import { useNavigate } from 'react-router-dom';
import { MdCalendarToday, MdPages } from 'react-icons/md';

export function BookCard({ book, actionButton }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (book?.id) {
      navigate(`/student/book/${book.id}`);
    }
  };

  // Format date to readable format (e.g., "Apr 10, 2026")
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Language color mapping
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

  const languageColorClass = languageColors[book?.language] || 'bg-slate-100 text-slate-800';

  return (
    <div
      onClick={handleCardClick}
      className={`
        bg-white border border-slate-200 rounded-lg shadow-sm
        hover:shadow-md transition-shadow duration-200
        ${book?.id ? 'cursor-pointer hover:border-blue-300' : ''}
        overflow-hidden h-full flex flex-col
      `}
    >
      {/* Header Section */}
      <div className="p-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-900 text-lg leading-tight flex-1">
            {book?.title}
          </h3>
          {book?.language && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${languageColorClass}`}>
              {book.language}
            </span>
          )}
        </div>
        {book?.subject && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-800 inline-block">
            {book.subject}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Description */}
        {book?.description && (
          <p className="text-sm text-slate-700 line-clamp-3 mb-4">
            {book.description}
          </p>
        )}

        {/* Metadata Section */}
        <div className="mt-auto space-y-2">
          {book?.pages && (
            <div className="flex items-center text-sm text-slate-600">
              <MdPages className="w-4 h-4 mr-2 text-blue-600" />
              <span>{book.pages} pages</span>
            </div>
          )}
          {book?.dateUploaded && (
            <div className="flex items-center text-sm text-slate-600">
              <MdCalendarToday className="w-4 h-4 mr-2 text-blue-600" />
              <span>{formatDate(book.dateUploaded)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      {book?.id && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
          <button
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            View Details →
          </button>
          {actionButton && (
            <div className="flex-1">
              {actionButton}
            </div>
          )}
        </div>
      )}
    </div>
  );
}