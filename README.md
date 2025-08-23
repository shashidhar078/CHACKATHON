# ThreadApp - AI-Powered Social Platform

A modern, full-stack social media platform built with MERN stack and AI integration for content moderation and summarization.

## 🚀 Features

### Core Features
- **Thread-based discussions** with real-time updates
- **AI-powered content moderation** using Google Gemini API
- **AI summarization** for long discussions
- **Real-time notifications** with Socket.IO
- **Role-based access control** (User/Admin)
- **Social authentication** (Google & Instagram OAuth)
- **Responsive design** with TailwindCSS

### AI Features
- **Content Moderation**: Automatically flags inappropriate content
- **Smart Summarization**: Generates summaries for threads with 10+ replies
- **Safety First**: Content flagged by AI is hidden from public view

### Admin Features
- **Dashboard**: Overview of platform statistics
- **Content Moderation**: Approve/delete flagged content
- **User Management**: Manage user roles and permissions
- **Real-time Updates**: Live notifications for admin actions

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **Google Gemini API** for AI features
- **Zod** for validation
- **Rate limiting** and security middleware

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **React Query** for state management
- **React Router** for navigation
- **Socket.IO Client** for real-time updates
- **Lucide React** for icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/thread-app
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=http://localhost:3000
   GEMINI_API_KEY=your-gemini-api-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   INSTAGRAM_CLIENT_ID=your-instagram-client-id
   INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
   SESSION_SECRET=your-session-secret
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🎯 Demo Accounts

After running the seed script, you can use these demo accounts:

### Admin Account
- **Email**: admin@threadapp.com
- **Password**: admin123

### User Accounts
- **Email**: alice@example.com
- **Password**: password123

- **Email**: bob@example.com
- **Password**: password123

- **Email**: charlie@example.com
- **Password**: password123

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Threads
- `GET /api/v1/threads` - Get threads with filters
- `POST /api/v1/threads` - Create new thread
- `GET /api/v1/threads/:id` - Get thread with replies
- `POST /api/v1/threads/:id/like` - Like/unlike thread
- `POST /api/v1/threads/:id/summarize` - Generate AI summary
- `DELETE /api/v1/threads/:id` - Delete thread (admin)

### Replies
- `GET /api/v1/replies/thread/:threadId` - Get replies for thread
- `POST /api/v1/replies/:threadId` - Create reply
- `POST /api/v1/replies/:id/like` - Like/unlike reply
- `DELETE /api/v1/replies/:id` - Delete reply (admin)

### Admin
- `GET /api/v1/admin/dashboard` - Get dashboard stats
- `GET /api/v1/admin/threads/flagged` - Get flagged threads
- `GET /api/v1/admin/replies/flagged` - Get flagged replies
- `PATCH /api/v1/admin/threads/:id/approve` - Approve flagged thread
- `PATCH /api/v1/admin/replies/:id/approve` - Approve flagged reply
- `GET /api/v1/admin/users` - Get users list
- `PATCH /api/v1/admin/users/:id/role` - Update user role

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `PATCH /api/v1/notifications/:id/read` - Mark notification as read
- `PATCH /api/v1/notifications/read-all` - Mark all notifications as read
- `GET /api/v1/notifications/unread/count` - Get unread count

## 🔌 Socket.IO Events

### Client → Server
- `join` - Join rooms for real-time updates
- `leave` - Leave rooms

### Server → Client
- `thread:new` - New thread created
- `reply:new` - New reply added
- `thread:like` - Thread like count updated
- `reply:like` - Reply like count updated
- `thread:updated` - Thread updated (e.g., summary added)
- `admin:moderation` - Admin moderation action

## 🎨 UI Components

### Pages
- **Login/Register** - Authentication with OAuth options
- **Home** - Thread listing with filters and search
- **Thread Detail** - Individual thread with replies
- **Admin Dashboard** - Content moderation and user management

### Components
- **ThreadCard** - Display thread in list
- **ReplyCard** - Display reply in thread
- **CreateThreadModal** - Modal for creating threads
- **CreateReplyModal** - Modal for creating replies
- **NotificationBell** - Real-time notifications
- **Navbar** - Navigation with user menu

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** on sensitive endpoints
- **Input Validation** with Zod schemas
- **XSS Protection** with helmet middleware
- **CORS Configuration** for secure cross-origin requests
- **AI Content Moderation** for safety

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Set environment variables
2. Connect MongoDB Atlas
3. Deploy with `npm start`

### Frontend Deployment (Vercel)
1. Set environment variables
2. Build with `npm run build`
3. Deploy to Vercel

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
GEMINI_API_KEY=your-gemini-api-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🎉 Acknowledgments

- **Google Gemini API** for AI capabilities
- **TailwindCSS** for beautiful UI components
- **Socket.IO** for real-time features
- **React Query** for efficient state management

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ for the hackathon community**