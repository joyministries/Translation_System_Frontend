import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdArrowBack } from 'react-icons/md';
import { BookCard } from '../../components/student/BookCard.jsx';
import { studentAPI } from '../../api/student.jsx';

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
        }));

        setAllBooks(books);
      } catch (error) {
        console.error('Error fetching books:', error);
        // Set empty array on error (will still work with UI)
        setAllBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);
  const categories = ['All', ...new Set(allBooks.map(book => book.subject))];

  // Filter books based on search and category
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Books</h1>
        <p className="text-slate-600">Search for books</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <MdSearch className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by book title or author..."
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      {loading ? (
        <div className="mb-6">
          <p className="text-sm text-slate-600">Loading books...</p>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredBooks.length}</span> books
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600 text-lg">No books found matching your search.</p>
          <p className="text-slate-500 mt-2">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
}
