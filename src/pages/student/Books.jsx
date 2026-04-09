import { useState, useEffect, useCallback } from 'react';
import { studentAPI } from '../../api/student.api';
import { BookCard } from '../../components/student/BookCard';
import { LanguageSelector } from '../../components/student/LanguageSelector';
import { EmptyState } from '../../components/shared/EmptyState';
import { Button } from '../../components/shared/Button';
import toast from 'react-hot-toast';

export function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_selectedLanguage, setSelectedLanguage] = useState(null);
  const BOOKS_PER_PAGE = 12;

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentAPI.books.list(currentPage, BOOKS_PER_PAGE);
      setBooks(response.books || []);
      setTotalPages(Math.ceil((response.total || 0) / BOOKS_PER_PAGE));

      if (!response.books || response.books.length === 0) {
        toast.error('No books assigned to your institution yet.');
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      toast.error('Failed to load books. Using mock data.');
      
      // Mock data for testing
      setBooks([
        {
          id: 1,
          title: 'Mathematics Grade 9',
          subject: 'Mathematics',
          gradeLevel: '9',
          extractionStatus: 'done',
        },
        {
          id: 2,
          title: 'English Literature',
          subject: 'English',
          gradeLevel: '10',
          extractionStatus: 'done',
        },
        {
          id: 3,
          title: 'Biology Fundamentals',
          subject: 'Science',
          gradeLevel: '9',
          extractionStatus: 'pending',
        },
        {
          id: 4,
          title: 'History of Africa',
          subject: 'History',
          gradeLevel: '11',
          extractionStatus: 'done',
        },
        {
          id: 5,
          title: 'Chemistry Basics',
          subject: 'Science',
          gradeLevel: '10',
          extractionStatus: 'done',
        },
        {
          id: 6,
          title: 'Geography World',
          subject: 'Geography',
          gradeLevel: '9',
          extractionStatus: 'done',
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Books</h1>
        <LanguageSelector onSelect={handleLanguageSelect} loading={loading} />
      </div>

      {/* Empty State */}
      {!loading && books.length === 0 && (
        <EmptyState
          icon="📚"
          title="No books available"
          description="No books are currently assigned to your institution."
        />
      )}

      {/* Books Grid */}
      {books.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <BookCard key={i} loading={true} />
              ))
            : books.map((book) => (
                <BookCard
                  key={book.id}
                  title={book.title}
                  subject={book.subject}
                  gradeLevel={book.gradeLevel}
                  extractionStatus={book.extractionStatus}
                />
              ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="secondary"
          >
            Previous
          </Button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
