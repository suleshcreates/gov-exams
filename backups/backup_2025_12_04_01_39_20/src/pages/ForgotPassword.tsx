import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabaseService } from '@/lib/supabaseService';
import { generateOTP, sendPasswordResetOTP, storeOTP } from '@/lib/emailService';

type Step = 'email' | 'otp' | 'password';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { verifyOTP, resetPassword } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Email Verification
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Check if email exists in database
            const student = await supabaseService.getStudentByEmail(email);

            if (!student) {
                setError('No account found with this email address');
                toast({
                    title: 'Email Not Found',
                    description: 'No account exists with this email address',
                    variant: 'destructive',
                });
                setLoading(false);
                return;
            }

            // Store user name for OTP email
            setUserName(student.name);

            // Generate and send OTP
            const otp = generateOTP();
            await sendPasswordResetOTP(email, student.name, otp);
            storeOTP(email, otp, 5); // 5-minute expiry

            toast({
                title: 'Verification Code Sent!',
                description: `Please check ${email} for your OTP`,
            });

            // Move to OTP verification step
            setCurrentStep('otp');
        } catch (err: any) {
            setError(err.message || 'Failed to send verification code');
            toast({
                title: 'Error',
                description: err.message || 'Failed to send verification code',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: OTP Verification
    const handleOTPVerify = () => {
        if (!otpCode || otpCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setError('');

        // Verify OTP
        const result = verifyOTP(email, otpCode);

        if (!result.valid) {
            setError(result.message);
            toast({
                title: 'Invalid Code',
                description: result.message,
                variant: 'destructive',
            });
            return;
        }

        // Move to password reset step
        toast({
            title: 'Verified!',
            description: 'Please enter your new password',
        });
        setCurrentStep('password');
    };

    // Resend OTP
    const resendOTP = async () => {
        setLoading(true);
        setError('');
        setOtpCode('');

        try {
            const otp = generateOTP();
            await sendPasswordResetOTP(email, userName, otp);
            storeOTP(email, otp, 5);

            toast({
                title: 'Code Resent!',
                description: 'A new verification code has been sent to your email',
            });
        } catch (err: any) {
            toast({
                title: 'Error',
                description: 'Failed to resend code',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Password Reset
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await resetPassword(email, password);

            toast({
                title: 'Password Reset Successful!',
                description: 'You can now login with your new password',
            });

            // Redirect to login page
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
            toast({
                title: 'Reset Failed',
                description: err.message || 'Failed to reset password',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8">
            <div className="w-full max-w-md mx-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                        <p className="text-gray-600">
                            {currentStep === 'email' && 'Enter your email to receive a verification code'}
                            {currentStep === 'otp' && 'Enter the code sent to your email'}
                            {currentStep === 'password' && 'Create a new password for your account'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* Step 1: Email Input */}
                        {currentStep === 'email' && (
                            <motion.form
                                key="email"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleEmailSubmit}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                            }}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="your.email@example.com"
                                            disabled={loading}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                                </button>
                            </motion.form>
                        )}

                        {/* Step 2: OTP Verification */}
                        {currentStep === 'otp' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <p className="text-gray-600">
                                        We've sent a 6-digit code to<br />
                                        <span className="font-semibold">{email}</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otpCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setOtpCode(value);
                                            setError('');
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="000000"
                                        maxLength={6}
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    onClick={handleOTPVerify}
                                    disabled={loading || otpCode.length !== 6}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Verify Code
                                </button>

                                <button
                                    onClick={resendOTP}
                                    disabled={loading}
                                    className="w-full text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 transition-colors"
                                >
                                    Resend Code
                                </button>

                                <button
                                    onClick={() => {
                                        setCurrentStep('email');
                                        setOtpCode('');
                                        setError('');
                                    }}
                                    className="w-full text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={16} />
                                    Change Email
                                </button>
                            </motion.div>
                        )}

                        {/* Step 3: Password Reset */}
                        {currentStep === 'password' && (
                            <motion.form
                                key="password"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handlePasswordReset}
                                className="space-y-6"
                            >
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError('');
                                            }}
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter new password"
                                            disabled={loading}
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        At least 6 characters
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setError('');
                                            }}
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Confirm new password"
                                            disabled={loading}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Back to Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
