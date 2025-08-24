import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, ArrowLeft, Home } from 'lucide-react';
import { validatePassword } from '../utils/validation';
import toast from 'react-hot-toast';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/auth/verify-reset-token/${token}`);
        if (response.ok) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // Real-time password validation
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordValid(validation.isValid);
      setPasswordError(validation.error || '');
    } else {
      setPasswordValid(false);
      setPasswordError('');
    }
  }, [password]);

  // Real-time confirm password validation
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
    
    // Validate before submission
    const passwordValidation = validatePassword(password);
    
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
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully! You can now login with your new password.');
        navigate('/login');
      } else {
        toast.error(data.error?.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative">
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
        
        <div className="text-center">
          <div className="loading-spinner h-10 w-10 border-3 border-t-primary-500 mx-auto"></div>
          <p className="text-textSecondary mt-4">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-glow mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-textSecondary mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="btn btn-primary w-full"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/login"
                className="btn btn-ghost w-full"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Reset Your Password
          </h1>
          <p className="text-textSecondary">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-surfaceElevated border border-border rounded-2xl p-8 space-y-6 shadow-soft hover:shadow-medium transition-all duration-300">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-3">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-textTertiary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input pl-12 pr-12 ${
                    passwordError ? 'input-error' :
                    passwordValid ? 'input-success' :
                    ''
                  }`}
                  placeholder="Enter your new password"
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
              {passwordError && (
                <div className="flex items-center mt-2 text-sm text-accent-400 bg-accent-500/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {passwordError}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-textSecondary mb-3">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-textTertiary" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input pl-12 pr-12 ${
                    confirmPasswordError ? 'input-error' :
                    confirmPasswordValid ? 'input-success' :
                    ''
                  }`}
                  placeholder="Confirm your new password"
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
              disabled={isLoading || !passwordValid || !confirmPasswordValid}
              className="btn btn-primary w-full text-lg py-4 hover-glow transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-6 w-6 border-2 border-t-white mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Reset Password
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-textSecondary hover:text-textPrimary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 