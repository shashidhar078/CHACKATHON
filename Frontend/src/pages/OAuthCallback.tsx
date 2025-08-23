import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token) {
      // Store the token and redirect to home
      localStorage.setItem('token', token);
      login(token);
      navigate('/');
    } else {
      navigate('/login?error=no_token');
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Processing...</h2>
          <p className="mt-2 text-sm text-gray-600">
            Completing your sign-in...
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
