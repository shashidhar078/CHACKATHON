import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount
} from '../controllers/notificationController.js';
import { validateQuery, notificationQuerySchema } from '../middleware/validation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Notification routes - all require authentication
router.use(verifyToken);

router.get('/', validateQuery(notificationQuerySchema), getNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);
router.get('/unread/count', getUnreadCount);

export default router;
