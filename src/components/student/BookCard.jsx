import {
  MdCalendarToday,
  MdDownload,
  MdTranslate,
  MdPages,
} from "react-icons/md";
import { toast } from "react-hot-toast";
import { studentAPI } from "../../api/student";
import { useState, useEffect } from "react";
import Button from "./Button";

export function BookCard({ book }) {
  const [languages, setLanguages] = useState([]);
  const [translationId, setTranslationId] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguageId, setSelectedLanguageId] = useState("");

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const availableLanguages = await studentAPI.getAvailableLanguages();
        setLanguages(availableLanguages || []);
      } catch (error) {
        toast.error("Could not fetch languages.");
      }
    };
    fetchLanguages();
  }, []);

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

  const handleTranslate = async () => {
    if (!selectedLanguageId) {
      toast.error("Please select a language first.");
      return;
    }
    setIsTranslating(true);
    const toastId = toast.loading("Starting translation...");
    try {
      const response = await studentAPI.triggerTranslation(
        "book",
        book.id,
        selectedLanguageId
      );
      if (response && response.job_id) {
        const completedJob = await studentAPI.pollTranslationStatus(
          response.job_id
        );
        const transId = completedJob.translation_id || completedJob.id;
        setTranslationId(transId);
        toast.success("Translation ready for download!", { id: toastId });
      } else {
        throw new Error("Did not receive a job ID.");
      }
    } catch (error) {
      toast.error(
        error.message || "Failed to trigger translation job.",
        { id: toastId }
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownload = async () => {
    if (!translationId) {
      toast.error("No translation available for download.");
      return;
    }
    const toastId = toast.loading("Downloading...");
    try {
      const translationDetails = await studentAPI.getTranslation(translationId);
      const downloadUrl = translationDetails.file_path;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
        toast.success("Download started.", { id: toastId });
      } else {
        throw new Error("No download URL found.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to download translation.", {
        id: toastId,
      });
    }
  };

  const languageColors = {
    English: "bg-blue-100 text-blue-800",
    Spanish: "bg-red-100 text-red-800",
    French: "bg-purple-100 text-purple-800",
    German: "bg-amber-100 text-amber-800",
    Chinese: "bg-red-100 text-red-800",
    Arabic: "bg-emerald-100 text-emerald-800",
    Japanese: "bg-pink-100 text-pink-800",
    Portuguese: "bg-green-100 text-green-800",
  };

  const languageColorClass =
    languageColors[book?.language] || "bg-slate-100 text-slate-800";

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
            {book?.title}
          </h3>
          {book?.language && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${languageColorClass}`}
            >
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
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-3">
        <select
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedLanguageId}
          onChange={(e) => setSelectedLanguageId(e.target.value)}
        >
          <option value="">Select language</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !selectedLanguageId}
            className="w-full"
          >
            <MdTranslate className="mr-2" />
            {isTranslating ? "Translating..." : "Translate"}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!translationId}
            variant="secondary"
            className="w-full"
          >
            <MdDownload className="mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}