import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Sparkles, Home } from 'lucide-react';
import { validateGmail } from '../utils/validation';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Real-time validation
  React.useEffect(() => {
    if (email) {
      const validation = validateGmail(email);
      setEmailValid(validation.isValid);
      setEmailError(validation.error || '');
    } else {
      setEmailValid(false);
      setEmailError('');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submission
    const emailValidation = validateGmail(email);
    
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      toast.error('Please fix the email errors');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        toast.error(data.error?.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-glow mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Check Your Email
            </h1>
            <p className="text-textSecondary mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <div className="bg-surfaceElevated border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary-500/20 rounded-lg">
                  <Mail className="w-5 h-5 text-primary-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-textPrimary mb-1">What's next?</h3>
                  <ul className="text-sm text-textSecondary space-y-1">
                    <li>• Check your email inbox (and spam folder)</li>
                    <li>• Click the reset link in the email</li>
                    <li>• Create a new password</li>
                    <li>• Sign in with your new password</li>
                  </ul>
                </div>
              </div>
              <div className="text-xs text-textTertiary bg-surface p-3 rounded-lg">
                <strong>Note:</strong> The reset link will expire in 1 hour for security reasons.
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <Link
                to="/login"
                className="btn btn-primary w-full"
              >
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="btn btn-ghost w-full"
              >
                Try a different email
              </button>
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
            Forgot Password?
          </h1>
          <p className="text-textSecondary">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-surfaceElevated border border-border rounded-2xl p-8 space-y-6 shadow-soft hover:shadow-medium transition-all duration-300">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-3">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-textTertiary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input pl-12 pr-12 ${
                    emailError ? 'input-error' :
                    emailValid ? 'input-success' :
                    ''
                  }`}
                  placeholder="Enter your Gmail address"
                />
                {emailValid && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
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
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !emailValid}
              className="btn btn-primary w-full text-lg py-4 hover-glow transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-6 w-6 border-2 border-t-white mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Send Reset Link
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

export default ForgotPassword; 