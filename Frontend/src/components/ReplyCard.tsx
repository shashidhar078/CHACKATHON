import React, { useState } from 'react';
import { Heart, MessageCircle, Smile, MoreHorizontal, Reply, Edit, Trash2, Flag } from 'lucide-react';
import { Reply as ReplyType, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { repliesApi } from '../services/api';
import toast from 'react-hot-toast';
import EmojiPicker from './EmojiPicker';

interface ReplyCardProps {
  reply: ReplyType;
  threadId: string;
  onReplyUpdate: (replyId: string, updatedReply: ReplyType) => void;
  onReplyDelete: (replyId: string) => void;
  onNestedReply: (parentReplyId: string) => void;
  depth?: number;
  showNestedReplies?: boolean;
}

const ReplyCard: React.FC<ReplyCardProps> = ({
  reply,
  threadId,
  onReplyUpdate,
  onReplyDelete,
  onNestedReply,
  depth = 0,
  showNestedReplies = true
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [nestedReplies, setNestedReplies] = useState<ReplyType[]>([]);
  const [showNested, setShowNested] = useState(false);
  const [isLoadingNested, setIsLoadingNested] = useState(false);

  const { user } = useAuth();
  const isAuthor = user?._id === reply.author._id;
  const isAdmin = user?.role === 'admin';
  const canModify = isAuthor || isAdmin;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      const response = await repliesApi.likeReply(reply._id, { action: 'toggle' });
      onReplyUpdate(reply._id, { ...reply, ...response });
      toast.success(reply.likedByMe ? 'Reply unliked' : 'Reply liked!');
    } catch (error: any) {
      toast.error('Failed to like reply');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = () => {
    setIsReplying(true);
    onNestedReply(reply._id);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(reply.content);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === reply.content) {
      setIsEditing(false);
      return;
    }

    try {
      const response = await repliesApi.updateReply(reply._id, { content: editContent.trim() });
      onReplyUpdate(reply._id, response.reply);
      setIsEditing(false);
      toast.success('Reply updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update reply');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      await repliesApi.deleteReply(reply._id);
      onReplyDelete(reply._id);
      toast.success('Reply deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete reply');
    }
  };

  const handleEmojiReaction = async (emoji: string) => {
    try {
      await repliesApi.addEmojiReaction(reply._id, emoji);
      toast.success(`Added ${emoji} reaction!`);
      setShowEmojiPicker(false);
    } catch (error: any) {
      toast.error('Failed to add emoji reaction');
    }
  };

  const loadNestedReplies = async () => {
    // If already showing, just hide
    if (showNested) {
      setShowNested(false);
      return;
    }

    // If we already have nested replies, just show them
    if (nestedReplies.length > 0) {
      setShowNested(true);
      return;
    }

    // Load nested replies
    setIsLoadingNested(true);
    try {
      console.log('Loading nested replies for reply:', reply._id);
      const response = await repliesApi.getNestedReplies(reply._id);
      console.log('Nested replies response:', response);
      setNestedReplies(response.items || []);
      setShowNested(true);
    } catch (error) {
      console.error('Failed to load nested replies:', error);
      toast.error('Failed to load nested replies');
    } finally {
      setIsLoadingNested(false);
    }
  };

  // Refresh nested replies when needed
  const refreshNestedReplies = async () => {
    if (showNested) {
      setIsLoadingNested(true);
      try {
        const response = await repliesApi.getNestedReplies(reply._id);
        setNestedReplies(response.items || []);
      } catch (error) {
        console.error('Failed to refresh nested replies:', error);
      } finally {
        setIsLoadingNested(false);
      }
    }
  };

  const maxDepth = 3; // Maximum nesting depth
  const canNest = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l border-gray-200 pl-4' : ''} py-2`}>
      <div className="bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors">
        {/* Reply Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Author Avatar */}
            {reply.author.avatarUrl ? (
              <img
                src={reply.author.avatarUrl}
                alt={reply.author.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {reply.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {reply.author.username}
                </span>
                {reply.author._id === user?._id && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
                {reply.status === 'flagged' && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Under Review
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(reply.createdAt)}
              </span>
            </div>
          </div>

          {/* Options Menu */}
          {canModify && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>

              {showOptions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[120px]">
                  {isAuthor && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                  {isAdmin && !isAuthor && (
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete as Admin</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reply-to Context */}
        {reply.parentReplyId && (
          <div className="mb-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <span className="font-medium">Replying to:</span> {reply.parentReplyAuthor || 'Unknown user'}
          </div>
        )}

        {/* Reply Content */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-gray-800 whitespace-pre-wrap">{reply.content}</p>
          </div>
        )}

        {/* Reply Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                reply.likedByMe
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${reply.likedByMe ? 'fill-current' : ''}`} />
              <span>{reply.likes}</span>
            </button>

            {/* Emoji Reactions Display */}
            {reply.emojiReactions && Object.keys(reply.emojiReactions).length > 0 && (
              <div className="flex items-center space-x-1">
                {Object.entries(reply.emojiReactions).map(([emoji, count]) => (
                  <span key={emoji} className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                    {emoji} {count}
                  </span>
                ))}
              </div>
            )}

            {/* Reply Button */}
            {canNest && (
              <button
                onClick={handleReply}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            {/* Emoji Reaction Button */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <Smile className="w-4 h-4" />
                <span>React</span>
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-20">
                  <EmojiPicker onEmojiSelect={handleEmojiReaction} />
                </div>
              )}
            </div>

            {/* Load Nested Replies */}
            {showNestedReplies && (
              <button
                onClick={loadNestedReplies}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {isLoadingNested ? 'Loading...' : 
                   showNested ? `Hide replies (${nestedReplies.length})` : 
                   `Show replies${reply.replyCount > 0 ? ` (${reply.replyCount})` : ''}`}
                </span>
              </button>
            )}
          </div>

          {/* Character Count */}
          <span className="text-xs text-gray-400">
            {reply.content.length}/1000
          </span>
        </div>

        {/* Nested Replies */}
        {showNested && showNestedReplies && (
          <div className="mt-4 space-y-3">
            {nestedReplies.map((nestedReply) => (
              <ReplyCard
                key={nestedReply._id}
                reply={nestedReply}
                threadId={threadId}
                onReplyUpdate={onReplyUpdate}
                onReplyDelete={onReplyDelete}
                onNestedReply={onNestedReply}
                depth={depth + 1}
                showNestedReplies={depth < 2} // Allow up to 3 levels of nesting
              />
            ))}
            
            {nestedReplies.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No replies yet. Be the first to reply!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyCard;
