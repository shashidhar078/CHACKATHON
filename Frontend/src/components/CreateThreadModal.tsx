import React, { useState } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Thread</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
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
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/200 characters
            </p>
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input"
              disabled={isLoading}
            >
              {topics.map(t => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input resize-none"
              rows={6}
              placeholder="Share your thoughts..."
              maxLength={5000}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length}/5000 characters
            </p>
          </div>

          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
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
                    // Handle file upload here
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
            <p className="text-xs text-gray-500 mt-1">
              Upload an image or paste an image URL to enhance your thread
            </p>
          </div>

          {imageUrl && (
            <div>
              <label htmlFor="imageCaption" className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="text-xs text-gray-500 mt-1">
                {imageCaption.length}/200 characters
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !content.trim()}
              className="btn btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Thread'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateThreadModal;
