import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { adminAPI } from '../../api/admin';
import { AnswerKeyTable } from '../../components/admin/AnswerKeyTable';
import { AnswerKeyImportForm } from '../../components/admin/AnswerKeyImportForm';
import { Button } from '../../components/shared/Button';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { Modal } from '../../components/shared/Modal';

export function AnswerKeys() {
  const navigate = useNavigate();
  const [answerKeys, setAnswerKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchAnswerKeys = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.answerkeys.list();
      setAnswerKeys(response.data.answer_keys || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch answer keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswerKeys();
  }, []);

  const handleImportSuccess = () => {
    setShowImportModal(false);
    fetchAnswerKeys();
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
          onRetry={fetchAnswerKeys}
        />
      );
    }

    if (answerKeys.length === 0) {
      return (
        <EmptyState
          title="No Answer Keys Found"
          message="Get started by importing a new answer key."
        >
            <Button onClick={() => setShowImportModal(true)}>Import Answer Key</Button>
        </EmptyState>
      );
    }

    return (
      <AnswerKeyTable 
        answerKeys={answerKeys} 
        onSelectAnswerKey={(answerKey) => {
            // Logic to handle viewing an answer key can be added here
            console.log("Selected answer key:", answerKey);
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
            <h1 className="text-3xl font-bold text-gray-800">Answer Keys</h1>
        </div>
        <Button onClick={() => setShowImportModal(true)}>Import Answer Key</Button>
      </div>

      {renderContent()}

      <Modal 
        isOpen={showImportModal} 
        title="Import Answer Key"
        actions={
            <Button variant="secondary" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
        }
        >
        <AnswerKeyImportForm onImportSuccess={handleImportSuccess} />
      </Modal>
    </div>
  );
}
