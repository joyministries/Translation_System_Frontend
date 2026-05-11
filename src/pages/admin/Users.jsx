import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdAdd,
  MdDelete,
  MdEdit,
  MdEmail,
  MdMoreVert
} from 'react-icons/md';
import { Button } from '../../components/shared/Button';
import { Modal } from '../../components/shared/Modal';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { adminAPI } from '../../api/admin.jsx';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';

function ActionDropdown({ user, onEdit, onDelete, onResetPassword, isLast }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <MdMoreVert className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 ${isLast ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <button
            onClick={() => { setIsOpen(false); onEdit(user); }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <MdEdit className="w-4 h-4 text-blue-600" />
            Edit User
          </button>

          <button
            onClick={() => { setIsOpen(false); onResetPassword(user.id); }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <MdEmail className="w-4 h-4 text-yellow-600" />
            Reset Password
          </button>

          <button
            onClick={() => { setIsOpen(false); onDelete(user.id); }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <MdDelete className="w-4 h-4" />
            Delete User
          </button>
        </div>
      )}
    </div>
  );
}

export function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'student' });
  const [createErrors, setCreateErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal state
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', role: 'student', name: '' });
  const [editErrors, setEditErrors] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.users.list();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── CREATE ──────────────────────────────────────────────
  const validateCreate = () => {
    const errs = {};
    if (!createForm.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      errs.email = 'Invalid email format';
    } else if (users.some(u => u.email === createForm.email)) {
      errs.email = 'Email already exists';
    }
    return errs;
  };

  const handleCreateUser = async () => {
    const errs = validateCreate();
    if (Object.keys(errs).length > 0) { setCreateErrors(errs); return; }
    setIsCreating(true);
    try {
      const tempPassword = Math.random().toString(36).slice(-8);
      const response = await adminAPI.users.create({
        full_name: createForm.name,
        email: createForm.email,
        role: createForm.role,
        password: tempPassword,
      });

      const newUser = response.data || response;
      setUsers(prev => [...prev, newUser]);
      toast.success(`User ${createForm.email} created successfully!`);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', role: 'student' });
      setCreateErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  // ── EDIT ────────────────────────────────────────────────
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.full_name || '',
      email: user.email || '',
      role: user.role || 'student',
    });
    setEditErrors({});
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errs.email = 'Invalid email format';
    }
    return errs;
  };

  const handleSaveEdit = async () => {
    const errs = validateEdit();
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setIsSavingEdit(true);
    try {
      const updated = await adminAPI.users.update(editUser.id, {
        full_name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      });
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...updated } : u));
      toast.success('User updated successfully');
      setEditUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update user');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ── DELETE ──────────────────────────────────────────────
  const handleDeleteUser = async (userId) => {
    try {
      await adminAPI.users.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete user');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // ── RESET PASSWORD ───────────────────────────────────────
  const handleResetPassword = async (userId) => {
    // Find the user to get their email
    const target = users.find(u => u.id === userId);
    if (!target?.email) {
      toast.error('Could not find user email.');
      return;
    }
    try {
      await authAPI.forgotPassword(target.email);
      toast.success(`Password reset email sent to ${target.email}`);
    } catch (error) {
      toast.error(error.message || 'Failed to send password reset email');
    }
  };

  const inputClass = (err) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${err ? 'border-red-500' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
      >
        <MdArrowBack className="w-5 h-5" /> Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Create and manage user accounts.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <MdAdd className="w-5 h-5" /> Create User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-visible">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">Loading users...</td>
              </tr>
            ) : users.length > 0 ? (
              [...users].reverse().map((user, index, arr) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.full_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role === 'admin' ? '👨‍💼 Admin' : '👤 Student'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <ActionDropdown
                      user={user}
                      onEdit={openEditModal}
                      onDelete={(id) => setShowDeleteConfirm(id)}
                      onResetPassword={handleResetPassword}
                      isLast={index >= arr.length - 2 && arr.length > 2}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center">
                  <p className="text-gray-500 text-lg">No users created yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Create User" to add your first user</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create User Modal ── */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Enter full name"
              className={inputClass(null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={createForm.email}
              onChange={(e) => { setCreateForm(p => ({ ...p, email: e.target.value })); setCreateErrors(p => ({ ...p, email: '' })); }}
              placeholder="Enter email address"
              className={inputClass(createErrors.email)}
            />
            {createErrors.email && <p className="text-red-600 text-sm mt-1">{createErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm(p => ({ ...p, role: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <Button variant="primary" onClick={handleCreateUser} disabled={isCreating} className="flex-1">
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit User Modal ── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">
                  {editUser.name?.[0]?.toUpperCase() || editUser.email[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit User</h2>
                  <p className="text-blue-100 text-sm">{editUser.email}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => { setEditForm(p => ({ ...p, email: e.target.value })); setEditErrors(p => ({ ...p, email: '' })); }}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${editErrors.email ? 'border-red-400' : 'border-gray-200'}`}
                />
                {editErrors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{editErrors.email}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDeleteUser(showDeleteConfirm)}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          isDangerous={true}
        />
      )}
    </div>
  );
}
