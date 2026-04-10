import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { MdAdd } from 'react-icons/md';
import { FilterPanel } from '../../components/student/FilterPanel';
import { BookCard } from '../../components/student/BookCard';

export function StudentDashboard() {
  const navigate = useNavigate();
  const [userLibrary, setUserLibrary] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    category: 'All Categories',
  });

  // Load user library from localStorage on mount
  useEffect(() => {
    const library = JSON.parse(localStorage.getItem('userLibrary')) || [];
    setUserLibrary(library);
  }, []);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  // Filter books based on activeFilters
  const filteredBooks = userLibrary.filter((book) => {
    if (activeFilters.category !== 'All Categories' && book.subject !== activeFilters.category) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6">
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Library</h1>
        <p className="text-slate-600">Books you've added to your collection</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/student/browse')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MdAdd className="w-5 h-5" />
          Add Books to Library
        </button>
      </div>

      {/* Filter Panel */}
      {userLibrary.length > 0 && (
        <div className="mb-8">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>
      )}

      {/* Results Summary */}
      {userLibrary.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredBooks.length}</span> books
            {activeFilters.category !== 'All Categories' && ` in ${activeFilters.category}`}
          </p>
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : userLibrary.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600 text-lg">Your library is empty</p>
          <p className="text-slate-500 mt-2">Start by adding books from our collection</p>
          <button
            onClick={() => navigate('/student/browse')}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            Browse & Add Books
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600 text-lg">No books found matching your filters.</p>
          <p className="text-slate-500 mt-2">Try adjusting your filter selections.</p>
        </div>
      )}
    </div>
  );
}