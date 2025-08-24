import Reply from '../models/Reply.js';
import Thread from '../models/Thread.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import aiService from '../utils/aiService.js';

// Helper function to add likedByMe field and ensure likes count
const addLikedByMe = (replies, userId) => {
  return replies.map(reply => ({
    ...reply,
    likes: Array.isArray(reply.likes) ? reply.likes.length : 0,
    likedByMe: Array.isArray(reply.likes) ? reply.likes.includes(userId) : false
  }));
};

export const createReply = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, parentReplyId } = req.body;
    const userId = req.user._id;

    console.log('Creating reply with:', { threadId, content, parentReplyId, userId });

    // Check if thread exists
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    // AI moderation (with fallback)
    let moderationResult = { status: 'Skipped', reason: 'AI service unavailable', confidence: 0 };
    try {
      moderationResult = await aiService.moderateText(content);
    } catch (error) {
      console.error('AI moderation failed, using fallback:', error.message);
      // Continue with fallback - no moderation
    }

    // Create reply
    const reply = new Reply({
      threadId,
      content,
      parentReplyId: parentReplyId || null,
      author: {
        _id: userId,
        username: req.user.username,
        avatarUrl: req.user.avatarUrl
      },
      moderation: moderationResult
    });

    // Calculate depth if it's a nested reply
    if (parentReplyId) {
      console.log('Creating nested reply with parentReplyId:', parentReplyId);
      const parentReply = await Reply.findById(parentReplyId);
      if (parentReply) {
        reply.depth = (parentReply.depth || 0) + 1;
        reply.parentReplyAuthor = parentReply.author.username;
        console.log('Parent reply found, depth set to:', reply.depth);
      } else {
        console.log('Parent reply not found for ID:', parentReplyId);
      }
    }

    // Set status based on moderation
    if (moderationResult.status === 'Flagged') {
      reply.status = 'flagged';
      console.log('Reply flagged:', { content: content.substring(0, 50) + '...', reason: moderationResult.reason });
    } else {
      reply.status = 'approved';
    }

    await reply.save();
    console.log('Reply saved with status:', reply.status);

    // Update thread reply count
    await Thread.updateReplyCount(threadId);
    
    // Update parent reply count if this is a nested reply
    if (parentReplyId) {
      await Reply.findByIdAndUpdate(parentReplyId, { $inc: { replyCount: 1 } });
    }


    // Create notification for admins if flagged
    if (reply.status === 'flagged') {
      const adminUsers = await User.find({ role: 'admin' });
      const notifications = adminUsers.map(admin => ({
        userId: admin._id,
        type: 'admin:moderation',
        title: 'New flagged reply',
        body: `Reply in thread "${thread.title}" has been flagged for review`,
        data: { replyId: reply._id, threadId, type: 'reply' }
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    // Notify thread author if someone else replies to their thread (not nested reply)
    if (!parentReplyId && thread.author._id.toString() !== userId.toString()) {
      await Notification.create({
        userId: thread.author._id,
        type: 'reply:new',
        title: 'New reply to your thread',
        body: `${req.user.username} replied to your thread "${thread.title}"`,
        data: { replyId: reply._id, threadId, type: 'reply' }
      });
      // Emit socket event to thread author
      req.io.to(`user:${thread.author._id}`).emit('notification:new', {
        type: 'reply:new',
        replyId: reply._id,
        threadId,
        message: `${req.user.username} replied to your thread "${thread.title}"`
      });
    }

    // Emit socket event
    req.io.to(`thread:${threadId}`).emit('reply:new', {
      threadId,
      reply: {
        ...reply.toObject(),
        likedByMe: false
      }
    });

    // Return response based on moderation status
    if (reply.status === 'flagged') {
      return res.status(202).json({
        reply: {
          ...reply.toObject(),
          likedByMe: false
        },
        moderation: {
          status: 'Flagged',
          reason: moderationResult.reason
        }
      });
    }

    res.status(201).json({
      reply: {
        ...reply.toObject(),
        likedByMe: false
      }
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create reply'
      }
    });
  }
};

export const getRepliesByThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const userId = req.user?._id;

    // Check if thread exists
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    // Build query - only show approved replies to non-admin users, exclude nested replies
    const query = { threadId, parentReplyId: null, status: 'approved' };
    if (req.user?.role === 'admin') {
      delete query.status; // Admins can see all replies
    }

    // Build sort
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    // Execute query
    const skip = (page - 1) * limit;
    const replies = await Reply.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Reply.countDocuments(query);

    // Add likedByMe field
    const repliesWithLikes = addLikedByMe(replies, userId);

    res.json({
      items: repliesWithLikes,
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get replies'
      }
    });
  }
};

