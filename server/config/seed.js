const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const { memoryStore } = require('./db');

const demoUsersData = [
  {
    fullName: 'John Johnson',
    email: 'john@quickchat.com',
    bio: 'Hi Everyone, I am Using QuickChat',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isOnline: false
  },
  {
    fullName: 'Michael Brown',
    email: 'michael@quickchat.com',
    bio: 'Building awesome web applications',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isOnline: false
  },
  {
    fullName: 'William Jones',
    email: 'william@quickchat.com',
    bio: 'Software engineer & tech enthusiast',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isOnline: false
  },
  {
    fullName: 'Liam Stone',
    email: 'liam@quickchat.com',
    bio: 'Coding & Coffee ☕',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    isOnline: false
  },
  {
    fullName: 'Noah Kites',
    email: 'noah@quickchat.com',
    bio: 'UI/UX Design Specialist',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    isOnline: false
  },
  {
    fullName: 'Oliver Bean',
    email: 'oliver@quickchat.com',
    bio: 'Living life one commit at a time',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    isOnline: false
  },
  {
    fullName: 'James Cook',
    email: 'james@quickchat.com',
    bio: 'Always happy to connect and chat!',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isOnline: false
  }
];

const seedDemoUsers = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    if (memoryStore.isInMemory) {
      demoUsersData.forEach((u) => {
        const exists = memoryStore.users.find((existing) => existing.email === u.email);
        if (!exists) {
          const userId = new mongoose.Types.ObjectId().toString();
          memoryStore.users.push({
            _id: userId,
            fullName: u.fullName,
            email: u.email,
            password: hashedPassword,
            avatar: u.avatar,
            bio: u.bio,
            isOnline: u.isOnline,
            lastSeen: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
      console.log(`[Seed] Seeded ${memoryStore.users.length} demo contacts into memory store.`);
    } else {
      for (const u of demoUsersData) {
        const exists = await User.findOne({ email: u.email });
        if (!exists) {
          await User.create({
            fullName: u.fullName,
            email: u.email,
            password: hashedPassword,
            avatar: u.avatar,
            bio: u.bio,
            isOnline: u.isOnline
          });
        }
      }
      const count = await User.countDocuments();
      console.log(`[Seed] Database initialized with ${count} users.`);
    }
  } catch (error) {
    console.error('Seed Error:', error.message);
  }
};

module.exports = seedDemoUsers;
