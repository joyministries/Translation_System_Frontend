import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { Input } from '../../components/shared/Input';
import { CheckCircle2 } from 'lucide-react';
import logo from '../../assets/team_impact_logo.png';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateFields = () => {
    const errors = {};
    if (!password) {
      errors.password = 'New password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    if (!token) {
      toast.error('Invalid or missing password reset token.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Resetting your password...');

    try {
      // Directly submit the new password using the reset token
      await authAPI.resetPassword(token, email, password, confirmPassword);
      setIsSuccess(true);
      toast.success('Your password has been reset successfully!', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{ background: 'var(--bg-base-gradient)', color: 'var(--text-primary)' }}
      className="flex items-center justify-center min-h-screen p-4 transition-colors duration-200"
    >
      <div
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        className="w-full max-w-md p-8 space-y-6 border rounded-2xl shadow-xl transition-colors duration-200"
      >
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <img
            src={logo}
            alt="Team Impact University Logo"
            className="h-16 w-auto mx-auto object-contain"
          />
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">
              Reset Your Password
            </h1>
            <p style={{ color: 'var(--text-secondary)' }} className="mt-1.5 text-sm">
              Team Impact Christian University
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-5 py-2">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">
                Password Reset Complete!
              </h2>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm leading-relaxed">
                Your password has been updated successfully. You can now log in to your account with your new password.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login" className="block">
                <button
                  style={{ backgroundColor: '#1a6fa8', color: '#ffffff' }}
                  className="w-full py-3 px-4 font-semibold rounded-lg hover:bg-[#15578a] transition-colors shadow-md cursor-pointer"
                >
                  Go to Login
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }} className="text-xs text-center p-3 rounded-lg border">
              Please enter your new password below to secure your account.
            </p>

            <div>
              <Input
                label="New Password"
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors((prev) => ({ ...prev, password: '' }));
                  }
                }}
                placeholder="••••••••"
                disabled={isSubmitting}
                required
              />
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">⚠️ {validationErrors.password}</p>
              )}
            </div>

            <div>
              <Input
                label="Confirm New Password"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (validationErrors.confirmPassword) {
                    setValidationErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="••••••••"
                disabled={isSubmitting}
                required
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 font-medium">⚠️ {validationErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#1a6fa8', color: '#ffffff' }}
              className="w-full py-3 px-4 font-semibold rounded-lg hover:bg-[#15578a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}

        {!isSuccess && (
          <div style={{ color: 'var(--text-secondary)' }} className="text-sm text-center">
            Remembered your password?{' '}
            <Link to="/login" style={{ color: '#1a6fa8' }} className="font-semibold hover:underline">
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
