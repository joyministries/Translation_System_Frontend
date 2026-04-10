import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { Button } from '../../components/shared/Button';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { adminAPI } from '../../api/admin.api.js';
import toast from 'react-hot-toast';

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
  const [languages, setLanguages] = useState(AFRICAN_LANGUAGES);
  const [newLanguage, setNewLanguage] = useState({ name: '', nativeName: '', isoCode: '' });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);

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
      await adminAPI.languages.toggle(languageId);

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
      toast.error('Please fix the errors in the form');
      return;
    }

    setFormErrors({});
    setLoading(true);

    try {
      // Simulate API call
      const id = Math.max(...languages.map((l) => l.id), 0) + 1;
      const addedLanguage = {
        id,
        ...newLanguage,
        nativeName: newLanguage.nativeName || newLanguage.name,
        isoCode: newLanguage.isoCode.toLowerCase(),
        libreTranslateSupport: false,
        isActive: true,
      };

      setLanguages((prev) => [addedLanguage, ...prev]);
      toast.success(`${newLanguage.name} added successfully`);
      setNewLanguage({ name: '', nativeName: '', isoCode: '' });
    } catch (error) {
      setFormErrors({ submit: error.message || 'Failed to add language' });
      toast.error(error.message || 'Failed to add language');
    } finally {
      setLoading(false);
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

      <h1 className="text-3xl font-bold text-gray-900">Languages Manager</h1>

      {/* Add New Language Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Language</h2>
        
        {formErrors.submit && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{formErrors.submit}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Language Name"
              value={newLanguage.name}
              onChange={(e) =>
                setNewLanguage({ ...newLanguage, name: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.name && (
              <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Native Name (optional)"
              value={newLanguage.nativeName}
              onChange={(e) =>
                setNewLanguage({ ...newLanguage, nativeName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="ISO Code (e.g., en)"
              value={newLanguage.isoCode}
              onChange={(e) =>
                setNewLanguage({ ...newLanguage, isoCode: e.target.value })
              }
              maxLength="2"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.isoCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.isoCode && (
              <p className="text-xs text-red-600 mt-1">{formErrors.isoCode}</p>
            )}
          </div>

          <Button
            variant="primary"
            onClick={handleAddLanguage}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Language'}
          </Button>
        </div>
      </div>

      {/* Languages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Native Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISO Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LibreTranslate Support
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {languages.map((language) => (
                <tr key={language.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {language.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {language.nativeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                    {language.isoCode.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      language.libreTranslateSupport
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {language.libreTranslateSupport ? '✓ Yes' : '✗ No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleLanguage(language.id)}
                      disabled={togglingId === language.id}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        language.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {togglingId === language.id ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Toggling...
                        </span>
                      ) : language.isActive ? (
                        'Active'
                      ) : (
                        'Inactive'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Languages</p>
          <p className="text-2xl font-bold text-gray-900">{languages.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Active Languages</p>
          <p className="text-2xl font-bold text-green-600">
            {languages.filter((l) => l.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">LibreTranslate Support</p>
          <p className="text-2xl font-bold text-blue-600">
            {languages.filter((l) => l.libreTranslateSupport).length}
          </p>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
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

