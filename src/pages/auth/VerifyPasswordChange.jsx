import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { Spinner } from '../../components/shared/Spinner';
import { MdCheckCircle, MdErrorOutline } from 'react-icons/md';
import logo from '../../assets/team_impact_logo.png';

export function VerifyPasswordChange() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  
  // Guard against duplicate execution in React StrictMode
  const hasCalledApiRef = useRef(false);

  useEffect(() => {
    // Requirement 1: URL Parsing & Validation
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('Invalid or missing confirmation link.');
      return;
    }

    if (hasCalledApiRef.current) return;
    hasCalledApiRef.current = true;

    // Requirement 2: API Integration
    const verifyToken = async () => {
      setLoading(true);
      try {
        const res = await authAPI.confirmPasswordChange(token);
        setSuccess(true);
        setMessage(res?.message || 'Password changed successfully');
      } catch (err) {
        setSuccess(false);
        // Requirement 4 & 5: Friendly error message without leaking sensitive logs
        setMessage(err?.message || 'This link has expired or is invalid. Please request a new password reset.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div
      style={{ background: 'var(--bg-base-gradient)', color: 'var(--text-primary)' }}
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200"
    >
      <div
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        className="w-full max-w-md p-8 border rounded-2xl shadow-xl space-y-6 text-center transition-colors duration-200"
      >
        {/* Brand Header */}
        <div className="space-y-3">
          <img
            src={logo}
            alt="Team Impact Christian University Logo"
            className="h-16 w-auto mx-auto object-contain mb-2"
          />
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">
            Team Impact Christian University
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Password Change Verification
          </p>
        </div>

        {/* Requirement 3 & 4: Dynamic UI States */}
        {loading ? (
          <div className="py-8 space-y-4" role="status" aria-live="polite">
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
              Verifying your password change request...
            </p>
          </div>
        ) : success ? (
          <div className="py-4 space-y-5" role="alert">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
              <MdCheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">
                Password changed successfully
              </h2>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                {message || 'Your password has been updated and confirmed.'}
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login" className="block w-full">
                <button
                  style={{ backgroundColor: '#1a6fa8', color: '#ffffff' }}
                  className="w-full py-3 px-4 font-semibold rounded-lg hover:bg-[#15578a] transition-colors shadow-md cursor-pointer"
                >
                  Back to Login
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-5" role="alert">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600">
              <MdErrorOutline className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">
                Verification Failed
              </h2>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                {message || 'This link has expired or is invalid. Please request a new password reset.'}
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login" className="block w-full">
                <button
                  style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
                  className="w-full py-3 px-4 font-medium border rounded-lg hover:opacity-80 transition-colors cursor-pointer"
                >
                  Back to Login
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
