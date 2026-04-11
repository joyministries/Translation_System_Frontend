import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { adminAPI } from '../../api/admin.jsx';
import { BookUploadForm } from '../../components/admin/BookUploadForm';
import { BookTable } from '../../components/admin/BookTable';
import toast from 'react-hot-toast';
import { Button } from '../../components/shared/Button.jsx';
import { Spinner } from '../../components/shared/Spinner.jsx';

export function Books() {
  const navigate = useNavigate();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pollIntervals, setPollIntervals] = useState({});


  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.books.list(1, 100);
        setBooks(res.data?.books || res.books || res.data || []);
      } catch (error) {
        console.error('Failed to fetch books:', error);
        toast.error('Failed to load books');
        setBooks([]); // Clear books on error
      } finally {
        setLoading(false);
      }
      };
      
      fetchBooks();
  }, []);

  // Poll for status updates on pending books
  useEffect(() => {
    const pendingBooks = books.filter((b) => b.extractionStatus === 'pending');

    pendingBooks.forEach((book) => {
      // Skip if already polling this book
      if (pollIntervals[book.id]) return;

      // Start polling this book's status
      const interval = setInterval(async () => {
        try {
          const response = await adminAPI.books.list(1, 100);
          
          // Handle different response formats
          let booksData = [];
          if (response.data?.books) {
            booksData = response.data.books;
          } else if (response.data && Array.isArray(response.data)) {
            booksData = response.data;
          } else if (response.books) {
            booksData = response.books;
          } else if (Array.isArray(response)) {
            booksData = response;
          }
          
          const updatedBook = Array.isArray(booksData) ? booksData.find((b) => b.id === book.id) : null;

          if (updatedBook) {
            setBooks((prevBooks) =>
              prevBooks.map((b) => (b.id === book.id ? updatedBook : b))
            );

            // Stop polling if status changed
            if (updatedBook.extractionStatus !== 'pending') {
              clearInterval(interval);
              setPollIntervals((prev) => {
                const newIntervals = { ...prev };
                delete newIntervals[book.id];
                return newIntervals;
              });
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000); // Poll every 5 seconds

      setPollIntervals((prev) => ({ ...prev, [book.id]: interval }));
    });

    // Cleanup: stop polling for books that are no longer pending
    return () => {
      Object.keys(pollIntervals).forEach((bookId) => {
        const bookStillPending = pendingBooks.some((b) => b.id === parseInt(bookId));
        if (!bookStillPending) {
          clearInterval(pollIntervals[bookId]);
        }
      });
    };
  }, [books, pollIntervals]);

  const handleBookUploaded = () => {
    setShowUploadForm(false);
    setLoading(true);
    // Refetch books after upload
    adminAPI.books.list(1, 100).then((res) => {
      setBooks(res.data?.books || res.books || res.data || []);
      setLoading(false);
    });

  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
      >
        <MdArrowBack className="w-5 h-5" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900">Book Management</h1>
      <p className="text-gray-600 mt-1">Upload new books and manage existing ones.</p>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books Manager</h1>
          <p className="text-gray-600 mt-1">Upload new books and manage existing ones.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowUploadForm(true)}
        >
          Upload Book
        </Button>
      </div>

      {showUploadForm ? (
        <BookUploadForm onBookUploaded={handleBookUploaded} />
      ) : (
        <BookTable
          books={books}
          loading={loading}
          onBooksChanged={handleBookUploaded}
        />
      )}
    </div>
  );
}
