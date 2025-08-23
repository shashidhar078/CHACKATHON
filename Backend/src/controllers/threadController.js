import Thread from '../models/Thread.js';
import Reply from '../models/Reply.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import aiService from '../utils/aiService.js';

// Helper function to add likedByMe field
const addLikedByMe = (threads, userId) => {
  return threads.map(thread => ({
    ...thread.toObject(),
    likedByMe: thread.likes.includes(userId)
  }));
};

export const createThread = async (req, res) => {
  try {
    const { title, content, topic } = req.body;
    const userId = req.user._id;

    // AI moderation
    const moderationText = `${title}\n\n${content}`;
    const moderationResult = await aiService.moderateText(moderationText);

    // Create thread
    const thread = new Thread({
      title,
      content,
      topic,
      author: {
        _id: userId,
        username: req.user.username,
        avatarUrl: req.user.avatarUrl
      },
      moderation: moderationResult
    });

    // Set status based on moderation
    if (moderationResult.status === 'Flagged') {
      thread.status = 'flagged';
    }

    await thread.save();

    // Create notification for admins if flagged
    if (thread.status === 'flagged') {
      const adminUsers = await User.find({ role: 'admin' });
      const notifications = adminUsers.map(admin => ({
        userId: admin._id,
        type: 'admin:moderation',
        title: 'New flagged content',
        body: `Thread "${title}" has been flagged for review`,
        data: { threadId: thread._id, type: 'thread' }
      }));
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    // Emit socket event
    req.io.emit('thread:new', {
      thread: {
        ...thread.toObject(),
        likedByMe: false
      }
    });

    // Return response based on moderation status
    if (thread.status === 'flagged') {
      return res.status(202).json({
        thread: {
          ...thread.toObject(),
          likedByMe: false
        },
        moderation: {
          status: 'Flagged',
          reason: moderationResult.reason
        }
      });
    }

    res.status(201).json({
      thread: {
        ...thread.toObject(),
        likedByMe: false
      }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create thread'
      }
    });
  }
};

export const getThreads = async (req, res) => {
  try {
    const { topic, search, page = 1, limit = 10, sort = 'newest' } = req.query;
    const userId = req.user?._id;

    // Build query
    const query = { status: 'approved' };
    if (topic) query.topic = topic;
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { likeCount: -1, createdAt: -1 };
        break;
    }

    // Execute query
    const skip = (page - 1) * limit;
    const threads = await Thread.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Thread.countDocuments(query);

    // Add likedByMe field
    const threadsWithLikes = addLikedByMe(threads, userId);

    res.json({
      items: threadsWithLikes,
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get threads'
      }
    });
  }
};

export const getThreadById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const thread = await Thread.findById(id).lean();
    if (!thread) {
      return res.status(404).json({
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    // Check if user can view flagged content
    if (thread.status === 'flagged' && 
        (!userId || (userId.toString() !== thread.author._id.toString() && req.user?.role !== 'admin'))) {
      return res.status(404).json({
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    // Get replies
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const replyQuery = { threadId: id, status: 'approved' };
    
    let replySort = { createdAt: -1 };
    if (sort === 'oldest') replySort = { createdAt: 1 };

    const skip = (page - 1) * limit;
    const replies = await Reply.find(replyQuery)
      .sort(replySort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const replyTotal = await Reply.countDocuments(replyQuery);

    // Add likedByMe fields
    const threadWithLikes = addLikedByMe([thread], userId)[0];
    const repliesWithLikes = addLikedByMe(replies, userId);

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

export const likeThread = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user._id;

    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    const likeIndex = thread.likes.indexOf(userId);
    let likedByMe = false;

    if (action === 'toggle') {
      if (likeIndex > -1) {
        thread.likes.splice(likeIndex, 1);
      } else {
        thread.likes.push(userId);
        likedByMe = true;
      }
      await thread.save();
    }

    // Emit socket event
    req.io.emit('thread:like', {
      threadId: id,
      likes: thread.likes.length
    });

    res.json({
      likes: thread.likes.length,
      likedByMe
    });
  } catch (error) {
    console.error('Like thread error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to like thread'
      }
    });
  }
};

export const summarizeThread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const thread = await Thread.findById(id);
    if (!thread) {
      return res.status(404).json({
        error: {
          code: 'THREAD_NOT_FOUND',
          message: 'Thread not found'
        }
      });
    }

    // Get replies for summarization
    const replies = await Reply.find({ threadId: id, status: 'approved' })
      .sort({ createdAt: 1 })
      .select('author content')
      .lean();

    // Prepare items for AI summarization
    const items = [
      { author: thread.author.username, content: thread.content },
      ...replies.map(reply => ({
        author: reply.author.username,
        content: reply.content
      }))
    ];

    // Generate summary
    const summary = await aiService.summarizeThread(items);

    if (summary) {
      thread.summary = summary;
      await thread.save();

      // Emit socket event
      req.io.emit('thread:updated', {
        threadId: id,
        summary
      });

      res.json({
        summary,
        status: 'completed'
      });
    } else {
      res.status(202).json({
        summary: null,
        status: 'queued'
      });
    }
  } catch (error) {
    console.error('Summarize thread error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to summarize thread'
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
