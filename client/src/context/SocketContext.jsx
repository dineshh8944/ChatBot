import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'https://chatbot-isxy.onrender.com';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingMap, setTypingMap] = useState({});

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const userId = user.id || user._id;

    const socketInstance = io(SOCKET_SERVER_URL, {
      query: { userId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('Connected to QuickChat Socket Server ID:', socketInstance.id);
      socketInstance.emit('join_chat', userId);
    });

    socketInstance.on('get_online_users', (users) => {
      setOnlineUsers(users);
    });

    socketInstance.on('user_typing', ({ senderId }) => {
      setTypingMap((prev) => ({ ...prev, [senderId]: true }));
    });

    socketInstance.on('user_stop_typing', ({ senderId }) => {
      setTypingMap((prev) => ({ ...prev, [senderId]: false }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const emitTyping = (receiverId) => {
    if (socket && user) {
      const senderId = user.id || user._id;
      socket.emit('typing', { senderId, receiverId });
    }
  };

  const emitStopTyping = (receiverId) => {
    if (socket && user) {
      const senderId = user.id || user._id;
      socket.emit('stop_typing', { senderId, receiverId });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, typingMap, emitTyping, emitStopTyping }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
