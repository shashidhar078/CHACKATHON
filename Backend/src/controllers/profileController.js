import User from '../models/User.js';
import Thread from '../models/Thread.js';
import Reply from '../models/Reply.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get profile' } });
  }
};

// Update user profile (username, bio)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    await user.save();
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } });
  }
};

// Get threads by user
export const getUserThreads = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const threads = await Thread.find({ 'author._id': userId }).sort({ createdAt: -1 });
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get user threads' } });
  }
};

// Get replies received by user (replies to user's threads)
export const getUserReplies = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    // Find threads authored by user
    const threads = await Thread.find({ 'author._id': userId }).select('_id');
    const threadIds = threads.map(t => t._id);
    // Find replies to those threads
    const replies = await Reply.find({ threadId: { $in: threadIds } }).sort({ createdAt: -1 });
    res.json({ replies });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get user replies' } });
  }
};
