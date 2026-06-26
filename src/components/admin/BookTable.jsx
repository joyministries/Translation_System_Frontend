import { ConfirmModal } from '../shared/ConfirmModal';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';
import { MoreVertical, Globe, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ActionDropdown({ book, onTranslate, onDelete, isLast }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPending = book.extractionStatus === 'pending' || book.extraction_status === 'pending';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 ${isLast ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <button
            onClick={() => {
              setIsOpen(false);
              navigate(`/admin/book/${book.id}`, { state: { book } });
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            View Translations
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              if (!isPending) onTranslate(book);
            }}
            disabled={isPending}
            title={isPending ? 'Book extraction is pending' : 'Translate book'}
            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isPending
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Globe className="w-4 h-4" />
            Translate
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onDelete(book.id);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Colour map for common file extensions
const FILE_TYPE_COLORS = {
  pdf: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  docx: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  doc: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  txt: { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' },
  epub: { bg: '#EDE9FE', color: '#5B21B6', border: '#DDD6FE' },
  xlsx: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  xls: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
};

function FileTypeBadge({ book }) {
  // Prefer an explicit field, fall back to deriving from filename
  const raw =
    book.file_type ||
    book.fileType ||
    (book.name && book.name.includes('.') ? book.name.split('.').pop() : null) ||
    (book.file_name && book.file_name.includes('.') ? book.file_name.split('.').pop() : null) ||
    '';

  const ext = raw.toLowerCase().replace(/^\./, '');
  const style = FILE_TYPE_COLORS[ext] || { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' };
  const label = ext ? ext.toUpperCase() : 'Unknown';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {label}
    </span>
  );
}

export function BookTable({ books, loading, onBooksChanged }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await adminAPI.books.delete(deleteConfirm);
      toast.success('Book deleted successfully');
      setDeleteConfirm(null);
      onBooksChanged?.();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">No books uploaded yet</div>
      </div>
    );
  }

  const sortedBooks = [...books].sort((a, b) => {
    const titleA = a.title || '';
    const titleB = b.title || '';
    return sortOrder === 'asc'
      ? titleA.localeCompare(titleB, undefined, { sensitivity: 'base' })
      : titleB.localeCompare(titleA, undefined, { sensitivity: 'base' });
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-visible">
        <div className="overflow-x-visible min-h-[200px]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  title="Click to sort by title"
                >
                  <div className="flex items-center gap-1">
                    <span>Title</span>
                    {sortOrder === 'asc' ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedBooks.map((book, index, arr) => {
                const isLast = index >= arr.length - 2 && arr.length > 2;
                return (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {book.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <FileTypeBadge book={book} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {book.uploadedBy || 'Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <ActionDropdown
                        book={book}
                        onTranslate={(b) => onBooksChanged?.('translate', b)}
                        onDelete={(id) => setDeleteConfirm(id)}
                        isLast={isLast}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Delete Book"
        message="This will remove the book and all its translations. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

