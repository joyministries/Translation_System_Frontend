import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { Button } from '../../components/shared/Button';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';

const AFRICAN_LANGUAGES = [
  { id: 1, name: 'Swahili', nativeName: 'Kiswahili', isoCode: 'sw', libreTranslateSupport: true, isActive: true },
  { id: 2, name: 'Yoruba', nativeName: 'Èdè Yorùbá', isoCode: 'yo', libreTranslateSupport: false, isActive: true },
  { id: 3, name: 'Hausa', nativeName: 'Harshe Hausa', isoCode: 'ha', libreTranslateSupport: false, isActive: true },
  { id: 4, name: 'Igbo', nativeName: 'Asụsụ Igbo', isoCode: 'ig', libreTranslateSupport: false, isActive: false },
  { id: 5, name: 'Amharic', nativeName: 'አማርኛ', isoCode: 'am', libreTranslateSupport: true, isActive: true },
  { id: 6, name: 'Oromo', nativeName: 'Afan Oromo', isoCode: 'om', libreTranslateSupport: false, isActive: false },
  { id: 7, name: 'Tigrinya', nativeName: 'ትግርኛ', isoCode: 'ti', libreTranslateSupport: false, isActive: false },
  { id: 8, name: 'Somali', nativeName: 'Soomaali', isoCode: 'so', libreTranslateSupport: false, isActive: true },
  { id: 9, name: 'Afrikaans', nativeName: 'Afrikaans', isoCode: 'af', libreTranslateSupport: true, isActive: true },
  { id: 10, name: 'Zulu', nativeName: 'isiZulu', isoCode: 'zu', libreTranslateSupport: false, isActive: true },
  { id: 11, name: 'Xhosa', nativeName: 'isiXhosa', isoCode: 'xh', libreTranslateSupport: false, isActive: false },
  { id: 12, name: 'Sotho', nativeName: 'Sesotho', isoCode: 'st', libreTranslateSupport: false, isActive: true },
  { id: 13, name: 'Tswana', nativeName: 'Setswana', isoCode: 'tn', libreTranslateSupport: false, isActive: false },
  { id: 14, name: 'Kinyarwanda', nativeName: 'Kinyarwanda', isoCode: 'rw', libreTranslateSupport: false, isActive: true },
  { id: 15, name: 'Luganda', nativeName: 'Luganda', isoCode: 'lg', libreTranslateSupport: false, isActive: false },
  { id: 16, name: 'Chichewa', nativeName: 'Chichewa', isoCode: 'ny', libreTranslateSupport: false, isActive: true },
  { id: 17, name: 'Arabic', nativeName: 'العربية', isoCode: 'ar', libreTranslateSupport: true, isActive: true },
  { id: 18, name: 'Fulani', nativeName: 'Fulfulde', isoCode: 'ff', libreTranslateSupport: false, isActive: false },
  { id: 19, name: 'Bambara', nativeName: 'Bamanankan', isoCode: 'bm', libreTranslateSupport: false, isActive: false },
  { id: 20, name: 'Wolof', nativeName: 'Wolof', isoCode: 'wo', libreTranslateSupport: false, isActive: true },
];

