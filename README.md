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

### 📊 Real-Time Analytics with Spark & Kafka
- **Event Streaming**: Every user action (thread create, reply, like, moderation) is published to Kafka
- **Real-Time Analytics**: Apache Spark processes event streams to generate insights
- **Trend Analysis**: Event type trends, topic trends, moderation patterns, and user activity tracking
- **Admin Insights**: Admins see real-time platform statistics without impacting user experience
- **Scalable Pipeline**: Handles millions of events with distributed processing

**[📖 Read Full Spark & Kafka Explanation](./SPARK_KAFKA_EXPLAINED.md)** - Complete guide for understanding how the analytics pipeline works (designed for beginners!)

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **Google Gemini API** for AI features
- **Zod** for validation
- **Rate limiting** and security middleware
- **Kafka** for event streaming
- **KafkaJS** client for publishing analytics events

### Analytics & Streaming
- **Apache Kafka** (7.5.3) - Distributed event streaming platform
- **Apache Spark** (3.5.1) - Distributed stream processing engine
- **Zookeeper** - Kafka cluster coordination
- **Docker** - Containerized services
- **Kafka-UI** - Web interface for monitoring Kafka topics

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

### Analytics Stack Setup (Optional - for Real-Time Analytics)

To enable the Spark + Kafka analytics pipeline:

1. **Install Docker** (if not already installed)
   - Download from [docker.com](https://www.docker.com)

2. **Start Kafka + Spark stack from project root:**
   ```bash
   docker compose -f docker-compose.streaming.yml up -d
   ```

3. **Verify services:**
   - Kafka UI: http://localhost:8085 (monitor event topics)
   - Spark Master: http://localhost:8080 (monitor spark jobs)

4. **Enable Kafka in Backend** - Update `.env`:
   ```env
   KAFKA_ENABLED=true
   KAFKA_BROKERS=localhost:9092
   KAFKA_CLIENT_ID=thread-app-backend
   KAFKA_TOPIC=threadapp.events
   SPARK_ANALYTICS_ENABLED=true
   SPARK_ANALYTICS_OUTPUT_DIR=/workspace/analytics/output
   ```

5. **Analytics will automatically:**
   - Collect events when users interact with the platform
   - Process streams every 5 minutes
   - Store results in `analytics/output/`
   - Display in Admin Dashboard

**Note:** Analytics stack is optional. The app works perfectly without it.

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
- `GET /api/v1/admin/analytics/streaming` - **[NEW]** Get real-time Spark analytics (event trends, topic trends, moderation patterns, user activity)

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

## � Analytics Pipeline Architecture

### How Real-Time Analytics Works

```
User Actions (create/like/reply)
    ↓
Backend processes & saves to MongoDB
    ↓
Event published to Kafka Topic
    ↓
Kafka (Event Queue) - stores reliably
    ↓
Spark reads & analyzes every 5 minutes
    ↓
Results written to JSON files
    ↓
Backend reads results & serves to Admin Dashboard
    ↓
Admins see real-time trends (without impacting user experience)
```

### Event Types Tracked

The system automatically captures analytics events for:
- User registration and login
- Thread creation, deletion, flagging
- Replies creation and moderation
- Likes and unlikes
- Admin actions (approvals, deletions)
- User role changes and blocking

### Analytics Outputs

The Spark job generates 6 types of analytics:

1. **Event Type Trends** - Which actions are most common (5-min windows)
2. **Topic Trends** - Which topics are most active
3. **Moderation Trends** - Flagged vs approved content
4. **User Activity Trends** - User behavior patterns
5. **Recent Events** - Latest 1000 actions for real-time view
6. **Pipeline Metrics** - System health and throughput

### Benefits

- ✅ **Non-Blocking**: Analytics don't slow down user experience
- ✅ **Real-Time**: Admins see trends within seconds
- ✅ **Scalable**: Handles millions of events efficiently
- ✅ **Resilient**: Survives service restarts and failures
- ✅ **Decoupled**: Analytics logic separate from app logic

**For detailed explanation**: Read [SPARK_KAFKA_EXPLAINED.md](./SPARK_KAFKA_EXPLAINED.md)

## �🚀 Deployment

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