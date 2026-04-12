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

export function Exams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

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

    return (
      <ExamTable 
        exams={exams} 
        onSelectExam={(exam) => {
            // Logic to handle viewing an exam can be added here
            console.log("Selected exam:", exam);
        }}
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
        {exams.length > 0 && !loading && (
            <Button onClick={() => setShowImportModal(true)}>Import Exam</Button>
        )}
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
    </div>
  );
}
