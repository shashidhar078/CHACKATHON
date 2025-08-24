import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Heart, MessageCircle, Clock, User, Flag } from 'lucide-react';
import { adminApi } from '../services/api';
import { Thread, Reply } from '../types';
import toast from 'react-hot-toast';

const AdminThreadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: threadData, isLoading, error } = useQuery(
    ['adminThread', id],
    () => adminApi.getThreadById(id!),
    {
      enabled: !!id,
      onError: (error: any) => {
        console.error('Error loading admin thread:', error);
        toast.error('Failed to load thread');
      },
    }
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="loading-spinner h-8 w-8 border-2 border-t-primary-500 mx-auto"></div>
          <p className="text-textSecondary mt-2">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (error || !threadData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-accent-400">Failed to load thread. Please try again.</p>
        </div>
      </div>
    );
  }

  const { thread, replies } = threadData;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/admin"
        className="inline-flex items-center space-x-2 text-textSecondary hover:text-textPrimary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Dashboard</span>
      </Link>

      {/* Thread Content */}
      <div className="card p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {thread.author.avatarUrl ? (
              <img
                src={thread.author.avatarUrl}
                alt={thread.author.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-textPrimary">{thread.title}</h1>
              {thread.status === 'flagged' && (
                <span className="badge badge-accent">
                  <Flag className="w-3 h-3 mr-1" />
                  Flagged
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-textSecondary mb-4">
              <span>By {thread.author.username}</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(thread.createdAt)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{replies.total} replies</span>
              </span>
              <span className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{thread.likes} likes</span>
              </span>
            </div>

            <p className="text-textSecondary mb-4 whitespace-pre-wrap">{thread.content}</p>

            {/* Image Display */}
            {thread.imageUrl && (
              <div className="mb-4">
                <img
                  src={thread.imageUrl}
                  alt={thread.imageCaption || 'Thread image'}
                  className="w-full max-w-2xl rounded-lg shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {thread.imageCaption && (
                  <p className="text-sm text-textTertiary mt-2 italic text-center">
                    {thread.imageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Moderation Info */}
            {thread.moderation && (
              <div className="mt-4 p-4 bg-accent-500/10 border border-accent-500/20 rounded-lg">
                <h3 className="text-sm font-medium text-accent-400 mb-2">Moderation Details</h3>
                <div className="text-sm text-accent-300 space-y-1">
                  <p><strong>Status:</strong> {thread.moderation.status}</p>
                  {thread.moderation.reason && (
                    <p><strong>Reason:</strong> {thread.moderation.reason}</p>
                  )}
                  {thread.moderation.confidence && (
                    <p><strong>Confidence:</strong> {thread.moderation.confidence}%</p>
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            {thread.summary && (
              <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                <h3 className="text-sm font-medium text-primary-400 mb-2">AI Summary</h3>
                <p className="text-sm text-primary-300">{thread.summary}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-textPrimary">Replies ({replies.total})</h2>
        
        {replies.items.length > 0 ? (
          replies.items.map((reply: Reply) => (
            <div key={reply._id} className="card p-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {reply.author.avatarUrl ? (
                    <img
                      src={reply.author.avatarUrl}
                      alt={reply.author.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-medium text-textPrimary">{reply.author.username}</span>
                    {reply.status === 'flagged' && (
                      <span className="badge badge-accent text-xs">
                        <Flag className="w-3 h-3 mr-1" />
                        Flagged
                      </span>
                    )}
                    <span className="text-sm text-textSecondary">{formatDate(reply.createdAt)}</span>
                  </div>
                  
                  <p className="text-textSecondary mb-2">{reply.content}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-textSecondary">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{reply.likes}</span>
                    </span>
                  </div>

                  {/* Reply Moderation Info */}
                  {reply.moderation && (
                    <div className="mt-3 p-3 bg-accent-500/10 border border-accent-500/20 rounded-lg">
                      <h4 className="text-xs font-medium text-accent-400 mb-1">Moderation Details</h4>
                      <div className="text-xs text-accent-300 space-y-1">
                        <p><strong>Status:</strong> {reply.moderation.status}</p>
                        {reply.moderation.reason && (
                          <p><strong>Reason:</strong> {reply.moderation.reason}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-textTertiary mx-auto mb-4" />
            <p className="text-textSecondary">No replies yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminThreadDetail;