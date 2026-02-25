import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Sparkles, LogIn, Home } from 'lucide-react';
import { validateEmail, validatePassword } from '../utils/validation';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Check for OAuth errors from URL params
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'oauth_not_configured') {
      toast.error('OAuth is not configured yet');
    } else if (error === 'oauth_failed') {
      toast.error('OAuth authentication failed');
    } else if (error === 'no_token') {
      toast.error('Authentication token not received');
    }
  }, [searchParams]);

  // Handle redirect after successful login
  useEffect(() => {
    if (loginSuccess && user) {
      console.log('User state updated, redirecting. Role:', user.role);
      if (user.role === 'admin') {
        navigate('/app/admin', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
      setLoginSuccess(false);
    }
  }, [user, loginSuccess, navigate]);

  // Real-time validation
  useEffect(() => {
    if (email) {
      const validation = validateEmail(email);
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
    } else {
      setPasswordValid(false);
      setPasswordError('');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submission
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

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

    setIsLoading(true);

    try {
      const userData = await login(email, password);

      console.log('Login response - userData:', userData);
      console.log('User role:', userData?.role);

      if (!userData) {
        throw new Error('No user data returned');
      }

      // Mark login as successful - useEffect will handle redirect
      setLoginSuccess(true);

      // Fallback: If user state doesn't update quickly, redirect directly
      setTimeout(() => {
        if (userData.role === 'admin') {
          console.log('Fallback redirect to admin dashboard');
          navigate('/app/admin', { replace: true });
        } else {
          console.log('Fallback redirect to home');
          navigate('/app', { replace: true });
        }
      }, 300);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login error:', error);
      setLoginSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
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

      {/* Subtle background elements without blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-500/3 rounded-full"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-glow mb-6 hover-lift transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-700 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Welcome Back
          </h1>
          <p className="text-textSecondary text-lg">
            Sign in to your Threads account
          </p>
          <p className="mt-4 text-sm text-textTertiary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
              Create one now
            </Link>
          </p>
          <p className="mt-2 text-sm text-textTertiary">
            <Link to="/forgot-password" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
              Forgot your password?
            </Link>
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
                  className={`input pl-12 pr-12 ${emailError ? 'input-error' :
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-textTertiary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input pl-12 pr-12 ${passwordError ? 'input-error' :
                      passwordValid ? 'input-success' :
                        ''
                    }`}
                  placeholder="Enter your password"
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
                  Signing In...
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
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
                onClick={handleGoogleLogin}
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

export default Login;