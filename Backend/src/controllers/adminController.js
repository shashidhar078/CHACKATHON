import User from '../models/User.js';
import Thread from '../models/Thread.js';
import Reply from '../models/Reply.js';
import Notification from '../models/Notification.js';

export const getDashboard = async (req, res) => {
  try {
    // Get counts
    const [users, threads, replies, flaggedThreads, flaggedReplies] = await Promise.all([
      User.countDocuments(),
      Thread.countDocuments(),
      Reply.countDocuments(),
      Thread.countDocuments({ status: 'flagged' }),
      Reply.countDocuments({ status: 'flagged' })
    ]);

    res.json({
      users,
      threads,
      replies,
      flagged: {
        threads: flaggedThreads,
        replies: flaggedReplies
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get dashboard data'
      }
    });
  }
};

export const getFlaggedThreads = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    console.log('Fetching flagged threads with query:', { page, limit, skip });

    const threads = await Thread.find({ status: 'flagged' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Thread.countDocuments({ status: 'flagged' });

    console.log('Found flagged threads:', { count: threads.length, total });

    res.json({
      items: threads,
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  } catch (error) {
    console.error('Get flagged threads error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get flagged threads'
      }
    });
  }
};

export const getFlaggedReplies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    console.log('Fetching flagged replies with query:', { page, limit, skip });

    const replies = await Reply.find({ status: 'flagged' })
      .populate('threadId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Reply.countDocuments({ status: 'flagged' });

    console.log('Found flagged replies:', { count: replies.length, total });

    res.json({
      items: replies,
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  } catch (error) {
    console.error('Get flagged replies error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get flagged replies'
      }
    });
  }
};

export const approveThread = async (req, res) => {
  try {
    const { id } = req.params;

    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    thread.status = 'approved';
    thread.moderation.reviewedByAdmin = true;
    await thread.save();

    // Emit socket event
    req.io.emit('admin:moderation', {
      type: 'thread',
      id,
      action: 'approved'
    });

    res.json({
      thread: {
        ...thread.toObject(),
        likedByMe: false
      }
    });
  } catch (error) {
    console.error('Approve thread error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to approve thread'
      }
    });
  }
};

export const approveReply = async (req, res) => {
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

    reply.status = 'approved';
    reply.moderation.reviewedByAdmin = true;
    await reply.save();

    // Emit socket event
    req.io.emit('admin:moderation', {
      type: 'reply',
      id,
      action: 'approved'
    });

    res.json({
      reply: {
        ...reply.toObject(),
        likedByMe: false
      }
    });
  } catch (error) {
    console.error('Approve reply error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to approve reply'
      }
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      items: users,
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get users'
      }
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Prevent admin from changing their own role
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ACTION',
          message: 'Cannot change your own role'
        }
      });
    }

    user.role = role;
    await user.save();

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        badges: user.badges,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user role'
      }
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        error: {
          code: 'CANNOT_BLOCK_ADMIN',
          message: 'Cannot block admin users'
        }
      });
    }

    user.isBlocked = true;
    user.blockedReason = reason;
    user.blockedBy = adminId;
    user.blockedAt = new Date();
    await user.save();

    res.json({
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to block user'
      }
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    user.isBlocked = false;
    user.blockedReason = null;
    user.blockedBy = null;
    user.blockedAt = null;
    await user.save();

    res.json({
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to unblock user'
      }
    });
  }
};

export const deleteThread = async (req, res) => {
  try {
    const { id } = req.params;

    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    // Delete all replies
    await Reply.deleteMany({ threadId: id });

    // Delete thread
    await Thread.findByIdAndDelete(id);

    // Emit socket event
    req.io.emit('admin:moderation', {
      type: 'thread',
      id,
      action: 'deleted'
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete thread'
      }
    });
  }
};

export const getThreadById = async (req, res) => {
  try {
    const { id } = req.params;

    const thread = await Thread.findById(id).lean();
    if (!thread) {
      return res.status(404).json({
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    // Get replies
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const replyQuery = { threadId: id };
    
    // Admins can see all replies (including flagged ones)
    let replySort = { createdAt: -1 };
    if (sort === 'oldest') replySort = { createdAt: 1 };

    const skip = (page - 1) * limit;
    const replies = await Reply.find(replyQuery)
      .sort(replySort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const replyTotal = await Reply.countDocuments(replyQuery);

    // Add likedByMe fields (no userId needed for admin view)
    const threadWithLikes = {
      ...thread,
      likes: Array.isArray(thread.likes) ? thread.likes.length : 0,
      likedByMe: false
    };
    
    const repliesWithLikes = replies.map(reply => ({
      ...reply,
      likes: Array.isArray(reply.likes) ? reply.likes.length : 0,
      likedByMe: false
    }));

    res.json({
      thread: threadWithLikes,
      replies: {
        items: repliesWithLikes,
        page: parseInt(page),
        limit: parseInt(limit),
        total: replyTotal
      }
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get thread'
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
