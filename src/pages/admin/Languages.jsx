import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdEdit, MdDelete } from 'react-icons/md';
import { Button } from '../../components/shared/Button';
import { Modal } from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';

export function Languages() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', abbreviation: '' });
  const [formErrors, setFormErrors] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.languages.list(1, 1000);

      // Handle different response formats
      let languagesData = response.data.languages;

      setLanguages(Array.isArray(languagesData) ? languagesData : []);
    } catch (error) {
      toast.error('Failed to fetch languages.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Language name is required';
    }

    if (!formData.abbreviation.trim()) {
      errors.abbreviation = 'Language abbreviation is required';
    } else if (formData.abbreviation.length !== 2) {
      errors.abbreviation = 'Abbreviation must be 2 characters';
    } else if (!/^[a-z]{2}$/.test(formData.abbreviation)) {
      errors.abbreviation = 'Abbreviation must be lowercase letters only';
    } else if (!isEditing && languages.some((l) => l.abbreviation === formData.abbreviation.toLowerCase())) {
      errors.abbreviation = 'This abbreviation already exists';
    }

    return errors;
  };

  const handleOpenModal = (language = null) => {
    if (language) {
      setIsEditing(true);
      setFormData({
        id: language.id,
        name: language.name || '',
        native_name: language.native_name || language.nativeName || '',
        code: language.code || language.isoCode || '',
      });
    } else {
      setIsEditing(false);
      setFormData({ name: '', native_name: '', code: '' });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', native_name: '', code: '' });
    setFormErrors({});
    setIsEditing(false);
  };

  const handleSaveLanguage = async () => {
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setActionLoading('save');
    try {
      if (isEditing) {
        const res = await adminAPI.languages.update(formData.id, {
          name: formData.name,
          native_name: formData.native_name,
          code: formData.code,
        });
        toast.success('Language updated successfully!');
      } else {
        const res = await adminAPI.languages.create({
          name: formData.name,
          native_name: formData.native_name,
          code: formData.code,
        });
        toast.success('Language created successfully!');
      }
      handleCloseModal();
      fetchLanguages();
    } catch (error) {
      toast.error(error.message || 'Failed to save language');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleLanguage = async (languageId, currentStatus) => {
    setActionLoading(languageId);
    try {
      if (currentStatus) {
        const res = await adminAPI.languages.deactivate(languageId);
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

  const handleDeleteLanguage = async (languageId) => {
    setActionLoading(languageId);
    try {
      const res = await adminAPI.languages.delete(languageId);
      toast.success('Language deleted successfully');
      fetchLanguages();
    } catch (error) {
      toast.error(error.message || 'Failed to delete language');
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Languages Management</h1>
          <p className="text-gray-600 mt-1">Manage and configure available languages for the system.</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal(null)}>
          Add Language
        </Button>
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
            message="Add your first language to get started."
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
              {languages.map((language) => (
                <tr key={language.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{language.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{language.native_name || language.nativeName || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{language.code || language.isoCode}</td>
                  <td className="px-6 py-4 text-sm">
                    {language.isActive ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex items-center">
                    <button
                      onClick={() => handleOpenModal(language)}
                      disabled={actionLoading === language.id}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Edit language"
                    >
                      <MdEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleLanguage(language.id, language.isActive)}
                      disabled={actionLoading === language.id}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 ${language.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                    >
                      {actionLoading === language.id ? 'Loading...' : language.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setConfirmAction(language.id)}
                      disabled={actionLoading === language.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete language"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Language Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={isEditing ? 'Edit Language' : 'Add New Language'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setFormErrors({ ...formErrors, name: '' });
              }}
              placeholder="e.g., French"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Native Name</label>
            <input
              type="text"
              value={formData.native_name}
              onChange={(e) => setFormData({ ...formData, native_name: e.target.value })}
              placeholder="e.g., Français"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.toLowerCase() });
                setFormErrors({ ...formErrors, code: '' });
              }}
              placeholder="e.g., fr"
              maxLength="2"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.code ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {formErrors.code && <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveLanguage}
              disabled={actionLoading === 'save'}
              className="flex-1"
            >
              {actionLoading === 'save' ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => handleDeleteLanguage(confirmAction)}
          title="Delete Language"
          message="Are you sure you want to delete this language? This action cannot be undone."
          isDangerous={true}
          isLoading={actionLoading === confirmAction}
        />
      )}
    </div>
  );
}

