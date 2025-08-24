import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Clock, User, Tag } from 'lucide-react';
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
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          {thread.author.avatarUrl ? (
            <img
              src={thread.author.avatarUrl}
              alt={thread.author.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {thread.author.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-900">
              {thread.author.username}
            </span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">
              {formatDate(thread.createdAt)}
            </span>
            {thread.status === 'flagged' && (
              <>
                <span className="text-sm text-gray-500">•</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Under Review
                </span>
              </>
            )}
          </div>

          <Link to={`/thread/${thread._id}`} className="block">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
              {thread.title}
            </h3>
            <p className="text-gray-600 mb-3 line-clamp-2">
              {thread.content}
            </p>
          </Link>

          {/* Image Display */}
          {thread.imageUrl && (
            <div className="mb-3">
              <img
                src={thread.imageUrl}
                alt={thread.imageCaption || 'Thread image'}
                className="w-full max-w-md rounded-lg shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {thread.imageCaption && (
                <p className="text-sm text-gray-500 mt-1 italic">
                  {thread.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* Topic */}
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 capitalize">
              {thread.topic}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart className={`w-4 h-4 ${thread.likedByMe ? 'text-red-500 fill-current' : ''}`} />
              <span>{thread.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{thread.replyCount}</span>
            </div>
          </div>

          {/* Summary (if available) */}
          {thread.summary && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-1">AI Summary</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line">
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
