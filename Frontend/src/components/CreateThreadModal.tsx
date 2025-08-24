import React, { useState } from 'react';
import { X, ImageIcon, Sparkles, Hash, FileText, Type } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; topic: string; imageUrl?: string; imageCaption?: string }) => void;
  isLoading: boolean;
}

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('general');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  const topics = ['general', 'technology', 'books', 'movies', 'music', 'sports', 'politics', 'science'];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit({ 
        title: title.trim(), 
        content: content.trim(), 
        topic,
        imageUrl: imageUrl.trim() || undefined,
        imageCaption: imageCaption.trim() || undefined
      });
      // Reset form
      setTitle('');
      setContent('');
      setTopic('general');
      setImageUrl('');
      setImageCaption('');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setContent('');
      setTopic('general');
      setImageUrl('');
      setImageCaption('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-textPrimary">Create New Thread</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-textTertiary hover:text-textPrimary disabled:opacity-50 transition-colors p-1 hover:bg-surfaceElevated rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-textSecondary mb-3 flex items-center">
              <Type className="w-4 h-4 mr-2" />
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Enter thread title"
              maxLength={200}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-textTertiary mt-2">
              {title.length}/200 characters
            </p>
          </div>

          {/* Topic */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-textSecondary mb-3 flex items-center">
              <Hash className="w-4 h-4 mr-2" />
              Topic
            </label>
            <div className="relative">
              <select
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input appearance-none"
                disabled={isLoading}
              >
                {topics.map(t => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Hash className="w-4 h-4 text-textTertiary" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-textSecondary mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input resize-none min-h-[200px]"
              placeholder="Share your thoughts..."
              maxLength={5000}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-textTertiary mt-2">
              {content.length}/5000 characters
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-textSecondary mb-3 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              Image (Optional)
            </label>
            <div className="space-y-3">
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
            <p className="text-xs text-textTertiary mt-2">
              Upload an image or paste an image URL to enhance your thread
            </p>
          </div>

          {/* Image Caption */}
          {imageUrl && (
            <div>
              <label htmlFor="imageCaption" className="block text-sm font-medium text-textSecondary mb-3">
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
                disabled={isLoading}
              />
              <p className="text-xs text-textTertiary mt-2">
                {imageCaption.length}/200 characters
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !content.trim()}
              className="btn btn-primary flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner h-4 w-4 border-2 border-t-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Thread</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateThreadModal;