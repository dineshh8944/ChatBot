const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { memoryStore } = require('../config/db');

// Map to track connected users: userId -> Set of socketIds
const onlineUsers = new Map();

const getOnlineUserIds = () => {
  return Array.from(onlineUsers.keys());
};

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== 'undefined') {
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      socket.userId = userId;

      // Update user online status in database
      if (memoryStore.isInMemory) {
        const u = memoryStore.users.find((user) => user._id.toString() === userId);
        if (u) {
          u.isOnline = true;
          u.lastSeen = new Date();
        }
      } else {
        User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }).catch((err) =>
          console.error('Socket DB status update error:', err.message)
        );
      }

      console.log(`[Socket] User connected: ${userId} (Socket ID: ${socket.id})`);

      // Broadcast updated online users list to all clients
      io.emit('get_online_users', getOnlineUserIds());
    }

    // Join a specific personal user room
    socket.on('join_chat', (roomUserId) => {
      socket.join(roomUserId);
      console.log(`[Socket] User ${socket.id} joined user room: ${roomUserId}`);
    });

    // Real-time message handler
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, text, image } = data;

        if (!senderId || !receiverId || (!text && !image)) {
          return socket.emit('error_message', { message: 'Invalid message payload' });
        }

        let savedMessage;

        if (memoryStore.isInMemory) {
          const msgId = new mongoose.Types.ObjectId().toString();
          savedMessage = {
            _id: msgId,
            id: msgId,
            senderId,
            receiverId,
            text: text || '',
            image: image || '',
            readStatus: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          memoryStore.messages.push(savedMessage);
        } else {
          const newMsg = await Message.create({
            senderId,
            receiverId,
            text: text || '',
            image: image || '',
            readStatus: false
          });
          savedMessage = {
            id: newMsg._id,
            _id: newMsg._id,
            senderId: newMsg.senderId,
            receiverId: newMsg.receiverId,
            text: newMsg.text,
            image: newMsg.image,
            readStatus: newMsg.readStatus,
            createdAt: newMsg.createdAt
          };
        }

        // Send to receiver if online
        const receiverSockets = onlineUsers.get(receiverId);
        if (receiverSockets && receiverSockets.size > 0) {
          receiverSockets.forEach((socketId) => {
            io.to(socketId).emit('receive_message', savedMessage);
          });
        }

        // Send back to sender for instant UI append confirmation
        const senderSockets = onlineUsers.get(senderId);
        if (senderSockets && senderSockets.size > 0) {
          senderSockets.forEach((socketId) => {
            io.to(socketId).emit('message_sent_success', savedMessage);
          });
        }
      } catch (error) {
        console.error('Socket Send Message Error:', error);
        socket.emit('error_message', { message: 'Failed to deliver message real-time' });
      }
    });

    // Typing Indicators
    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSockets = onlineUsers.get(receiverId);
      if (receiverSockets) {
        receiverSockets.forEach((sId) => {
          io.to(sId).emit('user_typing', { senderId });
        });
      }
    });

    socket.on('stop_typing', ({ senderId, receiverId }) => {
      const receiverSockets = onlineUsers.get(receiverId);
      if (receiverSockets) {
        receiverSockets.forEach((sId) => {
          io.to(sId).emit('user_stop_typing', { senderId });
        });
      }
    });

    // Handle Graceful Disconnection
    socket.on('disconnect', () => {
      const uId = socket.userId;
      if (uId && onlineUsers.has(uId)) {
        const userSockets = onlineUsers.get(uId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(uId);

          // Update DB last seen
          if (memoryStore.isInMemory) {
            const u = memoryStore.users.find((user) => user._id.toString() === uId);
            if (u) {
              u.isOnline = false;
              u.lastSeen = new Date();
            }
          } else {
            User.findByIdAndUpdate(uId, { isOnline: false, lastSeen: new Date() }).catch((err) =>
              console.error('Disconnect DB status update error:', err.message)
            );
          }
        }
      }
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      io.emit('get_online_users', getOnlineUserIds());
    });
  });
};

module.exports = { setupSocket };
