import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Heart, MessageCircle, Clock, User, Tag, ArrowLeft, Sparkles, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [parentReplyId, setParentReplyId] = useState<string | null>(null);

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

  const deleteThreadMutation = useMutation(
    () => threadsApi.deleteThread(id!),
    {
      onSuccess: () => {
        toast.success('Thread deleted successfully!');
        // Redirect to home page
        window.location.href = '/';
      },
      onError: (error: any) => {
        const message = error.response?.data?.error?.message || 'Failed to delete thread';
        toast.error(message);
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="loading-spinner h-10 w-10 border-3 border-t-primary-500 mx-auto"></div>
          <p className="text-textSecondary mt-4">Loading thread...</p>
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
        to="/"
        className="inline-flex items-center space-x-2 text-textSecondary hover:text-textPrimary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Threads</span>
      </Link>

      {/* Thread Content */}
      <div className="card p-6 mb-8">
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
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {thread.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Thread Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm font-medium text-textPrimary">
                {thread.author.username}
              </span>
              <span className="text-sm text-textTertiary">•</span>
              <span className="text-sm text-textTertiary">
                {formatDate(thread.createdAt)}
              </span>
              {thread.status === 'flagged' && (
                <>
                  <span className="text-sm text-textTertiary">•</span>
                  <span className="badge badge-accent text-xs">
                    Under Review
                  </span>
                </>
              )}
            </div>

            <h1 className="text-3xl font-bold text-textPrimary mb-4">{thread.title}</h1>
            
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-4 h-4 text-textTertiary" />
              <span className="text-sm text-textSecondary capitalize">{thread.topic}</span>
            </div>

            <p className="text-textSecondary mb-6 whitespace-pre-wrap leading-relaxed">{thread.content}</p>

            {/* Image Display */}
            {thread.imageUrl && (
              <div className="mb-6">
                <img
                  src={thread.imageUrl}
                  alt={thread.imageCaption || 'Thread image'}
                  className="w-full max-w-2xl rounded-xl shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {thread.imageCaption && (
                  <p className="text-sm text-textTertiary mt-3 italic text-center">
                    {thread.imageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Thread Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => likeThreadMutation.mutate()}
                  disabled={likeThreadMutation.isLoading}
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    thread.likedByMe ? 'text-accent-400' : 'text-textTertiary hover:text-textPrimary'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${thread.likedByMe ? 'fill-current' : ''}`} />
                  <span>{thread.likes}</span>
                </button>
                <div className="flex items-center space-x-2 text-sm text-textTertiary">
                  <MessageCircle className="w-5 h-5" />
                  <span>{thread.replyCount}</span>
                </div>
              </div>

              {user && (
                <div className="flex items-center space-x-3">
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
                      className="btn btn-secondary flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Summarize</span>
                    </button>
                  )}
                  {(user._id === thread.author._id || user.role === 'admin') && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
                          deleteThreadMutation.mutate();
                        }
                      }}
                      disabled={deleteThreadMutation.isLoading}
                      className="btn btn-accent flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* AI Summary */}
            {thread.summary && (
              <div className="mt-6 p-5 bg-primary-500/10 rounded-xl border border-primary-500/20">
                <h3 className="text-sm font-medium text-primary-400 mb-3 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Summary</span>
                </h3>
                <p className="text-sm text-primary-300 whitespace-pre-line leading-relaxed">
                  {thread.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-textPrimary">
            Replies ({thread.replyCount})
          </h2>
          {replies.items && replies.items.length > 0 && (
            <button
              onClick={() => setIsReplyModalOpen(true)}
              className="btn btn-primary"
            >
              Add Reply
            </button>
          )}
        </div>

        {replies.items && replies.items.length > 0 ? (
          <>
            <div className="space-y-4">
              {replies.items.map((reply: Reply) => (
                <ReplyCard 
                  key={reply._id} 
                  reply={reply} 
                  threadId={id!}
                  onReplyUpdate={(replyId, updatedReply) => {
                    queryClient.invalidateQueries(['thread', id]);
                  }}
                  onReplyDelete={(replyId) => {
                    queryClient.invalidateQueries(['thread', id]);
                  }}
                  onNestedReply={(parentReplyId) => {
                    // Open reply modal with parentReplyId
                    setParentReplyId(parentReplyId);
                    setIsReplyModalOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Reply Pagination */}
            {replies.total > replies.limit && (
              <div className="flex justify-center items-center space-x-3 mt-8">
                <button
                  onClick={() => setReplyPage(prev => Math.max(1, prev - 1))}
                  disabled={replyPage === 1}
                  className="btn btn-ghost flex items-center space-x-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-sm text-textSecondary px-4 py-2">
                  Page {replyPage} of {Math.ceil(replies.total / replies.limit)}
                </span>
                <button
                  onClick={() => setReplyPage(prev => prev + 1)}
                  disabled={replyPage >= Math.ceil(replies.total / replies.limit)}
                  className="btn btn-ghost flex items-center space-x-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card p-8 text-center">
            <MessageCircle className="w-16 h-16 text-textTertiary mx-auto mb-4 opacity-60" />
            <h3 className="text-xl font-medium text-textPrimary mb-2">No replies yet</h3>
            <p className="text-textSecondary mb-6">Be the first to share your thoughts!</p>
            <button
              onClick={() => setIsReplyModalOpen(true)}
              className="btn btn-primary"
            >
              Add First Reply
            </button>
          </div>
        )}
      </div>

      {/* Create Reply Modal */}
      <CreateReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => {
          setIsReplyModalOpen(false);
          setParentReplyId(null);
        }}
        onSubmit={(content, parentReplyId) => {
          if (parentReplyId) {
            // Handle nested reply
            repliesApi.createReply(id!, { content }, parentReplyId)
              .then((response) => {
                queryClient.invalidateQueries(['thread', id]);
                setIsReplyModalOpen(false);
                setParentReplyId(null);
                if (response.moderation) {
                  toast.success('Reply posted but flagged for review');
                } else {
                  toast.success('Reply posted successfully!');
                }
              })
              .catch((error: any) => {
                const message = error.response?.data?.error?.message || 'Failed to post reply';
                toast.error(message);
              });
          } else {
            // Handle regular reply
            createReplyMutation.mutate(content);
          }
        }}
        isLoading={createReplyMutation.isLoading}
        threadId={id!}
        parentReply={parentReplyId ? replies.items?.find(r => r._id === parentReplyId) || null : null}
      />
    </div>
  );
};

export default ThreadDetail;