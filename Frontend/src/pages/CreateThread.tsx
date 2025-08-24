import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, Hash, AlertCircle, Image as ImageIcon, Lightbulb } from 'lucide-react';
import { threadsApi } from '../services/api';
import toast from 'react-hot-toast';

// Mock topics - in real app, fetch from backend
const TOPICS = [
  'general',
  'technology',
  'science',
  'health',
  'entertainment',
  'sports',
  'politics',
  'business',
  'education',
  'lifestyle'
];

const CreateThread: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [topicError, setTopicError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/v1/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.imageUrl);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  // Validation
  useEffect(() => {
    if (title) {
      if (title.length < 5) {
        setTitleError('Title must be at least 5 characters long');
      } else if (title.length > 100) {
        setTitleError('Title cannot exceed 100 characters');
      } else {
        setTitleError('');
      }
    } else {
      setTitleError('');
    }
  }, [title]);

  useEffect(() => {
    if (content) {
      if (content.length < 10) {
        setContentError('Content must be at least 10 characters long');
      } else if (content.length > 5000) {
        setContentError('Content cannot exceed 5000 characters');
      } else {
        setContentError('');
      }
    } else {
      setContentError('');
    }
  }, [content]);

  useEffect(() => {
    if (topic) {
      setTopicError('');
    } else {
      setTopicError('');
    }
  }, [topic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!title || !content || !topic) {
      if (!title) setTitleError('Title is required');
      if (!content) setContentError('Content is required');
      if (!topic) setTopicError('Topic is required');
      toast.error('Please fill in all required fields');
      return;
    }

    if (titleError || contentError || topicError) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsLoading(true);

    try {
      const response = await threadsApi.createThread({
        title: title.trim(),
        content: content.trim(),
        topic,
        imageUrl: imageUrl.trim() || undefined,
        imageCaption: imageCaption.trim() || undefined
      });

      if (response.moderation && response.moderation.status === 'Flagged') {
        toast.success('Thread created but is under review for content moderation');
        // Don't navigate to flagged threads - user can't access them
        navigate('/');
      } else {
        toast.success('Thread created successfully!');
        // Navigate to the new thread only if it's approved
        navigate(`/thread/${response.thread._id}`);
      }
    } catch (error: any) {
      console.error('Error creating thread:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create thread');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = title && content && topic && !titleError && !contentError && !topicError;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-surfaceElevated rounded-full transition-colors text-textSecondary hover:text-textPrimary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-textPrimary">Create New Thread</h1>
              <p className="text-sm text-textSecondary">Share your thoughts with the community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-textSecondary mb-2">
              Thread Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`input ${titleError ? 'input-error' : ''}`}
              placeholder="What's your thread about?"
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-1">
              {titleError && (
                <div className="flex items-center text-sm text-accent-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {titleError}
                </div>
              )}
              <span className={`text-sm ${titleError ? 'text-accent-400' : 'text-textTertiary'}`}>
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Topic Selection */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-textSecondary mb-2">
              Topic *
            </label>
            <div className="relative">
              <select
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`input ${topicError ? 'input-error' : ''}`}
              >
                <option value="">Select a topic</option>
                {TOPICS.map((topicOption) => (
                  <option key={topicOption} value={topicOption}>
                    {topicOption.charAt(0).toUpperCase() + topicOption.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Hash className="h-5 w-5 text-textTertiary" />
              </div>
            </div>
            {topicError && (
              <div className="flex items-center mt-1 text-sm text-accent-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                {topicError}
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-textSecondary mb-2">
              Thread Content *
            </label>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className={`input ${contentError ? 'input-error' : ''}`}
                placeholder="Share your thoughts, questions, or start a discussion..."
                maxLength={5000}
              />
              <div className="absolute bottom-3 right-3 bg-surfaceElevated px-2 py-1 rounded text-xs text-textTertiary">
                {content.length}/5000
              </div>
            </div>
            {contentError && (
              <div className="flex items-center mt-1 text-sm text-accent-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                {contentError}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-textSecondary mb-2">
              Image (Optional)
            </label>
            <div className="space-y-2">
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                className="input"
                disabled={isLoading}
              />
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input"
                placeholder="Or paste image URL here"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-textTertiary mt-1">
              Upload an image or paste an image URL to enhance your thread
            </p>
          </div>

          {/* Image Caption */}
          {imageUrl && (
            <div>
              <label htmlFor="imageCaption" className="block text-sm font-medium text-textSecondary mb-2">
                Image Caption (Optional)
              </label>
              <input
                id="imageCaption"
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="input"
                placeholder="Describe the image..."
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-textTertiary">
                  {imageCaption.length}/200
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`btn ${isFormValid && !isLoading ? 'btn-primary' : 'btn-ghost opacity-50 cursor-not-allowed'}`}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner h-4 w-4 border-2 mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Thread
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 p-6 card-glass">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Lightbulb className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-textPrimary mb-2">Tips for great threads:</h3>
              <ul className="text-sm text-textSecondary space-y-1">
                <li>• Be clear and specific in your title</li>
                <li>• Provide context and background information</li>
                <li>• Ask engaging questions to encourage discussion</li>
                <li>• Choose the most relevant topic for better visibility</li>
                <li>• Be respectful and follow community guidelines</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateThread;