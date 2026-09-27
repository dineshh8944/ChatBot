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
// Support a single CLIENT_URL or a comma-separated list CLIENT_URLS
const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = (process.env.CLIENT_URLS || rawClientUrl)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Helper for permissive CORS that accepts requests from allowedOrigins
app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser tools (curl, Postman) which don't send origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*')) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // allow same origin when SERVER_ORIGIN is set (optional)
      const serverOrigin = process.env.SERVER_ORIGIN;
      if (serverOrigin && origin === serverOrigin) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
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

// Socket.io Server Setup - allow array of origins
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
  console.error('[Express Global Error]:', err.stack || err.message || err);
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
    const serverOrigin = process.env.SERVER_ORIGIN || `http://localhost:${PORT}`;
    console.log('=======================================================');
    console.log(`🚀 QuickChat Backend Server running on port ${PORT}`);
    console.log(`📡 Socket.io Listening on ${serverOrigin}`);
    console.log(`🔗 REST API Base: ${serverOrigin}/api`);
    console.log('Allowed client origins: ', allowedOrigins.join(', '));
    console.log('=======================================================');
  });
});
