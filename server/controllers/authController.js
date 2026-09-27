const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { memoryStore } = require('../config/db');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'quickchat_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// Generate default avatar URL based on name
const getAvatarUrl = (name) => {
  const formattedName = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${formattedName}`;
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (memoryStore.isInMemory) {
      const existing = memoryStore.users.find((u) => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = new mongoose.Types.ObjectId().toString();

      const newUser = {
        _id: userId,
        fullName: fullName.trim(),
        email: cleanEmail,
        password: hashedPassword,
        avatar: getAvatarUrl(fullName),
        bio: 'Hi Everyone, I am Using QuickChat',
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      memoryStore.users.push(newUser);

      const token = generateToken(userId);
      const { password: p, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: { ...userWithoutPassword, id: userId }
      });
    }

    // Mongoose execution
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      password: hashedPassword,
      avatar: getAvatarUrl(fullName),
      bio: 'Hi Everyone, I am Using QuickChat',
      isOnline: true
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (memoryStore.isInMemory) {
      const user = memoryStore.users.find((u) => u.email === cleanEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      user.isOnline = true;
      user.lastSeen = new Date();

      const token = generateToken(user._id);
      const { password: p, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        token,
        user: { ...userWithoutPassword, id: user._id.toString() }
      });
    }

    // Mongoose execution
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save();

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

// @desc    Get all users except currently logged-in user
// @route   GET /api/auth/users
const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id?.toString();

    if (memoryStore.isInMemory) {
      const otherUsers = memoryStore.users
        .filter((u) => u._id.toString() !== currentUserId)
        .map(({ password, _id, ...u }) => ({
          ...u,
          id: _id.toString(),
          _id: _id.toString()
        }));

      return res.json({
        success: true,
        users: otherUsers
      });
    }

    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password').sort({ fullName: 1 });

    return res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        avatar: u.avatar,
        bio: u.bio,
        isOnline: u.isOnline,
        lastSeen: u.lastSeen
      }))
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users list' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers
};
