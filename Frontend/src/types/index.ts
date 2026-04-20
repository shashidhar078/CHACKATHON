export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  badges: string[];
  avatarUrl?: string;
  bio?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  blockedBy?: string;
  blockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  _id: string;
  title: string;
  content: string;
  topic: string;
  imageUrl?: string;
  imageCaption?: string;
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
  parentReplyId?: string; // For nested replies
  parentReplyAuthor?: string; // Username of parent reply author
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
  emojiReactions?: {
    [emoji: string]: number; // emoji: count
  };
  replyCount?: number; // Number of nested replies
  depth?: number; // Nesting depth
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
  imageUrl?: string;
  imageCaption?: string;
}

export interface CreateReplyData {
  content: string;
  parentReplyId?: string; // For nested replies
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

export interface StreamTrendPoint {
  window_start: string;
  window_end: string;
  eventType?: string;
  topic?: string;
  moderationStatus?: string;
  eventCount: number;
}

export interface StreamingAnalytics {
  runtime: {
    sparkEnabled: boolean;
    kafkaEnabled: boolean;
    kafkaTopic: string;
    kafkaBrokers: string[];
    outputDirectory: string;
    lastProcessedAt: string | null;
  };
  trends: {
    eventType: StreamTrendPoint[];
    topic: StreamTrendPoint[];
    moderation: StreamTrendPoint[];
  };
  events: {
    recent: Array<{
      eventId: string;
      eventType: string;
      timestamp: string;
      userId?: string;
      userRole?: string;
      entityType?: string;
      entityId?: string;
      topic?: string;
      status?: string;
    }>;
  };
  contributors: {
    activeUsers: Array<{
      window_start: string;
      window_end: string;
      userId: string;
      userRole: string;
      eventType: string;
      eventCount: number;
    }>;
  };
  kafka: {
    connected: boolean;
    error?: string;
    topics: Array<{
      name: string;
      partitions: number;
      partitionIds: number[];
      leaderIds: number[];
    }>;
  };
  pipeline: {
    processingTime: string | null;
    totalEventsInBatch: number;
    distinctEventTypes: number;
    distinctTopics: number;
  };
}
