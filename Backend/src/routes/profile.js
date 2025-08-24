import express from 'express';
import { verifyToken, requireUser } from '../middleware/auth.js';
import { getProfile, updateProfile, getUserThreads, getUserReplies } from '../controllers/profileController.js';

const router = express.Router();

// Get own profile
router.get('/', verifyToken, requireUser, getProfile);
// Update own profile
router.patch('/', verifyToken, requireUser, updateProfile);
// Get threads by user
router.get('/threads/:id?', verifyToken, requireUser, getUserThreads);
// Get replies received by user
router.get('/replies/:id?', verifyToken, requireUser, getUserReplies);

export default router;
