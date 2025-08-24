import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, User, LogOut, Settings, Menu, X, Sparkles, Home, Shield } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-surface border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/app" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Threads</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/app" 
              className="text-textSecondary hover:text-textPrimary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/app/admin" 
                className="text-textSecondary hover:text-textPrimary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 text-textSecondary hover:text-textPrimary focus:outline-none transition-colors duration-200 group"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-9 h-9 rounded-full border-2 border-transparent group-hover:border-primary-500/30 transition-colors duration-200"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <span className="text-white text-sm font-medium">
                      {user?.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-textPrimary">{user?.username}</span>
                  <span className="text-xs text-textTertiary">Online</span>
                </div>
                <User className="w-4 h-4" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-surfaceElevated rounded-xl shadow-2xl py-2 z-50 border border-border">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="font-medium text-textPrimary">{user?.username}</div>
                    <div className="text-sm text-textTertiary truncate">{user?.email}</div>
                  </div>
                  <Link
                    to="/app/profile"
                    className="w-full text-left px-4 py-3 text-sm text-textSecondary hover:bg-surface hover:text-textPrimary transition-colors duration-200 flex items-center space-x-3"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="w-full text-left px-4 py-3 text-sm text-textSecondary hover:bg-surface hover:text-textPrimary transition-colors duration-200 flex items-center space-x-3"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-textSecondary hover:bg-surface hover:text-textPrimary transition-colors duration-200 flex items-center space-x-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-textTertiary hover:text-textPrimary hover:bg-surfaceElevated focus:outline-none transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <Link
                to="/app"
                className="text-textSecondary hover:text-textPrimary px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/app/admin"
                  className="text-textSecondary hover:text-textPrimary px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                to="/app/profile"
                className="text-textSecondary hover:text-textPrimary px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-textSecondary hover:text-textPrimary px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-3"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(isUserMenuOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;