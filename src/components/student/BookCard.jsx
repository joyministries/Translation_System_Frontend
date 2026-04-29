import { MdCalendarToday, MdPages, MdMenuBook, MdSchool } from "react-icons/md";

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

  return (
    <div className="bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all duration-200 ease-in-out h-full flex flex-col group p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
          <MdMenuBook className="text-slate-400 text-xl group-hover:text-blue-500 transition-colors" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {book?.title || "Untitled"}
          </h4>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {book?.subject && (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100">
            {book.subject}
          </span>
        )}
        {book?.language && (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100">
            {book.language}
          </span>
        )}
        {book?.grade_level && book.grade_level !== 'N/A' && (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100 flex items-center gap-1">
            <MdSchool className="text-slate-400" />
            {book.grade_level}
          </span>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-2">
        {book?.pages && book.pages > 0 ? (
          <div className="flex items-center text-xs text-slate-400 gap-1.5">
            <MdPages className="text-slate-300 flex-shrink-0 text-sm" />
            <span>{book.pages} pages</span>
          </div>
        ) : null}
        {book?.dateUploaded ? (
          <div className="flex items-center text-xs text-slate-400 gap-1.5">
            <MdCalendarToday className="text-slate-300 flex-shrink-0 text-sm" />
            <span>{formatDate(book.dateUploaded)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}