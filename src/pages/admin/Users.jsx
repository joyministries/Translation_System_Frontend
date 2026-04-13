import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, 
        MdAdd, 
        MdDelete, 
        MdEdit,
        MdEmail } from 'react-icons/md';
import { Button } from '../../components/shared/Button';
import { Modal } from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';

export function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'student',
    institution: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch institutions
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await adminAPI.institutions.list();
        setInstitutions(response.data.institutions || []);
      } catch (error) {
        console.error('Failed to fetch institutions:', error);
        toast.error('Failed to load institutions');
      }
    };
    fetchInstitutions();
  }, []);

  // Fetch users from API

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.users.list();
        setUsers(response.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else if (users.some(u => u.email === formData.email)) {
      newErrors.email = 'Email already exists';
    }

    if (!formData.institution) {
      newErrors.institution = 'Institution is required';
    }

    return newErrors;
  };

  const handleCreateUser = async () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const tempPassword = Math.random().toString(36).slice(-8); // Generate a random 8-character password
      const userData = {
        email: formData.email,
        role: formData.role,
        institution_id: formData.institution,
        password: tempPassword,
      };
      console.log("Creating user with data:", userData);
      
      const response = await adminAPI.users.create(userData);
      console.log("Users:", response);
      // Add new user to list (or refresh the entire list)
      const newUser = response.data || response;
      setUsers([...users, newUser]);
      
      toast.success(`User ${formData.email} created successfully! They will receive an email to set their password.`);
      setShowCreateModal(false);
      setFormData({
        email: '',
        role: 'student',
        institution: '',
      });
      setErrors({});
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create user';
      toast.error(errorMsg);
      console.error('Create user error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await adminAPI.users.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete user';
      toast.error(errorMsg);
      console.error('Delete user error:', error);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await adminAPI.users.resetPassword(userId);
      toast.success('Password reset email sent successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send password reset email';
      toast.error(errorMsg);
      console.error('Reset password error:', error);
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Create and manage user accounts. Users will receive an email to set their password.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <MdAdd className="w-5 h-5" />
          Create User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Institution</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? '👨‍💼 Admin' : '👤 Student'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.institution}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast.info('Edit functionality coming soon')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit user"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete user"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        title="Reset password"
                        tool
                        >
                          <MdEmail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  <p className="text-gray-500 text-lg">No users created yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Create User" to add your first user</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User">
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <select
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.institution ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
            {errors.institution && <p className="text-red-600 text-sm mt-1">{errors.institution}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              onClick={handleCreateUser}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={() => handleDeleteUser(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
          confirmText="Delete"
          confirmVariant="danger"
        />
      )}
    </div>
  );
}
