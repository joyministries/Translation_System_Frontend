import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';

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
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Forgot Password</h1>
          <p className="mt-2 text-slate-600">
            {isSubmitted
              ? "If an account with that email exists, you'll receive a reset link shortly."
              : 'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Return to the login page to sign in after resetting your password.
            </p>
            <Link to="/login">
              <Button>Back to Login</Button>
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
          <div className="text-sm text-center text-slate-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}