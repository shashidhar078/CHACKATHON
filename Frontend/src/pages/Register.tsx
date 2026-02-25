import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Sparkles, Shield, Zap, Home } from 'lucide-react';
import { validateGmail, validatePassword, validateUsername, getStrengthColor, getStrengthIcon } from '../utils/validation';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | 'excellent'>('weak');
  const [passwordScore, setPasswordScore] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Real-time validation
  useEffect(() => {
    if (username) {
      const validation = validateUsername(username);
      setUsernameValid(validation.isValid);
      setUsernameError(validation.error || '');
    } else {
      setUsernameValid(false);
      setUsernameError('');
    }
  }, [username]);

  useEffect(() => {
    if (email) {
      const validation = validateGmail(email);
      setEmailValid(validation.isValid);
      setEmailError(validation.error || '');
    } else {
      setEmailValid(false);
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordValid(validation.isValid);
      setPasswordError(validation.error || '');
      setPasswordStrength(validation.strength);
      setPasswordScore(validation.score);
    } else {
      setPasswordValid(false);
      setPasswordError('');
      setPasswordStrength('weak');
      setPasswordScore(0);
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      if (password !== confirmPassword) {
        setConfirmPasswordValid(false);
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordValid(true);
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordValid(false);
      setConfirmPasswordError('');
    }
  }, [confirmPassword, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const usernameValidation = validateUsername(username);
    const emailValidation = validateGmail(email);
    const passwordValidation = validatePassword(password);

    if (!usernameValidation.isValid) {
      setUsernameError(usernameValidation.error || '');
      toast.error('Please fix the username errors');
      return;
    }

    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      toast.error('Please fix the email errors');
      return;
    }

    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || '');
      toast.error('Please fix the password errors');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password);
      toast.success('Account created successfully! Welcome to Threads! 🎉');
      navigate('/app');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_WS_URL}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="btn btn-ghost btn-sm gap-2 hover:bg-primary-500/10 transition-all duration-300"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/5 rounded-full"></div>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-glow mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Join Threads
          </h1>
          <p className="text-textSecondary">
            Create your account and start the conversation
          </p>
          <p className="mt-2 text-sm text-textTertiary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-textSecondary mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`input ${usernameError ? 'input-error' : usernameValid ? 'input-success' : ''}`}
                  placeholder="Choose a username"
                  minLength={3}
                  maxLength={30}
                />
                {usernameValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary-400" />
                  </div>
                )}
              </div>
              {usernameError && (
                <div className="flex items-center mt-2 text-sm text-accent-400 bg-accent-500/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {usernameError}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-3 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input ${emailError ? 'input-error' : emailValid ? 'input-success' : ''}`}
                  placeholder="Enter your Gmail address"
                />
                {emailValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary-400" />
                  </div>
                )}
              </div>
              {emailError && (
                <div className="flex items-center mt-2 text-sm text-accent-400 bg-accent-500/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {emailError}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-3 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input ${passwordError ? 'input-error' : passwordValid ? 'input-success' : ''}`}
                  placeholder="Create a strong password"
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-textPrimary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-textTertiary" />
                  ) : (
                    <Eye className="h-5 w-5 text-textTertiary" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-textSecondary">Password strength:</span>
                    <span className={`font-medium ${getStrengthColor(passwordStrength)} flex items-center space-x-1`}>
                      <span>{getStrengthIcon(passwordStrength)}</span>
                      <span>{passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}</span>
                      <span>({passwordScore}/10)</span>
                    </span>
                  </div>
                  <div className="w-full bg-surfaceElevated rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength).replace('text-', 'bg-')}`}
                      style={{ width: `${passwordScore * 10}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {passwordError && (
                <div className="flex items-center mt-2 text-sm text-accent-400 bg-accent-500/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {passwordError}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-textSecondary mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input ${confirmPasswordError ? 'input-error' : confirmPasswordValid ? 'input-success' : ''}`}
                  placeholder="Confirm your password"
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-textPrimary transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-textTertiary" />
                  ) : (
                    <Eye className="h-5 w-5 text-textTertiary" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <div className="flex items-center mt-2 text-sm text-accent-400 bg-accent-500/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {confirmPasswordError}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-lg py-4 hover-glow transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-6 w-6 border-2 border-t-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-divider" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-textSecondary font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleRegister}
                className="w-full btn btn-outline py-4 text-base hover:bg-primary-500/10 transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Continue with Google</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;