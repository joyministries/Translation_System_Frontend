import { ConfirmModal } from '../shared/ConfirmModal';
import { ActionDropdown } from '../shared/ActionDropdown';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';
import { Globe, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ExamTable({ exams, onSelectExam, onExamsChanged }) {
  const navigate = useNavigate();
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
      toast.error(error.message || 'Failed to delete the exam. Please try again.');
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
                        isLast={isLast}
                        actions={[
                          {
                            label: 'View Translations',
                            icon: <Eye className="w-4 h-4" />,
                            onClick: () => navigate(`/admin/exam/${exam.id}`, { state: { exam } })
                          },
                          {
                            label: 'Translate',
                            icon: <Globe className="w-4 h-4" />,
                            onClick: () => onSelectExam(exam)
                          },
                          {
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4" />,
                            isDangerous: true,
                            onClick: () => setDeleteConfirm(exam.id)
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
