const mongoose = require('mongoose');

// In-memory fallback data store if MongoDB service is not running
const memoryStore = {
  isInMemory: false,
  users: [],
  messages: []
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quickchat';
  try {
    const conn = await mongoose.connect(uri, {
      connectTimeoutMS: 10000
    });
    console.log(`=======================================================`);
    console.log(`[MongoDB Status] ✅ Connected to Database: "${conn.connection.name}"`);
    console.log(`[MongoDB Host] ${conn.connection.host}:${conn.connection.port}`);
    console.log(`=======================================================`);
    memoryStore.isInMemory = false;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB: ${error.message}`);
    console.log(`[Database Fallback] Operating in In-Memory Mode.`);
    memoryStore.isInMemory = true;
  }
};

module.exports = { connectDB, memoryStore };
