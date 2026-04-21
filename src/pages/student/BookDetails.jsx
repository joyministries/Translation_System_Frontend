import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdDownload,
  MdCalendarToday,
  MdPages,
  MdPerson,
  MdBookmark,
} from "react-icons/md";
import { studentAPI } from "../../api/student.jsx";
import { Modal } from "../../components/shared/Modal";
import { toast } from "react-hot-toast";
import { Button } from "../../components/shared/Button.jsx";
import { Spinner } from "../../components/shared/Spinner.jsx";

export function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [selectedLanguageId, setSelectedLanguageId] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationUrl, setTranslationUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const data = await studentAPI.getBook(bookId);
        if (!data) {
          setNotFound(true);
        } else {
          setBook(data);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
        toast.error("Error fetching book details.");
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languages = await studentAPI.getAvailableLanguages();
        if (languages && languages.length > 0) {
          setAvailableLanguages(languages);
        }
      } catch (error) {
        console.error("Error fetching available languages:", error);
        toast.error("Could not fetch available languages.");
      }
    };
    fetchLanguages();
  }, []);

  const handleLanguageChange = (e) => {
    setSelectedLanguageId(parseInt(e.target.value, 10));
  };

  const handleTranslate = async () => {
    if (!selectedLanguageId) {
      toast.error("Please select a language first.");
      return;
    }
    setIsTranslating(true);
    const toastId = toast.loading("Starting translation...");

    try {
      // 1. Start the translation and get the job details
      const jobResponse = await studentAPI.triggerTranslation(
        "book",
        bookId,
        selectedLanguageId
      );

      // Check if the job was completed immediately
      if (jobResponse.status === "done" || jobResponse.status === "completed") {
        const translationId = jobResponse.translation_id || jobResponse.id;
        toast.loading("Translation complete! Preparing download...", { id: toastId });

        // 2. Download the file blob
        const { blob: fileBlob, filename: downloadFilename } = await studentAPI.downloadTranslation(translationId);

        // 3. Trigger the browser download
        const url = window.URL.createObjectURL(fileBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = downloadFilename || `Translated_${book.title}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Download has started!", { id: toastId });

      } else {
        // If the job is not done, you might need to poll (optional, based on previous logic)
        toast.error("Translation is taking longer than expected. Please try again later.", { id: toastId });
      }
    } catch (error) {
      toast.error(
        error.message || "Translation failed. Please try again.",
        { id: toastId }
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownload = () => {
    // This function is no longer directly used but can be kept for other purposes
    if (translationUrl) {
      window.open(translationUrl, "_blank");
      setIsModalOpen(false);
      setTranslationUrl(null);
    } else {
      toast.error("No file to download.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

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
              Back to Browse
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Book Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/student/browse-books")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Browse All Books
          </button>
        </div>
      </div>
    );
  }

  const languageColorClass = "bg-slate-100 text-slate-800";

  return (
    <div className="min-h-screen bg-slate-50">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Translation Ready"
      >
        <p className="mb-4">Your translated book is ready for download.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload}>
            <MdDownload className="mr-2" />
            Download
          </Button>
        </div>
      </Modal>

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
          {/* Left Column - Book Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
              <h1 className="text-xl font-bold text-slate-900 mb-4">
                {book.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${languageColorClass}`}
                >
                  {book.language}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {book.description}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Book Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MdPerson className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Author</p>
                    <p className="text-slate-900">{book.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MdBookmark className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Subject
                    </p>
                    <p className="text-slate-900">{book.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MdPages className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Pages</p>
                    <p className="text-slate-900">{book.pages}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MdCalendarToday className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Date Uploaded
                    </p>
                    <p className="text-slate-900">
                      {new Date(book.dateUploaded).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Translate & Download
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="language-select"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Translate to
                  </label>
                  <select
                    id="language-select"
                    value={selectedLanguageId}
                    onChange={handleLanguageChange}
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a language</option>
                    {availableLanguages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !selectedLanguageId}
                  className="w-full"
                >
                  {isTranslating ? "Translating..." : "Translate"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}