import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Users, MessageSquare, Flag, CheckCircle, Trash2, Search } from 'lucide-react';
import { adminApi } from '../services/api';
import { Thread, Reply, User } from '../types';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'flagged-threads' | 'flagged-replies' | 'users'>('overview');
  const [userSearch, setUserSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: dashboardData } = useQuery('adminDashboard', adminApi.getDashboard);
  const { data: flaggedThreads } = useQuery(
    ['flaggedThreads', activeTab],
    () => adminApi.getFlaggedThreads(),
    { enabled: activeTab === 'flagged-threads' }
  );
  const { data: flaggedReplies } = useQuery(
    ['flaggedReplies', activeTab],
    () => adminApi.getFlaggedReplies(),
    { enabled: activeTab === 'flagged-replies' }
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'flagged-threads', label: 'Flagged Threads', icon: Flag },
    { id: 'flagged-replies', label: 'Flagged Replies', icon: Flag },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage content and users</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.users}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Threads</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.threads}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Replies</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardData.replies}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Flag className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Flagged Content</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.flagged.threads + dashboardData.flagged.replies}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flagged Threads Tab */}
        {activeTab === 'flagged-threads' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Flagged Threads</h2>
            {flaggedThreads?.items && flaggedThreads.items.length > 0 ? (
              flaggedThreads.items.map((thread: Thread) => (
                <div key={thread._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{thread.title}</h3>
                      <p className="text-gray-600 mb-2">{thread.content.substring(0, 200)}...</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By: {thread.author.username}</span>
                        <span>Topic: {thread.topic}</span>
                        {thread.moderation?.reason && (
                          <span className="text-red-600">Reason: {thread.moderation.reason}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => approveThreadMutation.mutate(thread._id)}
                        disabled={approveThreadMutation.isLoading}
                        className="btn btn-secondary flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => deleteThreadMutation.mutate(thread._id)}
                        disabled={deleteThreadMutation.isLoading}
                        className="btn btn-danger flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No flagged threads found</p>
              </div>
            )}
          </div>
        )}

        {/* Flagged Replies Tab */}
        {activeTab === 'flagged-replies' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Flagged Replies</h2>
            {flaggedReplies?.items && flaggedReplies.items.length > 0 ? (
              flaggedReplies.items.map((reply: Reply) => (
                <div key={reply._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-600 mb-2">{reply.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By: {reply.author.username}</span>
                        <span>Thread: {reply.threadId}</span>
                        {reply.moderation?.reason && (
                          <span className="text-red-600">Reason: {reply.moderation.reason}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => approveReplyMutation.mutate(reply._id)}
                        disabled={approveReplyMutation.isLoading}
                        className="btn btn-secondary flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => deleteReplyMutation.mutate(reply._id)}
                        disabled={deleteReplyMutation.isLoading}
                        className="btn btn-danger flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No flagged replies found</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Users</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="input pl-10 w-64"
                />
              </div>
            </div>

            {usersData?.items && usersData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersData.items.map((user: User) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRoleMutation.mutate({
                              id: user._id,
                              role: e.target.value as 'user' | 'admin'
                            })}
                            className="input text-sm"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
