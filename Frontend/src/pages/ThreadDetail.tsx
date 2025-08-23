import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Heart, MessageCircle, Clock, User, Tag, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { threadsApi, repliesApi } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Thread, Reply } from '../types';
import ReplyCard from '../components/ReplyCard';
import CreateReplyModal from '../components/CreateReplyModal';
import toast from 'react-hot-toast';

const ThreadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom } = useSocket();
  const queryClient = useQueryClient();
  
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyPage, setReplyPage] = useState(1);

  const { data: threadData, isLoading, error } = useQuery(
    ['thread', id, replyPage],
    () => threadsApi.getThread(id!),
    {
      enabled: !!id,
    }
  );

  const likeThreadMutation = useMutation(
    () => threadsApi.likeThread(id!),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['thread', id]);
        queryClient.invalidateQueries(['threads']);
      },
    }
  );

  const summarizeThreadMutation = useMutation(
    () => threadsApi.summarizeThread(id!),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['thread', id]);
        toast.success('Thread summarized successfully!');
      },
      onError: () => {
        toast.error('Failed to summarize thread');
      },
    }
  );

  const createReplyMutation = useMutation(
    (content: string) => repliesApi.createReply(id!, { content }),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(['thread', id]);
        setIsReplyModalOpen(false);
        
        if (response.moderation) {
          toast.success('Reply posted but flagged for review');
        } else {
          toast.success('Reply posted successfully!');
        }
      },
      onError: (error: any) => {
        const message = error.response?.data?.error?.message || 'Failed to post reply';
        toast.error(message);
      },
    }
  );

  // Socket event listeners
  useEffect(() => {
    if (socket && id) {
      joinRoom(`thread:${id}`);

      socket.on('reply:new', (data) => {
        if (data.threadId === id) {
          queryClient.invalidateQueries(['thread', id]);
        }
      });

      socket.on('reply:like', (data) => {
        queryClient.invalidateQueries(['thread', id]);
      });

      socket.on('thread:like', (data) => {
        if (data.threadId === id) {
          queryClient.invalidateQueries(['thread', id]);
        }
      });

      socket.on('thread:updated', (data) => {
        if (data.threadId === id) {
          queryClient.invalidateQueries(['thread', id]);
        }
      });

      return () => {
        leaveRoom(`thread:${id}`);
        socket.off('reply:new');
        socket.off('reply:like');
        socket.off('thread:like');
        socket.off('thread:updated');
      };
    }
  }, [socket, id, joinRoom, leaveRoom, queryClient]);

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
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (error || !threadData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load thread. Please try again.</p>
        </div>
      </div>
    );
  }

  const { thread, replies } = threadData;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Threads</span>
      </Link>

      {/* Thread Content */}
      <div className="card mb-6">
        <div className="flex items-start space-x-4">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            {thread.author.avatarUrl ? (
              <img
                src={thread.author.avatarUrl}
                alt={thread.author.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {thread.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Thread Content */}
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

            <h1 className="text-2xl font-bold text-gray-900 mb-3">{thread.title}</h1>
            
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 capitalize">{thread.topic}</span>
            </div>

            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{thread.content}</p>

            {/* Thread Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => likeThreadMutation.mutate()}
                  disabled={likeThreadMutation.isLoading}
                  className={`flex items-center space-x-1 text-sm ${
                    thread.likedByMe ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${thread.likedByMe ? 'fill-current' : ''}`} />
                  <span>{thread.likes}</span>
                </button>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{thread.replyCount}</span>
                </div>
              </div>

              {user && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsReplyModalOpen(true)}
                    className="btn btn-primary"
                  >
                    Reply
                  </button>
                  {thread.replyCount >= 10 && !thread.summary && (
                    <button
                      onClick={() => summarizeThreadMutation.mutate()}
                      disabled={summarizeThreadMutation.isLoading}
                      className="btn btn-secondary flex items-center space-x-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Summarize</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* AI Summary */}
            {thread.summary && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Summary</span>
                </h3>
                <p className="text-sm text-blue-800 whitespace-pre-line">
                  {thread.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Replies ({thread.replyCount})
        </h2>

        {replies.items && replies.items.length > 0 ? (
          <>
            {replies.items.map((reply: Reply) => (
              <ReplyCard key={reply._id} reply={reply} />
            ))}

            {/* Reply Pagination */}
            {replies.total > replies.limit && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setReplyPage(prev => Math.max(1, prev - 1))}
                  disabled={replyPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {replyPage} of {Math.ceil(replies.total / replies.limit)}
                </span>
                <button
                  onClick={() => setReplyPage(prev => prev + 1)}
                  disabled={replyPage >= Math.ceil(replies.total / replies.limit)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No replies yet. Be the first to reply!</p>
          </div>
        )}
      </div>

      {/* Create Reply Modal */}
      <CreateReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onSubmit={createReplyMutation.mutate}
        isLoading={createReplyMutation.isLoading}
      />
    </div>
  );
};

export default ThreadDetail;
