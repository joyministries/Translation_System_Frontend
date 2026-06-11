import { MdMenuBook } from "react-icons/md";

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
    </div>
  );
}