import express from 'express';
import {
  createReply,
  getRepliesByThread,
  likeReply,
  deleteReply,
  getNestedReplies,
  updateReply,
  addEmojiReaction
} from '../controllers/replyController.js';
import {
  validate,
  validateQuery,
  createReplySchema,
  replyQuerySchema,
  likeActionSchema
} from '../middleware/validation.js';
import { verifyToken, requireUser, requireAdmin } from '../middleware/auth.js';
import { contentRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Reply routes
router.post('/:threadId', verifyToken, requireUser, contentRateLimit, validate(createReplySchema), createReply);
router.get('/thread/:threadId', validateQuery(replyQuerySchema), getRepliesByThread);
router.get('/:parentReplyId/nested', validateQuery(replyQuerySchema), getNestedReplies);
router.post('/:id/like', verifyToken, requireUser, validate(likeActionSchema), likeReply);
router.post('/:id/reactions', verifyToken, requireUser, addEmojiReaction);
router.patch('/:id', verifyToken, requireUser, validate(createReplySchema), updateReply);
router.delete('/:id', verifyToken, requireAdmin, deleteReply);

export default router;
