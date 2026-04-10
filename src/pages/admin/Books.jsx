import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { adminAPI } from '../../api/admin.api.js';
import { BookUploadForm } from '../../components/admin/BookUploadForm';
import { BookTable } from '../../components/admin/BookTable';
import toast from 'react-hot-toast';

export function Books() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pollIntervals, setPollIntervals] = useState({});

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.books.list(1, 100);
      setBooks(response.books || []);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      toast.error('Failed to load books');
      // Mock data for testing
      setBooks([
        {
          id: 1,
          title: 'Mathematics Grade 9',
          subject: 'Mathematics',
          gradeLevel: '9',
          extractionStatus: 'done',
          uploadedBy: 'Admin',
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 2,
          title: 'English Literature',
          subject: 'English',
          gradeLevel: '10',
          extractionStatus: 'pending',
          uploadedBy: 'Admin',
          uploadedAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: 'Biology Fundamentals',
          subject: 'Science',
          gradeLevel: '9',
          extractionStatus: 'failed',
          uploadedBy: 'Admin',
          uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
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
          const updatedBook = response.books?.find((b) => b.id === book.id);

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

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleBookUploaded = () => {
    fetchBooks();
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

      <h1 className="text-3xl font-bold text-gray-900">Books Manager</h1>

      {/* Upload Form */}
      <BookUploadForm onBookUploaded={handleBookUploaded} />

      {/* Books List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Books</h2>
        <BookTable
          books={books}
          loading={loading}
          onBooksChanged={handleBookUploaded}
        />
      </div>
    </div>
  );
}
