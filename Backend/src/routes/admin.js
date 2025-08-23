import express from 'express';
import {
  getDashboard,
  getFlaggedThreads,
  getFlaggedReplies,
  approveThread,
  approveReply,
  getUsers,
  updateUserRole
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
router.get('/threads/flagged', getFlaggedThreads);
router.get('/replies/flagged', getFlaggedReplies);
router.patch('/threads/:id/approve', approveThread);
router.patch('/replies/:id/approve', approveReply);
router.get('/users', validateQuery(notificationQuerySchema), getUsers);
router.patch('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);

export default router;
