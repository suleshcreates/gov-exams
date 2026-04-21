import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AuthModal = () => {
  const { authModalType, openAuthModal, closeAuthModal, signIn, signUp, requestOTP, verifyOTPAndSignup, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup specific
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');

  // Forgot Password specific
  const [resetToken, setResetToken] = useState('');

  // Reset form when modal type changes
  useEffect(() => {
    setError('');
    setIdentifier('');
    setPassword('');
    setFullName('');
    setUsername('');
    setPhone('');
    setResetToken('');
    setShowOTP(false);
    setOtp('');
  }, [authModalType]);

  if (!authModalType) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(identifier, password);
      toast({ title: 'Welcome Back!', description: 'You have successfully logged in' });
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Invalid email/username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !phone.trim() || !identifier.trim() || !password) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestOTP(identifier, fullName);
      setShowOTP(true);
      toast({ title: 'OTP Sent', description: 'Please check your email for the verification code.' });
    } catch (err: any) {
      if (err.message?.includes('User already registered') || err.message?.includes('already exists')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(err.message || 'Failed to send verify code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOTPAndSignup(identifier, otp, { fullName, username, phone, email: identifier, password });
      toast({ title: 'Account Verified!', description: 'Your account has been successfully created.' });
      closeAuthModal();
      // Optionally navigate to dashboard or refresh since auth state updates globally
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (resetToken && password) {
        await resetPassword(identifier, password, resetToken);
        toast({ title: 'Password Reset', description: 'Your password has been successfully reset.' });
        openAuthModal('login');
      } else if (identifier) {
        // Here we ideally send an OTP or magic link, handle accordingly based on your backend
        // For now, prompt for OTP + New Password assuming it's sent
        toast({ title: 'OTP Sent', description: 'Check your email for the reset instructions.' });
        // Keeping it simple for the modal
      } else {
         setError('Please enter your email');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {authModalType === 'login' ? 'Welcome Back' : authModalType === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-gray-500 text-sm">
                {authModalType === 'login' && 'Sign in to continue your learning journey'}
                {authModalType === 'signup' && 'Join GovExams and start preparing today'}
                {authModalType === 'forgot-password' && 'Enter your details to reset your password'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {authModalType === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email or Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter email or username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={() => {
                    closeAuthModal();
                    navigate('/forgot-password');
                  }} className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
                
                <p className="text-center text-sm text-gray-600 mt-4">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => openAuthModal('signup')} className="text-primary font-bold hover:underline">
                    Sign Up
                  </button>
                </p>
              </form>
            )}

            {authModalType === 'signup' && !showOTP && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Create Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Already have an account?{' '}
                  <button type="button" onClick={() => openAuthModal('login')} className="text-primary font-bold hover:underline">
                    Log In
                  </button>
                </p>
              </form>
            )}

            {authModalType === 'signup' && showOTP && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Verify Your Email</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    We've sent a 6-digit verification code to<br/>
                    <span className="font-semibold text-gray-700">{identifier}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] text-2xl py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono"
                    placeholder="000000"
                    required
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowOTP(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="flex-1 py-3 px-4 gradient-primary text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign Up'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
