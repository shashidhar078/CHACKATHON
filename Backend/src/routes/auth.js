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
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Redirect to frontend with token
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  }
);

router.get('/instagram', passport.authenticate('instagram'));
router.get('/instagram/callback',
  passport.authenticate('instagram', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Redirect to frontend with token
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  }
);

export default router;
