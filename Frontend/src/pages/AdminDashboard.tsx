import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Users, MessageSquare, Flag, CheckCircle, Trash2, Search, Shield, BarChart3, AlertTriangle,
  TrendingUp, TrendingDown, Activity, Eye, Clock, UserPlus, MessageCircle, Zap
} from 'lucide-react';
import { adminApi } from '../services/api';
import { Thread, Reply, User } from '../types';
import toast from 'react-hot-toast';
import AnalyticsCharts from '../components/charts/AnalyticsCharts';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'flagged-threads' | 'flagged-replies' | 'users' | 'analytics'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [analyticsData, setAnalyticsData] = useState<{
    totalUsers: number;
    totalThreads: number;
    totalReplies: number;
    activeUsers: number;
    newUsersToday: number;
    newThreadsToday: number;
    newRepliesToday: number;
    flaggedContent: number;
    userGrowth: number;
    threadGrowth: number;
    replyGrowth: number;
    topUsers: Array<{ username: string; threads: number; replies: number }>;
    recentActivity: Array<{ type: string; user: string; content: string; timestamp: string }>;
  }>({
    totalUsers: 0,
    totalThreads: 0,
    totalReplies: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newThreadsToday: 0,
    newRepliesToday: 0,
    flaggedContent: 0,
    userGrowth: 0,
    threadGrowth: 0,
    replyGrowth: 0,
    topUsers: [],
    recentActivity: []
  });
  const queryClient = useQueryClient();

  const { data: dashboardData } = useQuery('adminDashboard', adminApi.getDashboard);
  
  // Analytics data query
  const { data: analyticsDataQuery } = useQuery(
    'analyticsData',
    adminApi.getAnalytics,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      onSuccess: (data: any) => {
        setAnalyticsData(data);
      }
    }
  );
  const { data: flaggedThreads, error: flaggedThreadsError } = useQuery(
    ['flaggedThreads', activeTab],
    () => adminApi.getFlaggedThreads(),
    { 
      enabled: activeTab === 'flagged-threads',
      onError: (error: any) => {
        console.error('Flagged threads error:', error);
        toast.error('Failed to load flagged threads');
      }
    }
  );
  const { data: flaggedReplies, error: flaggedRepliesError } = useQuery(
    ['flaggedReplies', activeTab],
    () => adminApi.getFlaggedReplies(),
    { 
      enabled: activeTab === 'flagged-replies',
      onError: (error: any) => {
        console.error('Flagged replies error:', error);
        toast.error('Failed to load flagged replies');
      }
    }
  );
  const { data: usersData } = useQuery(
    ['users', userSearch],
    () => adminApi.getUsers(1, 20, userSearch),
    { enabled: activeTab === 'users' }
  );

  const approveThreadMutation = useMutation(
    (id: string) => adminApi.approveThread(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['flaggedThreads']);
        queryClient.invalidateQueries(['adminDashboard']);
        toast.success('Thread approved successfully');
      },
    }
  );

  const approveReplyMutation = useMutation(
    (id: string) => adminApi.approveReply(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['flaggedReplies']);
        queryClient.invalidateQueries(['adminDashboard']);
        toast.success('Reply approved successfully');
      },
    }
  );

  const deleteThreadMutation = useMutation(
    (id: string) => adminApi.deleteThread(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['flaggedThreads']);
        queryClient.invalidateQueries(['adminDashboard']);
        toast.success('Thread deleted successfully');
      },
    }
  );

  const deleteReplyMutation = useMutation(
    (id: string) => adminApi.deleteReply(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['flaggedReplies']);
        queryClient.invalidateQueries(['adminDashboard']);
        toast.success('Reply deleted successfully');
      },
    }
  );

  const updateUserRoleMutation = useMutation(
    ({ id, role }: { id: string; role: 'user' | 'admin' }) => adminApi.updateUserRole(id, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('User role updated successfully');
      },
    }
  );

  const blockUserMutation = useMutation(
    ({ id, reason }: { id: string; reason: string }) => adminApi.blockUser(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('User blocked successfully');
      },
    }
  );

  const unblockUserMutation = useMutation(
    (id: string) => adminApi.unblockUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('User unblocked successfully');
      },
    }
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'flagged-threads', label: 'Flagged Threads', icon: Flag },
    { id: 'flagged-replies', label: 'Flagged Replies', icon: AlertTriangle },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-neon-blue" />
            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          </div>
          <p className="text-textSecondary">Manage content and users with administrative privileges</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-neon-blue text-neon-blue'
                      : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-borderHover'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-glass p-6 hover-lift">
                <div className="flex items-center">
                  <div className="p-3 bg-neon-blue/20 rounded-xl">
                    <Users className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-textSecondary">Total Users</p>
                    <p className="text-2xl font-semibold text-textPrimary">{dashboardData.users}</p>
                  </div>
                </div>
              </div>

              <div className="card-glass p-6 hover-lift">
                <div className="flex items-center">
                  <div className="p-3 bg-primary-500/20 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-textSecondary">Total Threads</p>
                    <p className="text-2xl font-semibold text-textPrimary">{dashboardData.threads}</p>
                  </div>
                </div>
              </div>

              <div className="card-glass p-6 hover-lift">
                <div className="flex items-center">
                  <div className="p-3 bg-secondary-500/20 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-secondary-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-textSecondary">Total Replies</p>
                    <p className="text-2xl font-semibold text-textPrimary">{dashboardData.replies}</p>
                  </div>
                </div>
              </div>

              <div className="card-glass p-6 hover-lift">
                <div className="flex items-center">
                  <div className="p-3 bg-accent-500/20 rounded-xl">
                    <Flag className="w-6 h-6 text-accent-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-textSecondary">Flagged Content</p>
                    <p className="text-2xl font-semibold text-textPrimary">
                      {dashboardData.flagged.threads + dashboardData.flagged.replies}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flagged Threads Tab */}
          {activeTab === 'flagged-threads' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-textPrimary">Flagged Threads</h2>
              {flaggedThreadsError && (
                <div className="card-glass text-center py-12">
                  <Flag className="w-16 h-16 text-accent-400 mx-auto mb-4" />
                  <p className="text-accent-400">Error loading flagged threads</p>
                  <p className="text-sm text-textSecondary mt-2">
                    Error occurred while loading flagged threads
                  </p>
                </div>
              )}
              {flaggedThreads?.items && flaggedThreads.items.length > 0 ? (
                flaggedThreads.items.map((thread: Thread) => (
                  <div key={thread._id} className="card-glass p-6 hover-lift">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-textPrimary mb-2">
                          <Link
                            to={`/app/admin/thread/${thread._id}`}
                            className="hover:text-neon-blue transition-colors"
                          >
                            {thread.title}
                          </Link>
                        </h3>
                        <p className="text-textSecondary mb-3">{thread.content.substring(0, 200)}...</p>
                        <div className="flex items-center space-x-4 text-sm text-textTertiary">
                          <span>By: {thread.author.username}</span>
                          <span>Topic: {thread.topic}</span>
                          {thread.moderation?.reason && (
                            <span className="text-accent-400">Reason: {thread.moderation.reason}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={() => approveThreadMutation.mutate(thread._id)}
                          disabled={approveThreadMutation.isLoading}
                          className="btn btn-secondary flex items-center space-x-2 px-4 py-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => deleteThreadMutation.mutate(thread._id)}
                          disabled={deleteThreadMutation.isLoading}
                          className="btn btn-accent flex items-center space-x-2 px-4 py-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-glass text-center py-12">
                  <Flag className="w-16 h-16 text-textTertiary mx-auto mb-4" />
                  <p className="text-textSecondary">No flagged threads found</p>
                </div>
              )}
            </div>
          )}

          {/* Flagged Replies Tab */}
          {activeTab === 'flagged-replies' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-textPrimary">Flagged Replies</h2>
              {flaggedRepliesError && (
                <div className="card-glass text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-accent-400 mx-auto mb-4" />
                  <p className="text-accent-400">Error loading flagged replies</p>
                  <p className="text-sm text-textSecondary mt-2">
                    Error occurred while loading flagged replies
                  </p>
                </div>
              )}
              {flaggedReplies?.items && flaggedReplies.items.length > 0 ? (
                flaggedReplies.items.map((reply: Reply) => (
                  <div key={reply._id} className="card-glass p-6 hover-lift">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-textSecondary mb-3">{reply.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-textTertiary">
                          <span>By: {reply.author.username}</span>
                          <span>Thread: {typeof reply.threadId === 'object' ? (reply.threadId as any).title : reply.threadId}</span>
                          {reply.moderation?.reason && (
                            <span className="text-accent-400">Reason: {reply.moderation.reason}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={() => approveReplyMutation.mutate(reply._id)}
                          disabled={approveReplyMutation.isLoading}
                          className="btn btn-secondary flex items-center space-x-2 px-4 py-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => deleteReplyMutation.mutate(reply._id)}
                          disabled={deleteReplyMutation.isLoading}
                          className="btn btn-accent flex items-center space-x-2 px-4 py-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-glass text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-textTertiary mx-auto mb-4" />
                  <p className="text-textSecondary">No flagged replies found</p>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-textPrimary">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textTertiary w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="input pl-10 w-64 bg-surfaceElevated"
                  />
                </div>
              </div>

              {usersData?.items && usersData.items.length > 0 ? (
                <div className="overflow-x-auto card-glass p-6">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-surfaceElevated">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {usersData.items.map((user: User) => (
                        <tr key={user._id} className="hover:bg-surfaceElevated/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.username}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-textPrimary">
                                  {user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge ${user.role === 'admin' ? 'badge-secondary' : 'badge-primary'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isBlocked ? (
                              <span className="badge badge-accent">
                                Blocked
                              </span>
                            ) : (
                              <span className="badge badge-success">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRoleMutation.mutate({
                                  id: user._id,
                                  role: e.target.value as 'user' | 'admin'
                                })}
                                className="input text-sm bg-surface border-border"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              
                              {!user.isBlocked ? (
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter reason for blocking user:');
                                    if (reason) {
                                      blockUserMutation.mutate({ id: user._id, reason });
                                    }
                                  }}
                                  className="btn btn-accent text-xs px-3 py-2"
                                  disabled={user.role === 'admin'}
                                >
                                  Block
                                </button>
                              ) : (
                                <button
                                  onClick={() => unblockUserMutation.mutate(user._id)}
                                  className="btn btn-secondary text-xs px-3 py-2"
                                >
                                  Unblock
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card-glass text-center py-12">
                  <Users className="w-16 h-16 text-textTertiary mx-auto mb-4" />
                  <p className="text-textSecondary">No users found</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold gradient-text">Real-Time Analytics</h2>
                <div className="flex items-center space-x-2 text-sm text-textSecondary">
                  <Activity className="w-4 h-4 animate-pulse text-green-400" />
                  <span>Live Data • Updates every 30s</span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="card-glass p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-textSecondary">Total Users</p>
                      <p className="text-3xl font-bold text-textPrimary">{analyticsData.totalUsers}</p>
                      <div className="flex items-center mt-2">
                        {analyticsData.userGrowth >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm ${analyticsData.userGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.abs(analyticsData.userGrowth)}% from yesterday
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-neon-blue/20 rounded-xl">
                      <Users className="w-8 h-8 text-neon-blue" />
                    </div>
                  </div>
                </div>

                {/* Total Threads */}
                <div className="card-glass p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-textSecondary">Total Threads</p>
                      <p className="text-3xl font-bold text-textPrimary">{analyticsData.totalThreads}</p>
                      <div className="flex items-center mt-2">
                        {analyticsData.threadGrowth >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm ${analyticsData.threadGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.abs(analyticsData.threadGrowth)}% from yesterday
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-primary-500/20 rounded-xl">
                      <MessageSquare className="w-8 h-8 text-primary-400" />
                    </div>
                  </div>
                </div>

                {/* Total Replies */}
                <div className="card-glass p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-textSecondary">Total Replies</p>
                      <p className="text-3xl font-bold text-textPrimary">{analyticsData.totalReplies}</p>
                      <div className="flex items-center mt-2">
                        {analyticsData.replyGrowth >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm ${analyticsData.replyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.abs(analyticsData.replyGrowth)}% from yesterday
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-secondary-500/20 rounded-xl">
                      <MessageCircle className="w-8 h-8 text-secondary-400" />
                    </div>
                  </div>
                </div>

                {/* Active Users */}
                <div className="card-glass p-6 hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-textSecondary">Active Users</p>
                      <p className="text-3xl font-bold text-textPrimary">{analyticsData.activeUsers}</p>
                      <p className="text-sm text-textSecondary mt-2">Currently online</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <Activity className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Charts */}
              <AnalyticsCharts data={analyticsData} />

              {/* Today's Activity Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-glass p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-textPrimary">Today's Activity</h3>
                    <Clock className="w-5 h-5 text-textSecondary" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserPlus className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-sm text-textSecondary">New Users</span>
                      </div>
                      <span className="text-lg font-semibold text-textPrimary">{analyticsData.newUsersToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-sm text-textSecondary">New Threads</span>
                      </div>
                      <span className="text-lg font-semibold text-textPrimary">{analyticsData.newThreadsToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-sm text-textSecondary">New Replies</span>
                      </div>
                      <span className="text-lg font-semibold text-textPrimary">{analyticsData.newRepliesToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Flag className="w-4 h-4 text-red-400 mr-2" />
                        <span className="text-sm text-textSecondary">Flagged Content</span>
                      </div>
                      <span className="text-lg font-semibold text-textPrimary">{analyticsData.flaggedContent}</span>
                    </div>
                  </div>
                </div>

                {/* Top Users */}
                <div className="card-glass p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-textPrimary">Top Contributors</h3>
                    <Zap className="w-5 h-5 text-textSecondary" />
                  </div>
                  <div className="space-y-3">
                    {analyticsData.topUsers.slice(0, 5).map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-sm font-medium text-textPrimary">{user.username}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-textSecondary">{user.threads} threads</div>
                          <div className="text-xs text-textSecondary">{user.replies} replies</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card-glass p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-textPrimary">Recent Activity</h3>
                    <Activity className="w-5 h-5 text-textSecondary" />
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {analyticsData.recentActivity.slice(0, 8).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-textPrimary">
                            <span className="font-medium">{activity.user}</span>
                            <span className="text-textSecondary"> {activity.content}</span>
                          </p>
                          <p className="text-xs text-textTertiary mt-1">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;