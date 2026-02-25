import React, { useState } from 'react';
import { Heart, MessageCircle, Smile, MoreHorizontal, Reply, Edit, Trash2, Flag, User, Clock, Sparkles } from 'lucide-react';
import { Reply as ReplyType, User as UserType } from '../types';
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

  const maxDepth = 3; // Maximum nesting depth
  const canNest = depth < maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l border-border pl-4' : ''} py-2`}>
      <div className="card p-4 hover-lift transition-all duration-300">
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
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {reply.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-textPrimary">
                  {reply.author.username}
                </span>
                {reply.author._id === user?._id && (
                  <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
                {reply.status === 'flagged' && (
                  <span className="text-xs bg-accent-500/20 text-accent-400 px-2 py-1 rounded-full">
                    Under Review
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-sm text-textTertiary">
                <Clock className="w-3 h-3" />
                <span>{formatDate(reply.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Options Menu */}
          {canModify && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-surfaceElevated rounded-full transition-colors duration-200"
              >
                <MoreHorizontal className="w-4 h-4 text-textTertiary" />
              </button>

              {showOptions && (
                <div className="absolute right-0 top-8 bg-surfaceElevated border border-border rounded-xl shadow-2xl py-2 z-10 min-w-[120px]">
                  {isAuthor && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="w-full text-left px-4 py-2 text-sm text-textSecondary hover:bg-surface hover:text-textPrimary transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-accent-400 hover:bg-surface hover:text-accent-300 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                  {isAdmin && !isAuthor && (
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-accent-400 hover:bg-surface hover:text-accent-300 transition-colors duration-200 flex items-center space-x-2"
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
          <div className="mb-2 text-xs text-textTertiary bg-surfaceElevated p-2 rounded-lg">
            <span className="font-medium">Replying to:</span> {reply.parentReplyAuthor || 'Unknown user'}
          </div>
        )}

        {/* Reply Content */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="input resize-none"
              rows={3}
              maxLength={1000}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary text-sm"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-textSecondary whitespace-pre-wrap">{reply.content}</p>
          </div>
        )}

        {/* Reply Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`btn btn-ghost flex items-center space-x-2 px-3 py-2 ${
                reply.likedByMe
                  ? 'text-accent-400 hover:text-accent-300'
                  : 'text-textTertiary hover:text-textPrimary'
              }`}
            >
              <Heart className={`w-4 h-4 ${reply.likedByMe ? 'fill-current' : ''}`} />
              <span>{reply.likes}</span>
            </button>

            {/* Emoji Reactions Display */}
            {reply.emojiReactions && Object.keys(reply.emojiReactions).length > 0 && (
              <div className="flex items-center space-x-1">
                {Object.entries(reply.emojiReactions).map(([emoji, count]) => (
                  <span key={emoji} className="text-sm bg-surfaceElevated px-2 py-1 rounded-full text-textSecondary">
                    {emoji} {count}
                  </span>
                ))}
              </div>
            )}

            {/* Reply Button */}
            {canNest && (
              <button
                onClick={handleReply}
                className="btn btn-ghost flex items-center space-x-2 px-3 py-2"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            {/* Emoji Reaction Button */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="btn btn-ghost flex items-center space-x-2 px-3 py-2"
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
                className="btn btn-ghost flex items-center space-x-2 px-3 py-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {isLoadingNested ? 'Loading...' : 
                   showNested ? `Hide replies (${nestedReplies.length})` : 
                   `Show replies${(reply.replyCount ?? 0) > 0 ? ` (${reply.replyCount})` : ''}`}
                </span>
              </button>
            )}
          </div>

          {/* Character Count */}
          <span className="text-xs text-textTertiary">
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
              <div className="text-center py-4 text-textTertiary text-sm">
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