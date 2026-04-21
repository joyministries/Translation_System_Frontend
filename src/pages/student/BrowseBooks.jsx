import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdMenuBook } from 'react-icons/md';
import { BookCard } from '../../components/student/BookCard.jsx';
import { studentAPI } from '../../api/student.jsx';

// Skeleton shimmer card for loading state
function BookCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-2 w-full bg-slate-200" />
      <div className="px-5 pt-5 pb-3 flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="px-5 pb-3 flex gap-2">
        <div className="h-5 w-16 bg-slate-100 rounded-full" />
        <div className="h-5 w-14 bg-slate-100 rounded-full" />
      </div>
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-3 bg-slate-100 rounded w-20" />
          <div className="h-3 bg-slate-100 rounded w-24" />
        </div>
        <div className="h-7 w-20 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

export function BrowseBooks() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchBooks = async () => {
      try {
        const response = await studentAPI.getBooks();
        const books = response.map(book => ({
          id: book.id || '',
          title: book.title || 'Untitled',
          author: book.author || 'Unknown Author',
          subject: book.subject || 'General',
          language: book.language || 'English',
          pages: book.page_count || 0,
          grade_level: book.grade_level || 'N/A',
          dateUploaded: book.created_at || '',
          description: book.description || '',
        }));

        setAllBooks(books);
      } catch (error) {
        console.error('Error fetching books:', error);
        setAllBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const categories = ['All', ...new Set(allBooks.map(book => book.subject))];

  const filteredBooks = allBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <MdMenuBook className="text-white text-xl" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Browse Books</h1>
        </div>
        <p className="text-slate-500 ml-13 pl-1">Discover and read educational materials translated for your learning</p>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-8">
        {/* Search Bar */}
        <div className="relative mb-4">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by book title or author..."
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition"
          />
        </div>

        {/* Category Filters */}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-5">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredBooks.length}</span>{' '}
            {filteredBooks.length === 1 ? 'book' : 'books'}
            {searchQuery && ` matching `}
            {searchQuery && <span className="font-semibold text-blue-600">"{searchQuery}"</span>}
          </p>
        </div>
      )}

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="cursor-pointer"
              onClick={() => navigate(`/student/book/${book.id}`)}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 py-20 px-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <MdMenuBook className="text-slate-400 text-3xl" />
          </div>
          <p className="text-slate-700 text-lg font-semibold">No books found</p>
          <p className="text-slate-400 text-sm mt-1">
            {searchQuery
              ? `Try different search terms or clear the filters.`
              : `No books are available yet. Check back later.`}
          </p>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