export const likeReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user._id;

    const reply = await Reply.findById(id);
    if (!reply) {
      return res.status(404).json({
        error: {
          code: 'REPLY_NOT_FOUND',
          message: 'Reply not found'
        }
      });
    }

    const likeIndex = reply.likes.indexOf(userId);
    let likedByMe = false;

    if (action === 'toggle') {
      if (likeIndex > -1) {
        reply.likes.splice(likeIndex, 1);
      } else {
        reply.likes.push(userId);
        likedByMe = true;
      }
      await reply.save();
    }

    // Emit socket event
    req.io.to(`thread:${reply.threadId}`).emit('reply:like', {
      replyId: id,
      likes: reply.likes.length
    });

    res.json({
      likes: reply.likes.length,
      likedByMe
    });
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to like reply'
      }
    });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { id } = req.params;

    const reply = await Reply.findById(id);
    if (!reply) {
      return res.status(404).json({
        error: {
          code: 'REPLY_NOT_FOUND',
          message: 'Reply not found'
        }
      });
    }

    // Update thread reply count
    await Thread.updateReplyCount(reply.threadId);
    
    // Update parent reply count if this was a nested reply
    if (reply.parentReplyId) {
      await Reply.findByIdAndUpdate(reply.parentReplyId, { $inc: { replyCount: -1 } });
    }

    // Delete reply
    await Reply.findByIdAndDelete(id);

    // Emit socket event
    req.io.emit('admin:moderation', {
      type: 'reply',
      id,
      action: 'deleted'
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete reply'
      }
    });
  }
};

export const getNestedReplies = async (req, res) => {
  try {
    const { parentReplyId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user?._id;

    const skip = (page - 1) * limit;

    const replies = await Reply.find({ parentReplyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Reply.countDocuments({ parentReplyId });

    // Add likedByMe field
    const repliesWithLikes = addLikedByMe(replies, userId);

    res.json({
      items: repliesWithLikes,
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  } catch (error) {
    console.error('Get nested replies error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get nested replies'
      }
    });
  }
};

export const updateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const reply = await Reply.findById(id);
    if (!reply) {
      return res.status(404).json({
        error: {
          code: 'REPLY_NOT_FOUND',
          message: 'Reply not found'
        }
      });
    }

    // Check if user can edit this reply
    if (reply.author._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only edit your own replies'
        }
      });
    }

    reply.content = content;
    await reply.save();

    res.json({
      reply: {
        ...reply.toObject(),
        likedByMe: reply.likes.includes(userId)
      }
    });
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update reply'
      }
    });
  }
};

export const addEmojiReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const reply = await Reply.findById(id);
    if (!reply) {
      return res.status(404).json({
        error: {
          code: 'REPLY_NOT_FOUND',
          message: 'Reply not found'
        }
      });
    }

    // Initialize emojiReactions if it doesn't exist
    if (!reply.emojiReactions) {
      reply.emojiReactions = new Map();
    }

    // Add or increment emoji reaction
    const currentCount = reply.emojiReactions.get(emoji) || 0;
    reply.emojiReactions.set(emoji, currentCount + 1);

    await reply.save();

    res.json({
      success: true,
      emojiReactions: Object.fromEntries(reply.emojiReactions)
    });
  } catch (error) {
    console.error('Add emoji reaction error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add emoji reaction'
      }
    });
  }
};
