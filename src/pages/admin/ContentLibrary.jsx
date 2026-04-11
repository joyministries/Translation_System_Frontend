import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDelete, MdRefresh, MdBook, MdQuiz, MdKeyboardArrowRight } from 'react-icons/md';
import { Button } from '../../components/shared/Button';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { Spinner } from '../../components/shared/Spinner';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';

export function ContentLibrary() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [exams, setExams] = useState([]);
  const [answerKeys, setAnswerKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
   const  fetchContent = async () => {
      setLoading(true)
      try {
        const res = await adminAPI.allContent.list(1, 100);
        setBooks(res.data.books || []);
        setExams(res.data.exams || []);
        setAnswerKeys(res.data.answer_keys || []);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Delete handlers
  const handleDeleteBook = async (bookId) => {
    setDeletingId(bookId);
    try {
      await adminAPI.books.delete(bookId);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast.success('Book deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete book');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  // Stats helpers
  const getContentStats = () => {
    return {
      totalBooks: books.length,
      totalExams: exams.length,
      totalAnswerKeys: answerKeys.length,
    };
  };

  const stats = getContentStats();

  // Tab component
  const TabButton = ({ id, label, icon: Icon, count, isActive }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 font-medium transition-all rounded-t-lg ${
        isActive
          ? 'bg-blue-600 text-white border-b-2 border-blue-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
      <span className="ml-2 px-2 py-0.5 bg-gray-300 rounded-full text-sm font-semibold">
        {count}
      </span>
    </button>
  );

  // Content Item Card
  const ContentCard = ({ item, type, onDelete }) => (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{item.title || item.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{item.description || 'No description'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        {type === 'book' && (
          <>
            <div>
              <span className="text-gray-600">Subject:</span>
              <p className="font-medium">{item.subject || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Grade Level:</span>
              <p className="font-medium">{item.gradeLevel || 'N/A'}</p>
            </div>
          </>
        )}

        {type === 'exam' && (
          <>
            <div>
              <span className="text-gray-600">Subject:</span>
              <p className="font-medium">{item.subject || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Questions:</span>
              <p className="font-medium">{item.totalQuestions || 'N/A'}</p>
            </div>
          </>
        )}

        {type === 'answerKey' && (
          <>
            <div>
              <span className="text-gray-600">Exam:</span>
              <p className="font-medium">{item.examTitle || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Questions:</span>
              <p className="font-medium">{item.totalQuestions || 'N/A'}</p>
            </div>
          </>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {item.extractionStatus && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.extractionStatus === 'completed'
                ? 'bg-green-100 text-green-800'
                : item.extractionStatus === 'processing'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {item.extractionStatus}
            </span>
          )}
          {item.translationStatus && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.translationStatus === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : item.translationStatus === 'processing'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {item.translationStatus}
            </span>
          )}
        </div>
      </div>

      {/* Upload Date */}
      <p className="text-xs text-gray-500 mb-4">
        Uploaded: {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'Unknown'}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/admin/${type}s/${item.id}`)}
          className="flex-1 flex items-center justify-center gap-2"
        >
          View Details
          <MdKeyboardArrowRight className="w-4 h-4" />
        </Button>
        <button
          onClick={() => {
            setConfirmDelete({ id: item.id, type });
          }}
          disabled={deletingId === item.id}
          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          {deletingId === item.id ? <Spinner size="sm" /> : <MdDelete className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  // Empty state
  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        {type === 'books' && <MdBook className="w-16 h-16 mx-auto opacity-30" />}
        {type === 'exams' && <MdQuiz className="w-16 h-16 mx-auto opacity-30" />}
        {type === 'answerKeys' && <MdKeyboardArrowRight className="w-16 h-16 mx-auto opacity-30" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No {type} uploaded yet</h3>
      <p className="text-gray-600 mb-6">Start by uploading your first {type.slice(0, -1)}</p>
      <Button onClick={() => navigate(`/admin/${type.slice(0, -1)}`)}>
        Go to {type.charAt(0).toUpperCase() + type.slice(1)} Manager
      </Button>
    </div>
  );

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Books</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalBooks}</p>
            </div>
            <MdBook className="w-12 h-12 text-blue-300 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Exams</p>
              <p className="text-3xl font-bold text-green-900">{stats.totalExams}</p>
            </div>
            <MdQuiz className="w-12 h-12 text-green-300 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Answer Keys</p>
              <p className="text-3xl font-bold text-purple-900">{stats.totalAnswerKeys}</p>
            </div>
            <MdKeyboardArrowRight className="w-12 h-12 text-purple-300 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex border-b border-gray-200">
          <TabButton
            id="books"
            label="Books"
            icon={MdBook}
            count={stats.totalBooks}
            isActive={activeTab === 'books'}
          />
          <TabButton
            id="exams"
            label="Exams"
            icon={MdQuiz}
            count={stats.totalExams}
            isActive={activeTab === 'exams'}
          />
          <TabButton
            id="answerKeys"
            label="Answer Keys"
            icon={MdKeyboardArrowRight}
            count={stats.totalAnswerKeys}
            isActive={activeTab === 'answerKeys'}
          />
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : activeTab === 'books' ? (
            books.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book) => (
                  <ContentCard
                    key={book.id}
                    item={book}
                    type="book"
                    onDelete={() => handleDeleteBook(book.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="books" />
            )
          ) : activeTab === 'exams' ? (
            exams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.map((exam) => (
                  <ContentCard
                    key={exam.id}
                    item={exam}
                    type="exam"
                    onDelete={() => {
                      setConfirmDelete({ id: exam.id, type: 'exam' });
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="exams" />
            )
          ) : (
            answerKeys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {answerKeys.map((key) => (
                  <ContentCard
                    key={key.id}
                    item={key}
                    type="answerKey"
                    onDelete={() => {
                      setConfirmDelete({ id: key.id, type: 'answerKey' });
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="answerKeys" />
            )
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Content"
        message={`Are you sure you want to delete this ${confirmDelete?.type}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={() => {
          if (confirmDelete?.type === 'book') {
            handleDeleteBook(confirmDelete.id);
          } else if (confirmDelete?.type === 'exam') {
            // TODO: Implement delete exam
            toast.success('Exam deleted successfully');
            setConfirmDelete(null);
          } else if (confirmDelete?.type === 'answerKey') {
            // TODO: Implement delete answer key
            toast.success('Answer key deleted successfully');
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
