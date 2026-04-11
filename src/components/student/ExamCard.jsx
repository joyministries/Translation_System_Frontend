import { MdCalendarToday } from "react-icons/md";

export function ExamCard({ exam }) {
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
    <div
      className={`
        bg-white border border-slate-200 rounded-lg shadow-sm
        hover:shadow-md transition-shadow duration-200
        overflow-hidden h-full flex flex-col
      `}
    >
      {/* Header Section */}
      <div className="p-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-900 text-lg leading-tight flex-1">
            {exam?.title}
          </h3>
        </div>
        {exam?.subject && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-800 inline-block">
            {exam.subject}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Metadata Section */}
        <div className="mt-auto space-y-2">
          {exam?.dateUploaded && (
            <div className="flex items-center text-sm text-slate-600">
              <MdCalendarToday className="w-4 h-4 mr-2 text-blue-600" />
              <span>{formatDate(exam.dateUploaded)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
