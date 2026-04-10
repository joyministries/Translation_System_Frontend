import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { AnswerKeyImportForm } from '../../components/admin/AnswerKeyImportForm';

export function AnswerKeys() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImportSuccess = () => {
    setRefreshKey((prev) => prev + 1);
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

      <h1 className="text-3xl font-bold text-gray-900">Answer Keys Manager</h1>

      <AnswerKeyImportForm key={refreshKey} onImportSuccess={handleImportSuccess} />

      {/* Answer Keys List Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Imported Answer Keys</h2>
        <p className="text-gray-600">Answer keys list will display here after import (coming soon)</p>
      </div>
    </div>
  );
}
