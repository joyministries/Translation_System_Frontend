import { ConfirmModal } from '../shared/ConfirmModal';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';
import { MoreVertical, Globe, Trash2 } from 'lucide-react';

function ActionDropdown({ exam, onTranslate, onDelete, isLast }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 ${isLast ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <button
            onClick={() => {
              setIsOpen(false);
              onTranslate(exam);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            Translate
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onDelete(exam.id);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function ExamTable({ exams, onSelectExam, onExamsChanged }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await adminAPI.exams.delete(deleteConfirm);
      toast.success('Exam deleted successfully');
      setDeleteConfirm(null);
      onExamsChanged?.();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-visible">
        <div className="overflow-x-visible min-h-[200px]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[...exams].reverse().map((exam, index, arr) => {
                const isLast = index >= arr.length - 2 && arr.length > 2;
                return (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {exam.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exam.created_at || exam.dateUploaded).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <ActionDropdown
                        exam={exam}
                        onTranslate={onSelectExam}
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
        title="Delete Exam"
        message="This will remove the exam and all its translations. This cannot be undone."
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
