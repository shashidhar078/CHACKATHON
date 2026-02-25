import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Clock, User, Tag, Sparkles, Eye } from 'lucide-react';
import { Thread } from '../types';

interface ThreadCardProps {
  thread: Thread;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="card p-6 hover-lift transition-all duration-300">
      <div className="flex items-start space-x-4">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          {thread.author.avatarUrl ? (
            <img
              src={thread.author.avatarUrl}
              alt={thread.author.username}
              className="w-10 h-10 rounded-full border-2 border-border"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {thread.author.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm font-medium text-textPrimary">
              {thread.author.username}
            </span>
            <span className="text-sm text-textTertiary">•</span>
            <div className="flex items-center space-x-1 text-sm text-textTertiary">
              <Clock className="w-3 h-3" />
              <span>{formatDate(thread.createdAt)}</span>
            </div>
            {thread.status === 'flagged' && (
              <>
                <span className="text-sm text-textTertiary">•</span>
                <span className="badge badge-accent text-xs">
                  Under Review
                </span>
              </>
            )}
          </div>

          <Link to={`/app/thread/${thread._id}`} className="block group">
            <h3 className="text-xl font-semibold text-textPrimary mb-3 group-hover:text-primary-400 transition-colors duration-200">
              {thread.title}
            </h3>
            <p className="text-textSecondary mb-4 line-clamp-3 leading-relaxed">
              {thread.content}
            </p>
          </Link>

          {/* Image Display */}
          {thread.imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img
                src={thread.imageUrl}
                alt={thread.imageCaption || 'Thread image'}
                className="w-full max-w-md rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {thread.imageCaption && (
                <p className="text-sm text-textTertiary mt-2 italic">
                  {thread.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* Topic */}
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-4 h-4 text-textTertiary" />
            <span className="text-sm text-textSecondary capitalize">
              {thread.topic}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className={`flex items-center space-x-2 ${thread.likedByMe ? 'text-accent-400' : 'text-textTertiary hover:text-textPrimary'
              } transition-colors duration-200`}>
              <Heart className={`w-4 h-4 ${thread.likedByMe ? 'fill-current' : ''}`} />
              <span>{thread.likes}</span>
            </div>
            <div className="flex items-center space-x-2 text-textTertiary hover:text-textPrimary transition-colors duration-200">
              <MessageCircle className="w-4 h-4" />
              <span>{thread.replyCount ?? 0}</span>
            </div>
          </div>

          {/* Summary (if available) */}
          {thread.summary && (
            <div className="mt-4 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <h4 className="text-sm font-medium text-primary-400">AI Summary</h4>
              </div>
              <p className="text-sm text-primary-300 whitespace-pre-line leading-relaxed">
                {thread.summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadCard;