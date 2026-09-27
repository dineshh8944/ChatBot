const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { setupSocket } = require('./socket/socketHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration for REST & WebSockets
const allowedOrigins = Array.from(
  new Set([
    process.env.CLIENT_URL,
    'https://chatbot-1-u33a.onrender.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ].filter(Boolean))
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), app: 'QuickChat Server' });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io Server Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

setupSocket(io);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Express Global Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const seedDemoUsers = require('./config/seed');

// Start Server & Connect Database
connectDB().then(async () => {
  await seedDemoUsers();
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 QuickChat Backend Server running on port ${PORT}`);
    console.log(`📡 Socket.io Listening on ws://localhost:${PORT}`);
    console.log(`🔗 REST API Base: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
});
