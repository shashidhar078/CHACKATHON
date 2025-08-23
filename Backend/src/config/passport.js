import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import { handleOAuthLogin } from '../controllers/authController.js';

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/v1/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthLogin(profile, 'google');
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

export default passport;
