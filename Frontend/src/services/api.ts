import axios from 'axios';
import { 
  User, 
  Thread, 
  Reply, 
  Notification, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials,
  CreateThreadData,
  CreateReplyData,
  ThreadFilters,
  AdminDashboard,
  PaginatedResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Threads API
export const threadsApi = {
  getThreads: async (filters: ThreadFilters = {}): Promise<PaginatedResponse<Thread>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/threads?${params.toString()}`);
    return response.data;
  },

  getThread: async (id: string): Promise<{ thread: Thread; replies: PaginatedResponse<Reply> }> => {
    const response = await api.get(`/threads/${id}`);
    return response.data;
  },

  createThread: async (data: CreateThreadData): Promise<{ thread: Thread; moderation?: any }> => {
    const response = await api.post('/threads', data);
    return response.data;
  },

  likeThread: async (id: string): Promise<{ likes: number; likedByMe: boolean }> => {
    const response = await api.post(`/threads/${id}/like`, { action: 'toggle' });
    return response.data;
  },

  summarizeThread: async (id: string): Promise<{ summary: string; status: string }> => {
    const response = await api.post(`/threads/${id}/summarize`);
    return response.data;
  },

  deleteThread: async (id: string): Promise<void> => {
    await api.delete(`/threads/${id}`);
  },
};

// Replies API
export const repliesApi = {
  getReplies: async (threadId: string, page = 1, limit = 10, sort = 'newest'): Promise<PaginatedResponse<Reply>> => {
    const response = await api.get(`/replies/thread/${threadId}?page=${page}&limit=${limit}&sort=${sort}`);
    return response.data;
  },

  createReply: async (threadId: string, data: CreateReplyData): Promise<{ reply: Reply; moderation?: any }> => {
    const response = await api.post(`/replies/${threadId}`, data);
    return response.data;
  },

  likeReply: async (id: string): Promise<{ likes: number; likedByMe: boolean }> => {
    const response = await api.post(`/replies/${id}/like`, { action: 'toggle' });
    return response.data;
  },

  deleteReply: async (id: string): Promise<void> => {
    await api.delete(`/replies/${id}`);
  },
};

// Notifications API
export const notificationsApi = {
  getNotifications: async (page = 1, limit = 10): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  markRead: async (id: string): Promise<{ ok: boolean }> => {
    const response = await api.patch(`/notifications/${id}/read`, { read: true });
    return response.data;
  },

  markAllRead: async (): Promise<{ ok: boolean }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getDashboard: async (): Promise<AdminDashboard> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getFlaggedThreads: async (page = 1, limit = 10): Promise<PaginatedResponse<Thread>> => {
    const response = await api.get(`/admin/threads/flagged?page=${page}&limit=${limit}`);
    return response.data;
  },

  getFlaggedReplies: async (page = 1, limit = 10): Promise<PaginatedResponse<Reply>> => {
    const response = await api.get(`/admin/replies/flagged?page=${page}&limit=${limit}`);
    return response.data;
  },

  approveThread: async (id: string): Promise<{ thread: Thread }> => {
    const response = await api.patch(`/admin/threads/${id}/approve`);
    return response.data;
  },

  approveReply: async (id: string): Promise<{ reply: Reply }> => {
    const response = await api.patch(`/admin/replies/${id}/approve`);
    return response.data;
  },

  getUsers: async (page = 1, limit = 10, search = ''): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  updateUserRole: async (id: string, role: 'user' | 'admin'): Promise<{ user: User }> => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },
};

export default api;