export function Languages() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState({ name: '', nativeName: '', isoCode: '' });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchLanguages = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await adminAPI.languages.list(page, pagination.limit);
      const data = response.data;
      setLanguages(data.items || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.pages || 1,
        page: data.page || 1,
      }));
    } catch (error) {
      toast.error('Failed to fetch languages.');
      console.error(error);
      setLanguages(AFRICAN_LANGUAGES); // Fallback to mock data on error
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchLanguages(pagination.page);
  }, [fetchLanguages, pagination.page]);

  const validateForm = () => {
    const errors = {};

    if (!newLanguage.name.trim()) {
      errors.name = 'Language name is required';
    }

    if (!newLanguage.isoCode.trim()) {
      errors.isoCode = 'ISO code is required';
    } else if (newLanguage.isoCode.length !== 2) {
      errors.isoCode = 'ISO code must be 2 characters';
    } else if (!/^[a-z]{2}$/.test(newLanguage.isoCode)) {
      errors.isoCode = 'ISO code must be lowercase letters only';
    } else if (languages.some((l) => l.isoCode === newLanguage.isoCode.toLowerCase())) {
      errors.isoCode = 'This ISO code already exists';
    }

    return errors;
  };

  const handleToggleLanguage = (languageId) => {
    const language = languages.find((l) => l.id === languageId);
    if (language?.isActive) {
      // Show confirmation when deactivating
      setConfirmToggle(languageId);
    } else {
      // Directly activate without confirmation
      performToggle(languageId);
    }
  };

  const performToggle = async (languageId) => {
    setTogglingId(languageId);
    try {
      // The toggle endpoint in the provided API doesn't exist, let's assume it should be separate activate/deactivate
      const lang = languages.find(l => l.id === languageId);
      if (lang.isActive) {
        await adminAPI.languages.deactivate(languageId);
      } else {
        await adminAPI.languages.activate(languageId);
      }

      // Update local state
      setLanguages((prev) =>
        prev.map((lang) =>
          lang.id === languageId ? { ...lang, isActive: !lang.isActive } : lang
        )
      );

      const language = languages.find((l) => l.id === languageId);
      const newStatus = !language.isActive;
      toast.success(
        `${language.name} ${newStatus ? 'activated' : 'deactivated'} for students`
      );
      setConfirmToggle(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update language');
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddLanguage = async () => {
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await adminAPI.languages.create(newLanguage);
      toast.success('Language added successfully!');
      setNewLanguage({ name: '', nativeName: '', isoCode: '' });
      fetchLanguages(pagination.page); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to add language');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
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

      <h1 className="text-3xl font-bold text-gray-800">Manage Languages</h1>
      <p className="text-gray-600 mt-2">
        Activate or deactivate languages available for translation.
      </p>

      {/* Add New Language Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Add New Language</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <input
            type="text"
            placeholder="Language Name (e.g., French)"
            value={newLanguage.name}
            onChange={(e) => {
              setNewLanguage({ ...newLanguage, name: e.target.value });
              setFormErrors({ ...formErrors, name: null });
            }}
            className={`w-full p-3 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          <input
            type="text"
            placeholder="Native Name (e.g., Français)"
            value={newLanguage.nativeName}
            onChange={(e) => setNewLanguage({ ...newLanguage, nativeName: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="ISO Code (e.g., fr)"
            value={newLanguage.isoCode}
            onChange={(e) => {
              setNewLanguage({ ...newLanguage, isoCode: e.target.value.toLowerCase() });
              setFormErrors({ ...formErrors, isoCode: null });
            }}
            maxLength="2"
            className={`w-full p-3 border rounded-md ${formErrors.isoCode ? 'border-red-500' : 'border-gray-300'}`}
          />
          <Button onClick={handleAddLanguage} disabled={loading} className="w-full md:w-auto">
            {loading ? 'Adding...' : 'Add Language'}
          </Button>
        </div>
        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
        {formErrors.isoCode && <p className="text-red-500 text-sm mt-1">{formErrors.isoCode}</p>}
      </div>

      {/* Language List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading Languages...</p>
          </div>
        ) : languages.length === 0 ? (
          <EmptyState
            title="No Languages Found"
            message="There are no languages to display. Try adding one using the form above."
          />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Native Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISO Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LibreTranslate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {languages.map((language) => (
                <tr key={language.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {language.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {language.nativeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {language.isoCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {language.libreTranslateSupport ? (
                      <span className="text-green-600 font-semibold">Supported</span>
                    ) : (
                      <span className="text-gray-400">Not Supported</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {language.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant={language.isActive ? 'danger' : 'primary'}
                      onClick={() => handleToggleLanguage(language.id)}
                      disabled={togglingId === language.id}
                      size="sm"
                    >
                      {togglingId === language.id
                        ? 'Updating...'
                        : language.isActive
                        ? 'Deactivate'
                        : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
         {/* Pagination Controls */}
         {!loading && languages.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmToggle !== null}
        title="Deactivate Language"
        message="Students will no longer see this language."
        confirmText="Deactivate"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={togglingId === confirmToggle}
        onConfirm={() => performToggle(confirmToggle)}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
}

