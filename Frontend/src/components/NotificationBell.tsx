import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount?.count && unreadCount.count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount.count > 9 ? '9+' : unreadCount.count}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            {unreadCount?.count && unreadCount.count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Mark all read
              </button>
            )}
          </div>
          
          {notifications?.items && notifications.items.length > 0 ? (
            <div className="py-1">
              {notifications.items.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleMarkRead(notification._id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.body}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications</p>
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
