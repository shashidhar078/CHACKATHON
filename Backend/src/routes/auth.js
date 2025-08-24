import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register, login, getMe } from '../controllers/authController.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';
import { verifyToken } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Auth routes
router.post('/register', authRateLimit, validate(registerSchema), register);
router.post('/login', authRateLimit, validate(loginSchema), login);
router.get('/me', verifyToken, getMe);

// OAuth routes
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: {
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth is not configured'
      }
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
});

router.get('/google/callback', 
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_not_configured`);
    }
    passport.authenticate('google', { session: false, failureRedirect: '/login' })(req, res, next);
  },
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
      }
      
      // Generate JWT token
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

export default router;
