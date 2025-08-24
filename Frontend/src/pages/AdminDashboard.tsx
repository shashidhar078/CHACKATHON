import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Flag, CheckCircle, Trash2, Search, Shield, BarChart3, AlertTriangle } from 'lucide-react';
import { adminApi } from '../services/api';
import { Thread, Reply, User } from '../types';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'flagged-threads' | 'flagged-replies' | 'users'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: dashboardData } = useQuery('adminDashboard', adminApi.getDashboard);
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
                            to={`/admin/thread/${thread._id}`}
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;