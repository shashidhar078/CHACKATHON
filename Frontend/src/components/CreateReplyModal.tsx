import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

const CreateReplyModal: React.FC<CreateReplyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setContent('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Reply</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Your Reply *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input resize-none"
              rows={6}
              placeholder="Share your thoughts..."
              maxLength={2000}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length}/2000 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3">
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
              disabled={isLoading || !content.trim()}
              className="btn btn-primary"
            >
              {isLoading ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReplyModal;
