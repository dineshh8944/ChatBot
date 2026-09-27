const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { memoryStore } = require('../config/db');

// @desc    Send a message (REST fallback & API contract)
// @route   POST /api/messages/send
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, image } = req.body;
    const senderId = req.user.id || req.user._id?.toString();

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Receiver ID is required' });
    }

    if (!text && !image) {
      return res.status(400).json({ success: false, message: 'Message text or image is required' });
    }

    if (memoryStore.isInMemory) {
      const msgId = new mongoose.Types.ObjectId().toString();
      const newMessage = {
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

      memoryStore.messages.push(newMessage);

      return res.status(201).json({
        success: true,
        message: newMessage
      });
    }

    // Mongoose execution
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || '',
      image: image || '',
      readStatus: false
    });

    return res.status(201).json({
      success: true,
      message: {
        id: newMessage._id,
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        text: newMessage.text,
        image: newMessage.image,
        readStatus: newMessage.readStatus,
        createdAt: newMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Send Message REST Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// @desc    Get chat history between logged-in user and another user
// @route   GET /api/messages/:userId
const getMessages = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.id || req.user._id?.toString();

    if (memoryStore.isInMemory) {
      const chatHistory = memoryStore.messages.filter(
        (m) =>
          (m.senderId === currentUserId && m.receiverId === otherUserId) ||
          (m.senderId === otherUserId && m.receiverId === currentUserId)
      );

      // Sort chronologically
      chatHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      return res.json({
        success: true,
        messages: chatHistory
      });
    }

    // Mongoose execution: find all messages where (sender=A & receiver=B) or (sender=B & receiver=A)
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      messages: messages.map((m) => ({
        id: m._id,
        _id: m._id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        text: m.text,
        image: m.image,
        readStatus: m.readStatus,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
  }
};

module.exports = {
  sendMessage,
  getMessages
};
