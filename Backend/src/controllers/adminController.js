import User from '../models/User.js';
import Thread from '../models/Thread.js';
import Reply from '../models/Reply.js';

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

    const threads = await Thread.find({ status: 'flagged' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Thread.countDocuments({ status: 'flagged' });

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

    const replies = await Reply.find({ status: 'flagged' })
      .populate('threadId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Reply.countDocuments({ status: 'flagged' });

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
