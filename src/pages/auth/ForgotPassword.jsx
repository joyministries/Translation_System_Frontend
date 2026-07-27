import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import logo from '../../assets/team_impact_logo.png';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading('Sending password reset link...');

    try {
      await authAPI.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email.', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }} className="flex items-center justify-center min-h-screen p-4 transition-colors duration-200">
      <div style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }} className="w-full max-w-md p-8 space-y-6 border rounded-2xl shadow-xl transition-colors duration-200">
        <div className="text-center space-y-3">
          <img
            src={logo}
            alt="Team Impact Logo"
            className="h-16 w-auto mx-auto object-contain mb-2"
          />
          <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold">Forgot Password</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            {isSubmitted
              ? "If an account with that email exists, you'll receive a reset link shortly."
              : 'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center">
            <p style={{ color: 'var(--text-secondary)' }} className="mb-4 text-sm">
              Return to the login page to sign in after resetting your password.
            </p>
            <Link to="/login">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
              required
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        {!isSubmitted && (
          <div style={{ color: 'var(--text-secondary)' }} className="text-sm text-center">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}