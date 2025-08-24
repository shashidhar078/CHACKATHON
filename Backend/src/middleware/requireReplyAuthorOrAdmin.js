import Reply from '../models/Reply.js';

// Middleware to allow reply author or admin to delete
export default async function requireReplyAuthorOrAdmin(req, res, next) {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const replyId = req.params.id;
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({
        error: {
          code: 'REPLY_NOT_FOUND',
          message: 'Reply not found'
        }
      });
    }
    if (reply.author._id.toString() === userId.toString() || isAdmin) {
      return next();
    }
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'You can only delete your own replies'
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to authorize reply deletion'
      }
    });
  }
}
