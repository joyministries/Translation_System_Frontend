import { ConfirmModal } from '../shared/ConfirmModal';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';


export function BookTable({ books, loading, onBooksChanged }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
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

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {book.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {book.gradeLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {book.uploadedBy || 'Admin'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => onBooksChanged?.('translate', book)}
                      className={`font-medium ${
                        (book.extractionStatus === 'pending' || book.extraction_status === 'pending')
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 hover:text-blue-900'
                      }`}
                      disabled={book.extractionStatus === 'pending' || book.extraction_status === 'pending'}
                      title={(book.extractionStatus === 'pending' || book.extraction_status === 'pending') ? 'Book extraction is pending' : 'Translate book'}
                    >
                      Translate
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(book.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
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

