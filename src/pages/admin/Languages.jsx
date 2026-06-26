import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { CheckCircle, PauseCircle } from 'lucide-react';

export function Languages() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.languages.list(1, 1000);
      const languagesData = response.data.languages;
      setLanguages(Array.isArray(languagesData) ? languagesData : []);
    } catch (error) {
      toast.error(error.message || 'Could not load languages. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleToggleLanguage = async (languageId, currentStatus) => {
    setActionLoading(languageId);
    try {
      if (currentStatus) {
        await adminAPI.languages.deactivate(languageId);
        toast.success('Language deactivated');
      } else {
        await adminAPI.languages.activate(languageId);
        toast.success('Language activated');
      }
      fetchLanguages();
    } catch (error) {
      toast.error(error.message || 'Failed to update language status');
    } finally {
      setActionLoading(null);
    }
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

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Languages Management</h1>
        <p className="text-gray-600 mt-1">Activate or deactivate available languages for the system.</p>
      </div>

      {/* Total Languages Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Languages</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{languages.length}</p>
          </div>
        </div>
      </div>

      {/* Languages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading languages...</p>
          </div>
        ) : languages.length === 0 ? (
          <EmptyState
            title="No Languages Found"
            message="No languages are available in the system."
          />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Language</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Native Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((language) => {
                const isActive = language.isActive;
                const isBusy = actionLoading === language.id;
                return (
                  <tr key={language.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{language.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{language.native_name || language.nativeName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono uppercase">{language.code || language.isoCode}</td>
                    <td className="px-6 py-4 text-sm">
                      {isActive ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {/* Activate button */}
                        <button
                          onClick={() => !isActive && handleToggleLanguage(language.id, false)}
                          disabled={isBusy || isActive}
                          title={isActive ? 'Already active' : 'Activate language'}
                          className={`p-2 rounded-lg transition-colors ${
                            isActive
                              ? 'text-green-500 bg-green-50 opacity-40 cursor-not-allowed'
                              : 'text-green-600 bg-green-50 hover:bg-green-100 cursor-pointer'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>

                        {/* Deactivate button */}
                        <button
                          onClick={() => isActive && handleToggleLanguage(language.id, true)}
                          disabled={isBusy || !isActive}
                          title={!isActive ? 'Already inactive' : 'Deactivate language'}
                          className={`p-2 rounded-lg transition-colors ${
                            !isActive
                              ? 'text-yellow-500 bg-yellow-50 opacity-40 cursor-not-allowed'
                              : 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 cursor-pointer'
                          }`}
                        >
                          <PauseCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
