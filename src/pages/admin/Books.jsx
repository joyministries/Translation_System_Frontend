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


  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.books.list(1, 100);
      setBooks(res.books);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      toast.error('Failed to load books');
      setBooks([]); // Clear books on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    fetchBooks();
  };

  const handleBookDeleted = () => {
    fetchBooks();
  };

  if (showUploadForm) {
    return (
        <div className="container mx-auto p-6">
            <Button onClick={() => setShowUploadForm(false)} variant="secondary" className="mb-4">
                <MdArrowBack className="inline-block mr-2" />
                Back to Library
            </Button>
            <BookUploadForm onBookUploaded={handleBookUploaded} />
        </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/admin/dashboard')} variant="secondary" size="sm">
                <MdArrowBack />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Content Library</h1>
        </div>
        <Button onClick={() => setShowUploadForm(true)}>Upload Book</Button>
      </div>

      {loading && books.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <BookTable books={books} onBookDeleted={handleBookDeleted} />
      )}
    </div>
  );
}
    
