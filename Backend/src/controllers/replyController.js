import Reply from '../models/Reply.js';
import Thread from '../models/Thread.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import aiService from '../utils/aiService.js';

// Helper function to add likedByMe field
const addLikedByMe = (replies, userId) => {
  return replies.map(reply => ({
    ...reply.toObject(),
    likedByMe: reply.likes.includes(userId)
  }));
};

export const createReply = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

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

    // AI moderation
    const moderationResult = await aiService.moderateText(content);

    // Create reply
    const reply = new Reply({
      threadId,
      content,
      author: {
        _id: userId,
        username: req.user.username,
        avatarUrl: req.user.avatarUrl
      },
      moderation: moderationResult
    });

    // Set status based on moderation
    if (moderationResult.status === 'Flagged') {
      reply.status = 'flagged';
    }

    await reply.save();

    // Update thread reply count
    await thread.updateReplyCount();

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

    // Build query - only show approved replies to non-admin users
    const query = { threadId, status: 'approved' };
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
    await Thread.findByIdAndUpdate(reply.threadId, { $inc: { replyCount: -1 } });

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
