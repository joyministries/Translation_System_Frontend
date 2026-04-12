import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { Button } from '../../components/shared/Button';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';

export function Institutions() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [books, setBooks] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [localAssignments, setLocalAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Lower limit for this page as it has more content per item
    total: 0,
    totalPages: 1,
  });

  const fetchInstitutions = useCallback(async (page) => {
    setLoading(true);
    try {
      // Mocked data
      const mockInstitutions = [
        { id: 1, name: 'Lambton Christian School', code: 'LCS', assigned_books: [1, 2] },
        { id: 2, name: 'New Haven Academy', code: 'NHA', assigned_books: [3] },
        { id: 3, name: 'Team Impact University', code: 'TIU', assigned_books: [] },
      ];
      const mockResponse = {
        data: {
          items: mockInstitutions,
          total: mockInstitutions.length,
          pages: 1,
          page: 1,
        }
      };
      
      const data = mockResponse.data;
      setInstitutions(data.items || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.pages || 1,
        page: data.page || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
      toast.error('Failed to load institutions.');
      setInstitutions([]); // Clear institutions on error
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const fetchBooks = useCallback(async () => {
    try {
      // Fetch all books - assuming the list isn't excessively long
      const response = await adminAPI.books.list(1, 1000); 
      setBooks(response.data?.items || []);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      toast.error('Failed to load books for assignment.');
    }
  }, []);

  useEffect(() => {
    fetchInstitutions(pagination.page);
  }, [fetchInstitutions, pagination.page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    // Initialize local assignments state when institutions change
    const assignments = {};
    institutions.forEach((inst) => {
      // Assuming `assignedBooks` is an array of book IDs
      assignments[inst.id] = new Set(inst.assigned_books || []);
    });
    setLocalAssignments(assignments);
  }, [institutions]);

  const handleToggleBook = (instId, bookId) => {
    setLocalAssignments((prev) => {
      const updated = { ...prev };
      if (!updated[instId]) {
        updated[instId] = new Set();
      }
      const bookSet = updated[instId];
      if (bookSet.has(bookId)) {
        bookSet.delete(bookId);
      } else {
        bookSet.add(bookId);
      }
      return updated;
    });
  };

  const handleSaveAssignments = async (institutionId) => {
    setSavingId(institutionId);
    const bookIds = Array.from(localAssignments[institutionId] || []);
    try {
      await adminAPI.institutions.assignBooks(institutionId, bookIds);
      toast.success('Book assignments updated successfully!');
      // Refresh data for the current institution to get updated state
      await fetchInstitutions(pagination.page);
      setExpandedId(null); // Collapse on save
    } catch (error) {
      console.error('Failed to save assignments:', error);
      toast.error('Failed to save book assignments.');
    } finally {
      setSavingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center mb-8">
        <Button onClick={() => navigate(-1)} variant="icon" className="mr-4">
          <MdArrowBack size={24} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Institutions</h1>
          <p className="text-gray-600 mt-2">
            Assign available books to different institutions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading Institutions...</p>
        </div>
      ) : institutions.length === 0 ? (
        <EmptyState
          title="No Institutions Found"
          message="There are no institutions to display. Contact support to add a new institution."
        />
      ) : (
        <div className="space-y-4">
          {institutions.map((inst) => (
            <div key={inst.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(inst.id)}
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{inst.name}</h2>
                  <p className="text-sm text-gray-500">{inst.code}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-4">
                    {localAssignments[inst.id]?.size || 0} / {books.length} books assigned
                  </span>
                  {expandedId === inst.id ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
                </div>
              </div>

              {expandedId === inst.id && (
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Assign Books</h3>
                  {books.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {books.map((book) => (
                        <div
                          key={book.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            localAssignments[inst.id]?.has(book.id)
                              ? 'bg-blue-100 border-blue-500'
                              : 'bg-gray-100 border-gray-200 hover:border-gray-400'
                          }`}
                          onClick={() => handleToggleBook(inst.id, book.id)}
                        >
                          <p className="font-medium text-sm text-gray-800 truncate">{book.title}</p>
                          <p className="text-xs text-gray-500">{book.grade_level}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No books available to assign. Please upload books first.</p>
                  )}
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => handleSaveAssignments(inst.id)}
                      disabled={savingId === inst.id}
                    >
                      {savingId === inst.id ? 'Saving...' : 'Save Assignments'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && institutions.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
           <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </Button>
              </nav>
            </div>
        </div>
      )}
    </div>
  );
}
