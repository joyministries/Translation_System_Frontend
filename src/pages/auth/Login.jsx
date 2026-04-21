
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth_store';
import { MdOutlineVisibility, MdOutlineVisibilityOff, MdEmail, MdCheckCircle } from 'react-icons/md';
import { Modal } from '../../components/shared/Modal';
import { authAPI } from '../../api/auth.jsx';
import { toast } from 'react-hot-toast';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Forgot password state
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSubmitted, setForgotSubmitted] = useState(false);
    const [forgotEmailError, setForgotEmailError] = useState('');
    
    const navigate = useNavigate();
    const setToken = useAuthStore((state) => state.setToken);

    const validateFields = () => {
        const errors = {};

        // Email validation
        if (!email.trim()) {
            errors.email = 'Email is required.';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.email = 'Please enter a valid email address.';
            }
        }

        // Password validation
        if (!password.trim()) {
            errors.password = 'Password is required.';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters long.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Real-time email validation
    const validateEmail = (emailValue) => {
        if (!emailValue.trim()) {
            setFieldErrors((prev) => ({ ...prev, email: 'Email is required.' }));
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
            } else {
                setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.email;
                    return newErrors;
                });
            }
        }
    };

    // Real-time password validation
    const validatePassword = (passwordValue) => {
        if (!passwordValue.trim()) {
            setFieldErrors((prev) => ({ ...prev, password: 'Password is required.' }));
        } else if (passwordValue.length < 6) {
            setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
        } else {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
            });
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        validateEmail(value);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        validatePassword(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateFields()) {
            return;
        }

        setLoading(true);

        try {
            // Step 1: Authenticate user with email and password
            const loginData = await authAPI.login(email, password);
            const token = loginData.access_token || loginData.token || null;

            if (token) {
                localStorage.setItem('token', token);
            } else {
                throw new Error('No authentication token received. Please try again.');
            }

            // Step 2: Fetch user info from auth/me endpoint
            const userData = await authAPI.getMe();
            const user = userData.user || userData;

            if (!user) {
                throw new Error('Failed to fetch user information.');
            }

            // Step 3: Update auth store with user data and token
            setToken(token, user);

            // Step 4: Redirect based on user role
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'student') {
                navigate('/student/browse');
            } else {
                throw new Error('Invalid user role.');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
            setIsErrorModalOpen(true);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordOpen = () => {
        setForgotEmail('');
        setForgotEmailError('');
        setForgotSubmitted(false);
        setIsForgotPasswordOpen(true);
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!forgotEmail.trim()) {
            setForgotEmailError('Please enter your email address.');
            return;
        }
        if (!emailRegex.test(forgotEmail)) {
            setForgotEmailError('Please enter a valid email address.');
            return;
        }
        setForgotEmailError('');
        setForgotLoading(true);
        const toastId = toast.loading('Sending password reset link...');
        try {
            await authAPI.forgotPassword(forgotEmail);
            setForgotSubmitted(true);
            toast.success('Password reset link sent! Check your inbox.', { id: toastId });
        } catch (err) {
            toast.error(err.message || 'Failed to send reset link. Please try again.', { id: toastId });
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Team Impact Christian University</h1>
                    <p className="text-gray-600 mt-2"> Education material Translation System</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                           Sign In
                        </h3>
                        <p className='text-sm font-medium text-gray-700'> Access your learning resources </p>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
                                    fieldErrors.email
                                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder='student@example.com'
                            />
                            {fieldErrors.email && (
                                <p className="text-red-600 text-xs mt-1 font-medium">⚠️ {fieldErrors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
                                        fieldErrors.password
                                            ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                            : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    {showPassword ? <MdOutlineVisibilityOff/> : <MdOutlineVisibility/>}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-red-600 text-xs mt-1 font-medium">⚠️ {fieldErrors.password}</p>
                            )}
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end -mt-2">
                            <button
                                type="button"
                                onClick={handleForgotPasswordOpen}
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors focus:outline-none"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* Error Modal */}
                <Modal 
                  isOpen={isErrorModalOpen}
                  title="Login Error"
                  actions={
                    <button
                      onClick={() => {
                        setIsErrorModalOpen(false);
                        setError('');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Close
                    </button>
                  }
                >
                  <p className="text-gray-700">{error}</p>
                </Modal>

                {/* Forgot Password Modal */}
                <Modal
                  isOpen={isForgotPasswordOpen}
                  title="Reset Password"
                  actions={
                    !forgotSubmitted ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsForgotPasswordOpen(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleForgotPasswordSubmit}
                          disabled={forgotLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                          {forgotLoading ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                              </svg>
                              Sending...
                            </>
                          ) : 'Send Reset Link'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordOpen(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                      >
                        Back to Login
                      </button>
                    )
                  }
                >
                  {forgotSubmitted ? (
                    <div className="text-center py-4">
                      <MdCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
                      <p className="text-gray-800 font-medium">Check your inbox!</p>
                      <p className="text-gray-500 text-sm mt-1">
                        If an account with <span className="font-semibold text-gray-700">{forgotEmail}</span> exists,
                        you'll receive a reset link shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      <p className="text-gray-600 text-sm">
                        Enter your registered email address and we'll send you a password reset link.
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                        <div className="relative">
                          <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => {
                              setForgotEmail(e.target.value);
                              setForgotEmailError('');
                            }}
                            placeholder="you@example.com"
                            disabled={forgotLoading}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${
                              forgotEmailError
                                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                          />
                        </div>
                        {forgotEmailError && (
                          <p className="text-red-600 text-xs mt-1 font-medium">⚠️ {forgotEmailError}</p>
                        )}
                      </div>
                    </form>
                  )}
                </Modal>
            </div>
        </div>
    );
}