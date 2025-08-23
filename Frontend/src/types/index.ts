export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  badges: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  _id: string;
  title: string;
  content: string;
  topic: string;
  author: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  likes: number;
  likedByMe: boolean;
  status: 'approved' | 'flagged';
  summary?: string;
  replyCount: number;
  moderation?: {
    status: 'Safe' | 'Flagged' | 'Skipped';
    reason?: string;
    confidence?: number;
    reviewedByAdmin?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  _id: string;
  threadId: string;
  content: string;
  author: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  likes: number;
  likedByMe: boolean;
  status: 'approved' | 'flagged';
  moderation?: {
    status: 'Safe' | 'Flagged' | 'Skipped';
    reason?: string;
    confidence?: number;
    reviewedByAdmin?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: 'thread:new' | 'reply:new' | 'admin:moderation';
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface CreateThreadData {
  title: string;
  content: string;
  topic: string;
}

export interface CreateReplyData {
  content: string;
}

export interface ThreadFilters {
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'popular';
}

export interface AdminDashboard {
  users: number;
  threads: number;
  replies: number;
  flagged: {
    threads: number;
    replies: number;
  };
}
