import express from 'express';
import {
  getDashboard,
  getFlaggedThreads,
  getFlaggedReplies,
  getThreadById,
  approveThread,
  approveReply,
  deleteThread,
  deleteReply,
  getUsers,
  updateUserRole,
  blockUser,
  unblockUser,
  getAnalytics
} from '../controllers/adminController.js';
import {
  validate,
  validateQuery,
  updateUserRoleSchema,
  notificationQuerySchema
} from '../middleware/validation.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes - all require admin role
router.use(verifyToken, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/threads/flagged', getFlaggedThreads);
router.get('/threads/:id', getThreadById);
router.get('/replies/flagged', getFlaggedReplies);
router.patch('/threads/:id/approve', approveThread);
router.delete('/threads/:id', deleteThread);
router.patch('/replies/:id/approve', approveReply);
router.delete('/replies/:id', deleteReply);
router.get('/users', validateQuery(notificationQuerySchema), getUsers);
router.patch('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);

export default router;
