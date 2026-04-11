import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { Button } from '../../components/shared/Button';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';

export function Institutions() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [books, setBooks] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [localAssignments, setLocalAssignments] = useState({});
  const [loading, setLoading] = useState(false);

  // Default institutions to display
  const defaultInstitutions = [
    {
      id: 1,
      name: 'Lambton Christian School',
      code: 'LCS',
      contact: 'info@lambtoncristian.edu',
      assignedBooks: [],
    },
    {
      id: 2,
      name: 'New Haven Academy',
      code: 'NHA',
      contact: 'contact@newhavencademy.edu',
      assignedBooks: [],
    },
  ];

  // Fetch institutions and books from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [institutionsRes, booksRes] = await Promise.all([
        adminAPI.institutions.list().catch(() => ({ data: [] })),
        adminAPI.books.list().catch(() => ({ data: [] })),
      ]);

      // Handle different response formats for institutions
      let institutionsData = [];
      if (institutionsRes.data?.institutions) {
        institutionsData = institutionsRes.data.institutions;
      } else if (institutionsRes.data && Array.isArray(institutionsRes.data)) {
        institutionsData = institutionsRes.data;
      } else if (Array.isArray(institutionsRes)) {
        institutionsData = institutionsRes;
      }

      // Use default institutions if API returns empty
      if (institutionsData.length === 0) {
        institutionsData = defaultInstitutions;
      }

      // Handle different response formats for books
      let booksData = [];
      if (booksRes.data?.books) {
        booksData = booksRes.data.books;
      } else if (booksRes.data && Array.isArray(booksRes.data)) {
        booksData = booksRes.data;
      } else if (Array.isArray(booksRes)) {
        booksData = booksRes;
      }

      setInstitutions(Array.isArray(institutionsData) ? institutionsData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Use default institutions on error
      setInstitutions(defaultInstitutions);
      toast.error('Failed to load institutions and books');
    } finally {
      setLoading(false);
    }
  }, [defaultInstitutions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Initialize local assignments state
    const assignments = {};
    institutions.forEach((inst) => {
      assignments[inst.id] = new Set(inst.assignedBooks || []);
    });
    setLocalAssignments(assignments);
  }, [institutions]);

  const handleToggleBook = (instId, bookId) => {
    setLocalAssignments((prev) => {
      const updated = { ...prev };
      if (!updated[instId]) {
        updated[instId] = new Set();
      }

      const newSet = new Set(updated[instId]);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      updated[instId] = newSet;
      return updated;
    });
  };

  const handleSaveAssignments = async (instId) => {
    setSavingId(instId);
    try {
      const newAssignments = Array.from(localAssignments[instId] || new Set());

      // Call API to save book assignments
      await adminAPI.institutions.assignBooks(instId, newAssignments);

      // Update local state on success
      setInstitutions((prev) =>
        prev.map((inst) =>
          inst.id === instId
            ? { ...inst, assignedBooks: newAssignments }
            : inst
        )
      );

      toast.success('Book assignments updated successfully');
      setExpandedId(null);
    } catch (error) {
      // Revert changes on error
      setLocalAssignments((prev) => ({
        ...prev,
        [instId]: new Set(
          institutions.find((i) => i.id === instId)?.assignedBooks || []
        ),
      }));
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update assignments';
      toast.error(errorMsg);
      console.error('Save assignments error:', error);
    } finally {
      setSavingId(null);
    }
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

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Institutions Manager</h1>
        {loading && <p className="text-sm text-blue-600">Loading institutions...</p>}
      </div>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 gap-6">
        {institutions.map((institution) => (
          <div key={institution.id} className="bg-white rounded-lg shadow">
            {/* Institution Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {institution.name}
                    </h2>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {institution.code}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    📧{' '}
                    <a href={`mailto:${institution.contact}`} className="text-blue-600 hover:underline">
                      {institution.contact}
                    </a>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Assigned Books</p>
                  <p className="text-xl font-bold text-blue-600">
                    {institution.assignedBooks.length}/{books.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Assignments */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Currently Assigned:</p>
              {institution.assignedBooks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {institution.assignedBooks.map((bookId) => {
                    const book = books.find((b) => b.id === bookId);
                    return (
                      <span
                        key={bookId}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {book?.title || `Book ${bookId}`}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No books assigned yet</p>
              )}
            </div>

            {/* Expand/Collapse Section */}
            <div className="p-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExpandedId(expandedId === institution.id ? null : institution.id)}
              >
                {expandedId === institution.id ? '▼ Hide' : '▶ Manage'} Assignments
              </Button>

              {/* Book Assignment Checkboxes */}
              {expandedId === institution.id && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <p className="text-sm font-medium text-gray-900 mb-4">Select Books to Assign:</p>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {books.map((book) => {
                      const isAssigned =
                        localAssignments[institution.id]?.has(book.id) || false;
                      return (
                        <label
                          key={book.id}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleToggleBook(institution.id, book.id)}
                            disabled={savingId === institution.id}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-gray-900">{book.title}</p>
                            <p className="text-xs text-gray-500">{book.subject}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="mt-6 flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setLocalAssignments((prev) => ({
                          ...prev,
                          [institution.id]: new Set(institution.assignedBooks),
                        }));
                        setExpandedId(null);
                      }}
                      disabled={savingId === institution.id}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSaveAssignments(institution.id)}
                      disabled={savingId === institution.id}
                    >
                      {savingId === institution.id ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Post-Sprint Integration Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Frontend Status: Ready for Backend Integration</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Institution list with details (code, contact)</li>
          <li>✅ Book assignment UI with checkboxes</li>
          <li>✅ Mock data fully functional for demo</li>
          <li>⏳ Backend endpoints required (POST/PUT for book assignments)</li>
          <li>📌 Note: Saturday deadline may require post-sprint backend wiring</li>
        </ul>
      </div>
    </div>
  );
}
