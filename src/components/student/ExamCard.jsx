import { MdCalendarToday, MdAssignment, MdKey } from "react-icons/md";

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

  // Generate a consistent gradient accent from the title
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-teal-500 to-emerald-600",
    "from-sky-500 to-blue-600",
    "from-fuchsia-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-indigo-500 to-violet-600",
  ];
  const gradientIndex = (exam?.title?.charCodeAt(0) || 0) % gradients.length;
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

      {/* Icon + Title area */}
      <div className="px-5 pt-5 pb-3 flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-md`}>
          <MdAssignment className="text-white text-2xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors">
            {exam?.title || "Untitled Exam"}
          </h3>
          {exam?.subject && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {exam.subject}
            </span>
          )}
        </div>
      </div>

      {/* Answer Key badge */}
      {exam?.answerKey && (
        <div className="px-5 pb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MdKey className="text-emerald-500" />
            Answer Key Available
          </span>
        </div>
      )}

      {/* Metadata footer */}
      <div className="mt-auto border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center text-xs text-slate-500 gap-1">
          {exam?.dateUploaded ? (
            <>
              <MdCalendarToday className="text-violet-400 flex-shrink-0" />
              <span>{formatDate(exam.dateUploaded)}</span>
            </>
          ) : (
            <span className="text-slate-400">No date</span>
          )}
        </div>
        <button
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-sm hover:opacity-90 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-violet-400`}
          onClick={(e) => e.stopPropagation()} // parent div handles navigation
          tabIndex={-1}
        >
          View Exam
        </button>
      </div>
    </div>
  );
}
