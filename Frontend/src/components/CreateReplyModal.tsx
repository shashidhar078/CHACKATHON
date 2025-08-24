import React, { useState, useEffect } from 'react';
import { X, Reply, MessageCircle, AlertCircle } from 'lucide-react';
import { Reply as ReplyType, User } from '../types';

interface CreateReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, parentReplyId?: string) => void;
  isLoading: boolean;
  threadId: string;
  parentReply?: ReplyType | null;
  replyingTo?: User | null;
}

const CreateReplyModal: React.FC<CreateReplyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  threadId,
  parentReply,
  replyingTo
}) => {
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Reset content when modal opens/closes or parent changes
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setShowPreview(false);
    }
  }, [isOpen, parentReply?._id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim(), parentReply?._id);
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
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Reply className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {parentReply ? 'Reply to Comment' : 'Add Reply'}
              </h2>
              {parentReply && (
                <p className="text-sm text-gray-500">
                  Replying to {parentReply.author.username}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Parent Reply Preview */}
          {parentReply && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {parentReply.author.avatarUrl ? (
                    <img
                      src={parentReply.author.avatarUrl}
                      alt={parentReply.author.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {parentReply.author.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {parentReply.author.username}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {new Date(parentReply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {parentReply.content}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Your Reply *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors"
              rows={6}
              placeholder={parentReply ? `Reply to ${parentReply.author.username}...` : "Share your thoughts..."}
              maxLength={1000}
              required
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {content.length}/1000 characters
              </p>
              {content.length > 800 && (
                <div className="flex items-center text-xs text-orange-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Getting long
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span>
                {parentReply ? 'Nested reply' : 'Top-level reply'}
              </span>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Reply className="w-4 h-4" />
                    <span>Post Reply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReplyModal;
