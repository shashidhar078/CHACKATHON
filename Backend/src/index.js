import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import passport from './config/passport.js';

import connectDB from './config/database.js';
import { apiRateLimit } from './middleware/rateLimit.js';

// Import routes
import authRoutes from './routes/auth.js';
import threadRoutes from './routes/threads.js';
import replyRoutes from './routes/replies.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import testRoutes from './routes/test.js';
import uploadRoutes from './routes/upload.js';
import profileRoutes from './routes/profile.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimit);

// Session and Passport middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());

// Add io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/threads', threadRoutes);
app.use('/api/v1/replies', replyRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/profile', profileRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Socket.IO authentication and event handling
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = (await import('./models/User.js')).default;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join user's personal room for notifications
  socket.join(`user:${socket.userId}`);

  // Handle room joining
  socket.on('join', (data) => {
    if (data.rooms && Array.isArray(data.rooms)) {
      data.rooms.forEach(room => {
        socket.join(room);
      });
    }
  });

  // Handle room leaving
  socket.on('leave', (data) => {
    if (data.rooms && Array.isArray(data.rooms)) {
      data.rooms.forEach(room => {
        socket.leave(room);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: Object.values(err.errors).map(e => e.message)
      }
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'Invalid ID format'
      }
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
