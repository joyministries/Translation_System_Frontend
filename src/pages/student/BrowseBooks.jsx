import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdArrowBack } from 'react-icons/md';
import { BookCard } from '../../components/student/BookCard';
import { studentAPI } from '../../api/student.jsx';

export function BrowseBooks() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLibrary, setUserLibrary] = useState(
    JSON.parse(localStorage.getItem('userLibrary')) || []
  );
  const [allBooks, setAllBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await studentAPI.getBooks();
        const booksArray = response.books || response.data || [];
        // Ensure each book has the required properties
        const books = booksArray.map(book => ({
          id: book.id || '',
          title: book.title || 'Untitled',
          author: book.author || 'Unknown Author',
          subject: book.subject || 'General',
          language: book.language || 'English',
          pages: book.pages || 0,
          dateUploaded: book.dateUploaded || new Date().toISOString(),
          coverImage: book.coverImage || 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&q=80',
          rating: book.rating || 0,
          reviews: book.reviews || 0,
          description: book.description || ''
        }));

        setAllBooks(books);
      } catch (error) {
        console.error('Error fetching books:', error);
        // Set empty array on error (will still work with UI)
        setAllBooks([]);
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

  const handleAddToLibrary = (book) => {
    if (!userLibrary.find(b => b.id === book.id)) {
      const updatedLibrary = [...userLibrary, book];
      setUserLibrary(updatedLibrary);
      localStorage.setItem('userLibrary', JSON.stringify(updatedLibrary));
    }
  };

  const handleRemoveFromLibrary = (bookId) => {
    const updatedLibrary = userLibrary.filter(b => b.id !== bookId);
    setUserLibrary(updatedLibrary);
    localStorage.setItem('userLibrary', JSON.stringify(updatedLibrary));
  };

  const isInLibrary = (bookId) => userLibrary.some(b => b.id === bookId);


  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
      >
        <MdArrowBack className="w-5 h-5" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse & Add Books</h1>
        <p className="text-slate-600">Search for books and add them to your library</p>
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
      <div className="mb-6">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filteredBooks.length}</span> books
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              actionButton={
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInLibrary(book.id)) {
                      handleRemoveFromLibrary(book.id);
                    } else {
                      handleAddToLibrary(book);
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isInLibrary(book.id)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'
                  }`}
                  title={isInLibrary(book.id) ? 'Remove from library' : 'Add to library'}
                >
                  {isInLibrary(book.id) ? 'Added ✓' : 'Add'}
                </button>
              }
            />
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
