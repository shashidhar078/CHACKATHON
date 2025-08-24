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
      </div>
    </div>
  );
};

export default Profile;
