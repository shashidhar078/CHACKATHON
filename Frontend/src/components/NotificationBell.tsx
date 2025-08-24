import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Sparkles, MessageSquare, Users, Shield, Clock } from 'lucide-react';
import { useQuery } from 'react-query';
import { notificationsApi } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket();

  const { data: unreadCount, refetch: refetchUnread } = useQuery(
    'unreadNotifications',
    () => notificationsApi.getUnreadCount(),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: notifications, refetch: refetchNotifications } = useQuery(
    ['notifications', isOpen],
    () => notificationsApi.getNotifications(1, 10),
    {
      enabled: isOpen,
    }
  );

  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    socket.on('thread:new', (data) => {
      toast.success(`New thread: ${data.thread.title}`);
      refetchUnread();
    });

    socket.on('reply:new', (data) => {
      toast.success(`New reply in thread`);
      refetchUnread();
    });

    socket.on('admin:moderation', (data) => {
      toast.success(`Content ${data.action}: ${data.type}`);
      refetchUnread();
    });

    return () => {
      socket.off('thread:new');
      socket.off('reply:new');
      socket.off('admin:moderation');
    };
  }, [socket, refetchUnread]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      refetchUnread();
      refetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      refetchUnread();
      refetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'thread':
        return <MessageSquare className="w-4 h-4 text-primary-400" />;
      case 'reply':
        return <Users className="w-4 h-4 text-secondary-400" />;
      case 'moderation':
        return <Shield className="w-4 h-4 text-accent-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-textTertiary" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-textTertiary hover:text-textPrimary focus:outline-none transition-colors duration-200 hover:bg-surfaceElevated rounded-lg"
      >
        <Bell className="w-5 h-5" />
        {unreadCount?.count && unreadCount.count > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-surface">
            {unreadCount.count > 9 ? '9+' : unreadCount.count}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-surfaceElevated rounded-xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto border border-border">
          <div className="px-4 py-3 border-b border-border flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-primary-500/20 rounded-lg">
                <Bell className="w-4 h-4 text-primary-400" />
              </div>
              <h3 className="text-sm font-medium text-textPrimary">Notifications</h3>
            </div>
            {unreadCount?.count && unreadCount.count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors duration-200 flex items-center space-x-1"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
          
          {notifications?.items && notifications.items.length > 0 ? (
            <div className="py-1">
              {notifications.items.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 hover:bg-surface cursor-pointer transition-colors duration-200 border-b border-border last:border-b-0 ${
                    !notification.read ? 'bg-primary-500/10' : ''
                  }`}
                  onClick={() => handleMarkRead(notification._id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-surface rounded-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-textPrimary">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-400 rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-textSecondary mt-1">
                        {notification.body}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-textTertiary">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="p-3 bg-surface rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Bell className="w-6 h-6 text-textTertiary" />
              </div>
              <p className="text-sm text-textSecondary">No notifications</p>
              <p className="text-xs text-textTertiary mt-1">We'll notify you when something arrives</p>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;