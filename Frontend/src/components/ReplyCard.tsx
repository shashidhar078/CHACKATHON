import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Heart, Clock } from 'lucide-react';
import { repliesApi } from '../services/api';
import { Reply } from '../types';
import toast from 'react-hot-toast';

interface ReplyCardProps {
  reply: Reply;
}

const ReplyCard: React.FC<ReplyCardProps> = ({ reply }) => {
  const queryClient = useQueryClient();

  const likeReplyMutation = useMutation(
    () => repliesApi.likeReply(reply._id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['thread', reply.threadId]);
      },
    }
  );

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
    <div className="card">
      <div className="flex items-start space-x-4">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          {reply.author.avatarUrl ? (
            <img
              src={reply.author.avatarUrl}
              alt={reply.author.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {reply.author.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Reply Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-900">
              {reply.author.username}
            </span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">
              {formatDate(reply.createdAt)}
            </span>
            {reply.status === 'flagged' && (
              <>
                <span className="text-sm text-gray-500">•</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Under Review
                </span>
              </>
            )}
          </div>

          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{reply.content}</p>

          {/* Reply Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => likeReplyMutation.mutate()}
              disabled={likeReplyMutation.isLoading}
              className={`flex items-center space-x-1 text-sm ${
                reply.likedByMe ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${reply.likedByMe ? 'fill-current' : ''}`} />
              <span>{reply.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyCard;
