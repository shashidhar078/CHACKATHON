import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Thread, Reply } from '../types';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, Clock, User as UserIcon, Sparkles, TrendingUp, BookOpen, Award } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const threadsRes = await api.get('/profile/threads');
        setThreads(threadsRes.data.threads || []);

        const repliesRes = await api.get('/profile/replies');
        setReplies(repliesRes.data.replies || []);
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin h-10 w-10 border-4 border-t-blue-500 border-gray-200 rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4 text-lg">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-md mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            My Profile
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Welcome back, {user?.username}! Here's your activity and contributions to the community.
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="p-3 bg-blue-100 rounded-xl inline-flex mb-4">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{threads.length}</h3>
            <p className="text-gray-600">Threads Created</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="p-3 bg-purple-100 rounded-xl inline-flex mb-4">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{replies.length}</h3>
            <p className="text-gray-600">Replies Received</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="p-3 bg-green-100 rounded-xl inline-flex mb-4">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {threads.reduce((total, thread) => total + (thread.likes || 0), 0)}
            </h3>
            <p className="text-gray-600">Total Likes</p>
          </div>
        </div>

        {/* Threads Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">My Threads</h2>
            </div>
            <Link 
              to="/app/create-thread" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Thread</span>
            </Link>
          </div>
          
          {threads.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No threads yet</h3>
              <p className="text-gray-600 mb-6">Start a conversation and share your thoughts with the community</p>
              <Link to="/app/create-thread" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Create Your First Thread
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {threads.map(thread => (
                <div key={thread._id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <Link to={`/app/thread/${thread._id}`} className="block">
                    <h3 className="font-bold text-lg text-gray-800 mb-3 group-hover:text-blue-500 transition-colors line-clamp-2">
                      {thread.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-3">{thread.content}</p>
                  
                  {thread.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={thread.imageUrl} 
                        alt={thread.imageCaption || 'Thread image'} 
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(thread.createdAt)}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{thread.replyCount || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{thread.likes || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Replies Section */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Replies Received</h2>
          </div>
          
          {replies.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No replies yet</h3>
              <p className="text-gray-600">Your threads haven't received any replies yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map(reply => (
                <div key={reply._id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <Link to={`/app/thread/${reply.threadId}`} className="block">
                    <p className="text-gray-600 mb-4 group-hover:text-blue-500 transition-colors line-clamp-3">
                      "{reply.content}"
                    </p>
                  </Link>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {reply.author?.avatarUrl ? (
                          <img
                            src={reply.author.avatarUrl}
                            alt={reply.author.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span className="text-gray-600">By {reply.author?.username || 'Unknown'}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(reply.createdAt)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;