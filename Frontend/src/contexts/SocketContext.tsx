import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  joinRooms: (rooms: string[]) => void;
  leaveRooms: (rooms: string[]) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token && user) {
      const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
      
      socketRef.current = io(WS_URL, {
        auth: {
          token,
        },
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, user]);

  const joinRoom = (room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join', { rooms: [room] });
    }
  };

  const leaveRoom = (room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave', { rooms: [room] });
    }
  };

  const joinRooms = (rooms: string[]) => {
    if (socketRef.current) {
      socketRef.current.emit('join', { rooms });
    }
  };

  const leaveRooms = (rooms: string[]) => {
    if (socketRef.current) {
      socketRef.current.emit('leave', { rooms });
    }
  };

  const value: SocketContextType = {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    joinRooms,
    leaveRooms,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
