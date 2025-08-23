import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';
import { verifyToken } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Auth routes
router.post('/register', authRateLimit, validate(registerSchema), register);
router.post('/login', authRateLimit, validate(loginSchema), login);
router.get('/me', verifyToken, getMe);

export default router;
