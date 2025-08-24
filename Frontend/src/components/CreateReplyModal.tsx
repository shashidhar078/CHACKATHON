import React, { useState, useEffect } from 'react';
import { X, Reply, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Reply className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-textPrimary">
                {parentReply ? 'Reply to Comment' : 'Add Reply'}
              </h2>
              {parentReply && (
                <p className="text-sm text-textSecondary">
                  Replying to {parentReply.author.username}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-textTertiary hover:text-textPrimary disabled:opacity-50 transition-colors p-1 hover:bg-surfaceElevated rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Parent Reply Preview */}
          {parentReply && (
            <div className="mb-6 p-4 bg-surfaceElevated rounded-xl border border-border">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {parentReply.author.avatarUrl ? (
                    <img
                      src={parentReply.author.avatarUrl}
                      alt={parentReply.author.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {parentReply.author.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-textPrimary">
                      {parentReply.author.username}
                    </span>
                    <span className="text-xs text-textTertiary">•</span>
                    <span className="text-xs text-textTertiary">
                      {new Date(parentReply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-textSecondary line-clamp-3">
                    {parentReply.content}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-textSecondary mb-3">
              Your Reply *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input resize-none min-h-[150px]"
              rows={6}
              placeholder={parentReply ? `Reply to ${parentReply.author.username}...` : "Share your thoughts..."}
              maxLength={1000}
              required
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-textTertiary">
                {content.length}/1000 characters
              </p>
              {content.length > 800 && (
                <div className="flex items-center text-xs text-accent-400">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Getting long
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-sm text-textTertiary">
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
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="btn btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner h-4 w-4 border-2 border-t-white"></div>
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