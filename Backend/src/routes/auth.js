import express from 'express';
import passport from 'passport';
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
  (req, res) => {
    // Redirect to frontend with token
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  }
);

export default router;
