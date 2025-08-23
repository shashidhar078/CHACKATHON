import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 'USER_EXISTS',
          message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
        }
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        badges: user.badges,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Registration failed'
      }
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        badges: user.badges,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Login failed'
      }
    });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        badges: req.user.badges,
        avatarUrl: req.user.avatarUrl,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user data'
      }
    });
  }
};

// OAuth helper functions
export const handleOAuthLogin = async (profile, provider) => {
  try {
    let user = await User.findOne({
      $or: [
        { [`${provider}Id`]: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (!user) {
      // Create new user from OAuth profile
      user = new User({
        username: profile.displayName || profile.username,
        email: profile.emails[0].value,
        [`${provider}Id`]: profile.id,
        avatarUrl: profile.photos?.[0]?.value,
        isEmailVerified: true
      });
      await user.save();
    } else {
      // Update existing user with OAuth info if needed
      if (!user[`${provider}Id`]) {
        user[`${provider}Id`] = profile.id;
        if (profile.photos?.[0]?.value && !user.avatarUrl) {
          user.avatarUrl = profile.photos[0].value;
        }
        await user.save();
      }
    }

    return user;
  } catch (error) {
    console.error(`${provider} OAuth error:`, error);
    throw error;
  }
};
