import { useState, useEffect } from 'react';
import api, { threadsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Thread, Reply, User } from '../types';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const threadsRes = await api.get('/profile/threads');
        setThreads(threadsRes.data.threads);

        const repliesRes = await api.get('/profile/replies');
        setReplies(repliesRes.data.replies);
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, []);

  // ...no profile editing logic...

  if (loading) return <div className="py-12 text-center">Loading profile...</div>;

  return (
<<<<<<< HEAD
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">My Threads</h3>
        {threads.length === 0 ? (
          <p className="text-gray-500">No threads posted yet.</p>
        ) : (
          <ul className="space-y-4">
            {threads.map(thread => (
              <li key={thread._id} className="card p-4">
                <Link to={`/thread/${thread._id}`} className="block hover:underline">
                  <h4 className="font-bold text-lg mb-1">{thread.title}</h4>
                </Link>
                <p className="text-gray-700 mb-2">{thread.content}</p>
                {thread.imageUrl && (
                  <img src={thread.imageUrl} alt={thread.imageCaption || 'Thread image'} className="w-full max-w-md rounded-lg mb-2" />
                )}
                <span className="text-sm text-gray-500">{new Date(thread.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Replies Received</h3>
        {replies.length === 0 ? (
          <p className="text-gray-500">No replies received yet.</p>
        ) : (
          <ul className="space-y-4">
            {replies.map(reply => (
              <li key={reply._id} className="card p-4">
                <Link to={`/thread/${reply.threadId}`} className="block hover:underline">
                  <p className="text-gray-700 mb-2">{reply.content}</p>
                </Link>
                <span className="text-sm text-gray-500">By {reply.author.username} on {new Date(reply.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
=======
    <div className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl shadow-glow mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-700 rounded-xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">My Profile</h1>
          <p className="text-textSecondary text-lg max-w-2xl mx-auto">
            Welcome back, {user?.username}! Here's your activity and contributions to the community.
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-glass p-6 text-center hover-lift">
            <div className="p-3 bg-primary-500/20 rounded-xl inline-flex mb-4">
              <BookOpen className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-1">{threads.length}</h3>
            <p className="text-textSecondary">Threads Created</p>
          </div>
          
          <div className="card-glass p-6 text-center hover-lift">
            <div className="p-3 bg-secondary-500/20 rounded-xl inline-flex mb-4">
              <MessageSquare className="w-6 h-6 text-secondary-400" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-1">{replies.length}</h3>
            <p className="text-textSecondary">Replies Received</p>
          </div>
          
          <div className="card-glass p-6 text-center hover-lift">
            <div className="p-3 bg-accent-500/20 rounded-xl inline-flex mb-4">
              <TrendingUp className="w-6 h-6 text-accent-400" />
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-1">
              {threads.reduce((total, thread) => total + thread.likes, 0)}
            </h3>
            <p className="text-textSecondary">Total Likes</p>
          </div>
        </div>

        {/* Threads Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary-400" />
              </div>
              <h2 className="text-2xl font-semibold text-textPrimary">My Threads</h2>
            </div>
            <Link 
              to="/app/create-thread" 
              className="btn btn-primary flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Thread</span>
            </Link>
          </div>
          
          {threads.length === 0 ? (
            <div className="card-glass p-8 text-center">
              <BookOpen className="w-16 h-16 text-textTertiary mx-auto mb-4 opacity-60" />
              <h3 className="text-xl font-medium text-textPrimary mb-2">No threads yet</h3>
              <p className="text-textSecondary mb-6">Start a conversation and share your thoughts with the community</p>
              <Link to="/app/create-thread" className="btn btn-primary">
                Create Your First Thread
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {threads.map(thread => (
                <div key={thread._id} className="card-glass p-6 hover-lift group">
                  <Link to={`/app/thread/${thread._id}`} className="block">
                    <h3 className="font-bold text-lg text-textPrimary mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
                      {thread.title}
                    </h3>
                  </Link>
                  <p className="text-textSecondary mb-4 line-clamp-3">{thread.content}</p>
                  
                  {thread.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={thread.imageUrl} 
                        alt={thread.imageCaption || 'Thread image'} 
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-textTertiary">
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
                        <span>{thread.likes}</span>
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
            <div className="p-2 bg-secondary-500/20 rounded-lg">
              <MessageSquare className="w-6 h-6 text-secondary-400" />
            </div>
            <h2 className="text-2xl font-semibold text-textPrimary">Replies Received</h2>
          </div>
          
          {replies.length === 0 ? (
            <div className="card-glass p-8 text-center">
              <MessageSquare className="w-16 h-16 text-textTertiary mx-auto mb-4 opacity-60" />
              <h3 className="text-xl font-medium text-textPrimary mb-2">No replies yet</h3>
              <p className="text-textSecondary">Your threads haven't received any replies yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map(reply => (
                <div key={reply._id} className="card-glass p-6 hover-lift group">
                  <Link to={`/app/thread/${reply.threadId}`} className="block">
                    <p className="text-textSecondary mb-4 group-hover:text-primary-400 transition-colors line-clamp-3">
                      "{reply.content}"
                    </p>
                  </Link>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {reply.author.avatarUrl ? (
                          <img
                            src={reply.author.avatarUrl}
                            alt={reply.author.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span className="text-textSecondary">By {reply.author.username}</span>
                      </div>
                    </div>
                    <span className="text-sm text-textTertiary flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(reply.createdAt)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
>>>>>>> c92f2155227e3b426e702c1585da66e573e8ba7b
      </div>
    </div>
  );
};

export default Profile;
