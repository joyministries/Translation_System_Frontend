import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import logo from '../../assets/team_impact_logo.png';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
      toast.error('Invalid password reset session. Missing token.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Resetting your password...');

    try {
      await authAPI.resetPassword(token, email, password, confirmPassword);
      setIsSuccess(true);
      toast.success('Your password has been reset successfully.', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <img
            src={logo}
            alt="Team Impact Logo"
            className="h-16 w-auto mx-auto object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Reset Your Password
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Team Impact Christian University
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-5">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Password Reset Complete
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can now log in to your account with your new password.
              </p>
            </div>
            <Link to="/login" className="block">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting Password...' : 'Update Password'}
            </Button>
          </form>
        )}

        {!isSuccess && (
          <div className="text-sm text-center text-slate-600 dark:text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
