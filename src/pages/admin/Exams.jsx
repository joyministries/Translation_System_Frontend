import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { adminAPI } from '../../api/admin';
import { ExamTable } from '../../components/admin/ExamTable';
import { ExamImportForm } from '../../components/admin/ExamImportForm';
import { Button } from '../../components/shared/Button';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { Modal } from '../../components/shared/Modal';
import { TranslationModal } from '../../components/admin/TranslationModal.jsx';

export function Exams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSection, setSelectedSection] = useState('All');

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.exams.list();
      // Handle different response formats
      let examsData = [];
      if (response?.items) {
        examsData = response.items;
      } else if (Array.isArray(response)) {
        examsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        examsData = response.data;
      } else if (response?.exams) {
        examsData = response.exams;
      }
      setExams(Array.isArray(examsData) ? examsData : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch exams.');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleImportSuccess = () => {
    setShowImportModal(false);
    fetchExams();
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    setShowTranslationModal(true);
  };

  const filteredExams = exams.filter(exam => {
    if (selectedSection === 'All') return true;
    const title = exam.title || '';
    const firstChar = title.trim().charAt(0).toUpperCase();
    if (selectedSection === 'Certificate') return firstChar === 'C';
    if (selectedSection === 'Diploma') return firstChar === 'D';
    if (selectedSection === 'Bachelor') return firstChar === 'B';
    if (selectedSection === 'Others') return !['C', 'D', 'B'].includes(firstChar);
    return true;
  });

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (error) {
      return (
        <EmptyState
          title="Error"
          message={error}
          onRetry={fetchExams}
        />
      );
    }

    if (exams.length === 0) {
      return (
        <EmptyState
          title="No Exams Found"
          message="Get started by importing a new exam."
        >
          <Button onClick={() => setShowImportModal(true)}>Import Exam</Button>
        </EmptyState>
      );
    }

    if (filteredExams.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 font-medium">
          No exams uploaded yet
        </div>
      );
    }

    return (
      <ExamTable
        exams={filteredExams}
        onSelectExam={handleSelectExam}
        onExamsChanged={fetchExams}
      />
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/admin/dashboard')} variant="secondary" size="sm">
            <MdArrowBack />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Exams</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Section Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700 cursor-pointer min-w-[150px] shadow-sm hover:border-gray-400 transition-colors"
            >
              <option value="All">All Sections</option>
              <option value="Certificate">Certificate</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {exams.length > 0 && !loading && (
            <Button onClick={() => setShowImportModal(true)}>Import Exam</Button>
          )}
        </div>
      </div>

      {renderContent()}

      <Modal
        isOpen={showImportModal}
        title="Import Exam"
        actions={
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
        }
      >
        <ExamImportForm onImportSuccess={handleImportSuccess} />
      </Modal>

      {selectedExam && (
        <TranslationModal
          isOpen={showTranslationModal}
          onClose={() => setShowTranslationModal(false)}
          content={selectedExam}
          contentType="exam"
        />
      )}
    </div>
  );
}
