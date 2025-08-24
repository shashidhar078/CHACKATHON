import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Sparkles } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleGetStarted = () => {
    navigate('/login');
  };

  // Preload the background image with fallback
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      console.warn('Background image failed to load, using fallback');
      setImageError(true);
    };
    
    // Try multiple image formats
    const imageFormats = ['/images/bg.jpg', '/images/bg.png', '/images/bg.webp'];
    let currentIndex = 0;
    
    const tryNextImage = () => {
      if (currentIndex < imageFormats.length) {
        img.src = imageFormats[currentIndex];
        currentIndex++;
      } else {
        setImageError(true);
      }
    };
    
    img.onerror = tryNextImage;
    tryNextImage();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: imageError ? 'none' : "url('/images/bg.jpg')",
          backgroundColor: imageError ? '#1a1a2e' : 'transparent'
        }}
      />
      
      {/* Loading State */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-pulse" />
      )}
      
      {/* Fallback Gradient Background */}
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      )}
      
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      
      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 p-4 shadow-2xl">
            <MessageCircle className="h-12 w-12 text-white" />
          </div>
          <div className="ml-4">
            <Sparkles className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="mb-6 text-5xl font-bold leading-tight text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
          Your World, Your Voice.
        </h1>

        {/* Tagline */}
        <p className="mb-12 max-w-2xl text-xl font-medium text-gray-200 drop-shadow-lg md:text-2xl lg:text-3xl">
          Connect, Share, and Discover like never before.
        </p>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/25 md:px-12 md:py-5 md:text-xl"
        >
          <span className="relative z-10 flex items-center">
            Get Started
            <svg 
              className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-300 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </button>

        {/* Additional Features Preview */}
        <div className="mt-16 grid grid-cols-1 gap-6 text-center text-white/80 md:grid-cols-3 md:gap-8">
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full bg-emerald-500/20 p-3">
                <MessageCircle className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Thread Discussions</h3>
            <p className="text-sm text-gray-300">Engage in meaningful conversations with AI-powered moderation</p>
          </div>
          
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full bg-blue-500/20 p-3">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold">AI Summaries</h3>
            <p className="text-sm text-gray-300">Get intelligent summaries of long discussions automatically</p>
          </div>
          
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-3 flex justify-center">
              <div className="rounded-full bg-purple-500/20 p-3">
                <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Real-time Updates</h3>
            <p className="text-sm text-gray-300">Stay connected with live notifications and updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 