
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { MdOutlineVisibility, MdOutlineVisibilityOff} from 'react-icons/md';
import { Alert } from '../../components/shared/Alert';

export function Login() {
    const [activeTab, setActiveTab] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    
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
            // TODO: Replace with actual API call
            // const response = await loginAPI.post('/login', { email, password, role: activeTab });
            
            // Mock login - set auth state
            const mockUser = {
                id: '1',
                email,
                role: activeTab,
                name: email.split('@')[0]
            };
            const mockToken = 'mock-token-' + Date.now();
            
            // Update auth store
            setToken(mockToken, mockUser);
            
            console.log('Login successful:', { email, role: activeTab });
            
            // Redirect based on role
            if (activeTab === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                            📚
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Team Impact Christian University</h1>
                    <p className="text-gray-600 mt-2"> Education material Translation System</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('student')}
                            className={`flex-1 py-2 px-4 rounded font-medium transition ${
                                activeTab === 'student'
                                    ? 'bg-white text-blue-600 shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Student
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`flex-1 py-2 px-4 rounded font-medium transition ${
                                activeTab === 'admin'
                                    ? 'bg-white text-blue-600 shadow'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Admin
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {activeTab === 'student' ? 'Student Access' : 'Admin Access'}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {activeTab === 'student' 
                                    ? 'Sign in to access and translate curriculum content'
                                    : 'Sign in to manage translations and content'}
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                {error}
                            </div>
                        )}

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
                                placeholder={activeTab === 'student' ? 'student@example.com' : 'admin@example.com'}
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

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}