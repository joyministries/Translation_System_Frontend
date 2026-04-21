import { MdCalendarToday, MdPages, MdMenuBook, MdPerson, MdSchool } from "react-icons/md";

export function BookCard({ book }) {
  // Format date to readable format (e.g., "Apr 10, 2026")
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Language color mapping
  const languageColors = {
    English: "bg-blue-100 text-blue-700 border-blue-200",
    Spanish: "bg-red-100 text-red-700 border-red-200",
    French: "bg-purple-100 text-purple-700 border-purple-200",
    German: "bg-amber-100 text-amber-700 border-amber-200",
    Chinese: "bg-rose-100 text-rose-700 border-rose-200",
    Arabic: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Japanese: "bg-pink-100 text-pink-700 border-pink-200",
    Portuguese: "bg-green-100 text-green-700 border-green-200",
  };

  const languageColorClass =
    languageColors[book?.language] || "bg-slate-100 text-slate-700 border-slate-200";

  // Generate a consistent gradient for the book cover accent from the title
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-rose-500 to-red-600",
    "from-cyan-500 to-blue-600",
  ];
  const gradientIndex = (book?.title?.charCodeAt(0) || 0) % gradients.length;
  const accentGradient = gradients[gradientIndex];

  return (
    <div
      className={`
        bg-white border border-slate-200 rounded-xl shadow-sm
        hover:shadow-lg hover:-translate-y-1
        transition-all duration-200 ease-in-out
        overflow-hidden h-full flex flex-col
        group
      `}
    >
      {/* Colorful top accent banner */}
      <div className={`h-2 w-full bg-gradient-to-r ${accentGradient}`} />

      {/* Card Icon Area */}
      <div className={`px-5 pt-5 pb-3 flex items-start gap-4`}>
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-md`}>
          <MdMenuBook className="text-white text-2xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
            {book?.title || "Untitled"}
          </h4>
          {book?.author && (
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <MdPerson className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{book.author}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags row */}
      <div className="px-5 pb-3 flex flex-wrap gap-1.5">
        {book?.subject && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {book.subject}
          </span>
        )}
        {book?.language && (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${languageColorClass}`}>
            {book.language}
          </span>
        )}
        {book?.grade_level && book.grade_level !== 'N/A' && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <MdSchool className="text-indigo-500" />
            {book.grade_level}
          </span>
        )}
      </div>

      {/* Metadata footer */}
      <div className="mt-auto border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          {book?.pages && book.pages > 0 ? (
            <div className="flex items-center text-xs text-slate-500 gap-1">
              <MdPages className="text-blue-400 flex-shrink-0" />
              <span>{book.pages} pages</span>
            </div>
          ) : null}
          {book?.dateUploaded ? (
            <div className="flex items-center text-xs text-slate-500 gap-1">
              <MdCalendarToday className="text-blue-400 flex-shrink-0" />
              <span>{formatDate(book.dateUploaded)}</span>
            </div>
          ) : null}
        </div>
        <button
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-sm hover:opacity-90 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400`}
          onClick={(e) => e.stopPropagation()} // parent div handles navigation
          tabIndex={-1}
        >
          Read Book
        </button>
      </div>
    </div>
  );
}