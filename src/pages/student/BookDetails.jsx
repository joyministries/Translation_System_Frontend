import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdCalendarToday,
  MdPages,
  MdPerson,
  MdBookmark,
} from "react-icons/md";
import { studentAPI } from "../../api/student.jsx";
import { toast } from "react-hot-toast";
import Spinner from "../../components/shared/Spinner.jsx";

export function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const response = await studentAPI.getBooks();
        const books = response.books || response.data || [];
        const currentBook = books.find((b) => b.id.toString() === bookId);
        if (!currentBook) {
          setNotFound(true);
        } else {
          setBook(currentBook);
        }
      } catch (error) {
        toast.error("Error fetching book details.");
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {book.title}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${languageColorClass}`}
            >
              {book.language}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">{book.description}</p>
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
                <p className="text-sm font-medium text-slate-600">Subject</p>
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
    </div>
  );
}