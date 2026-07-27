import { ConfirmModal } from '../shared/ConfirmModal';
import { ActionDropdown } from '../shared/ActionDropdown';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';
import { Globe, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Colour class map for common file extensions
const FILE_TYPE_CLASSES = {
  pdf: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
  docx: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  doc: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  txt: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  epub: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
  xlsx: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  xls: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
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
  const badgeClasses = FILE_TYPE_CLASSES[ext] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  const label = ext ? ext.toUpperCase() : 'Unknown';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider border ${badgeClasses}`}
    >
      {label}
    </span>
  );
}

export function BookTable({ books, loading, onBooksChanged }) {
  const navigate = useNavigate();
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
      toast.error(error.message || 'Failed to delete the book. Please try again.');
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
                const isPending = book.extractionStatus === 'pending' || book.extraction_status === 'pending';
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
                        isLast={isLast}
                        actions={[
                          {
                            label: 'View Translations',
                            icon: <Eye className="w-4 h-4" />,
                            onClick: () => navigate(`/admin/book/${book.id}`, { state: { book } })
                          },
                          {
                            label: 'Translate',
                            icon: <Globe className="w-4 h-4" />,
                            disabled: isPending,
                            title: isPending ? 'Book extraction is pending' : 'Translate book',
                            onClick: () => onBooksChanged?.('translate', book)
                          },
                          {
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4" />,
                            isDangerous: true,
                            onClick: () => setDeleteConfirm(book.id)
                          }
                        ]}
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

