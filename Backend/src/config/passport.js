import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import InstagramStrategy from 'passport-instagram';
import { handleOAuthLogin } from '../controllers/authController.js';

// Google OAuth Strategy
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

// Instagram OAuth Strategy
passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  callbackURL: '/api/v1/auth/instagram/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await handleOAuthLogin(profile, 'instagram');
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

export default passport;
