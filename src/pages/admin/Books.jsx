import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { ChevronDown } from 'lucide-react';
import { adminAPI } from '../../api/admin.jsx';
import { BookUploadForm } from '../../components/admin/BookUploadForm';
import { ReferenceUploadForm } from '../../components/admin/ReferenceUploadForm';
import { BookTable } from '../../components/admin/BookTable';
import toast from 'react-hot-toast';
import { Button } from '../../components/shared/Button.jsx';
import { Spinner } from '../../components/shared/Spinner.jsx';
import { TranslationModal } from '../../components/admin/TranslationModal.jsx';
import { Modal } from '../../components/shared/Modal';

export function Books() {
  const navigate = useNavigate();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pollIntervals, setPollIntervals] = useState({});
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const dropdownRef = useRef(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {

      const handleBookDeleted = () => {
    fetchBooks();
  };

      const res = await adminAPI.books.list(1, 100);
      // Handle different response formats
      let booksData = [];
      if (res.data?.items) {
        booksData = res.data.items;
      } else if (res.data && Array.isArray(res.data)) {
        booksData = res.data;
      } else if (res.books) {
        booksData = res.books;
      } else if (Array.isArray(res)) {
        booksData = res;
      }
      setBooks(Array.isArray(booksData) ? booksData : []);
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
    setUploadType(null);
    fetchBooks();
  };

  const handleUploadMenuClick = (type) => {
    setUploadType(type);
    setShowUploadForm(true);
    setShowUploadMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUploadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleTableActions = (action, book) => {
    if (action === 'translate') {
      setSelectedBook(book);
      setShowTranslationModal(true);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/admin/dashboard')} variant="secondary" size="sm">
                <MdArrowBack />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Content Library</h1>
        </div>
        
        {/* Upload Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Upload
            <ChevronDown className="w-4 h-4" />
          </button>

          {showUploadMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
              <button
                onClick={() => handleUploadMenuClick('book')}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Upload Book
              </button>
              <button
                onClick={() => handleUploadMenuClick('reference')}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                Upload Reference
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && books.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        <BookTable books={books} onBooksChanged={handleTableActions} />
      )}

      {selectedBook && (
        <TranslationModal
          isOpen={showTranslationModal}
          onClose={() => setShowTranslationModal(false)}
          content={selectedBook}
          contentType="book"
        />
      )}

      {showUploadForm && (
        <Modal isOpen={showUploadForm} onClose={() => setShowUploadForm(false)} title={uploadType === 'book' ? 'Upload Book' : 'Upload Reference'}>
          {uploadType === 'book' ? (
            <BookUploadForm onBookUploaded={handleBookUploaded} onCancel={() => setShowUploadForm(false)} />
          ) : (
            <ReferenceUploadForm onReferenceUploaded={handleBookUploaded} onCancel={() => setShowUploadForm(false)} />
          )}
        </Modal>
      )}
    </div>
  );
}

