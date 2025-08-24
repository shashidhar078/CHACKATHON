import express from 'express';
import {
  createThread,
  getThreads,
  getThreadById,
  likeThread,
  summarizeThread,
  deleteThread
} from '../controllers/threadController.js';
import {
  validate,
  validateQuery,
  createThreadSchema,
  threadQuerySchema,
  likeActionSchema
} from '../middleware/validation.js';
import { verifyToken, requireUser, requireAdmin } from '../middleware/auth.js';
import { contentRateLimit, aiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Thread routes
router.post('/', verifyToken, requireUser, contentRateLimit, validate(createThreadSchema), createThread);
router.get('/', validateQuery(threadQuerySchema), getThreads);
router.get('/:id', getThreadById);
router.post('/:id/like', verifyToken, requireUser, validate(likeActionSchema), likeThread);
router.post('/:id/summarize', verifyToken, requireUser, aiRateLimit, summarizeThread);
router.delete('/:id', verifyToken, requireUser, deleteThread);

export default router;
