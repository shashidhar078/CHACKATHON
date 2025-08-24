import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { validateGmail, validatePassword, validateUsername } from '../utils/validation';
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
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
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
    } else {
      setPasswordValid(false);
      setPasswordError('');
      setPasswordStrength('weak');
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
      toast.success('Account created successfully! Welcome to ThreadApp!');
      navigate('/');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`input pl-10 pr-10 ${
                    usernameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                    usernameValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                    'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                  placeholder="Choose a username"
                  minLength={3}
                  maxLength={30}
                />
                {usernameValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {usernameError && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {usernameError}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input pl-10 pr-10 ${
                    emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                    emailValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                    'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                  placeholder="Enter your Gmail address"
                />
                {emailValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {emailError && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {emailError}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input pl-10 pr-10 ${
                    passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                    passwordValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                    'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                  placeholder="Create a password"
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength === 'weak' ? 'text-red-600' :
                      passwordStrength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 flex space-x-1">
                    <div className={`h-2 flex-1 rounded ${
                      passwordStrength === 'weak' ? 'bg-red-500' :
                      passwordStrength === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div className={`h-2 flex-1 rounded ${
                      passwordStrength === 'weak' ? 'bg-gray-300' :
                      passwordStrength === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div className={`h-2 flex-1 rounded ${
                      passwordStrength === 'weak' ? 'bg-gray-300' :
                      passwordStrength === 'medium' ? 'bg-gray-300' :
                      'bg-green-500'
                    }`}></div>
                  </div>
                </div>
              )}
              
              {passwordError && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {passwordError}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input pl-10 pr-10 ${
                    confirmPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                    confirmPasswordValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                    'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                  placeholder="Confirm your password"
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {confirmPasswordError}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleRegister}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
