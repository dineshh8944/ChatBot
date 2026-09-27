# QuickChat - Real-Time MERN + Socket.io Chat Application

QuickChat is a full-stack real-time 1-on-1 messaging application built using the **MERN Stack** (MongoDB, Express, React, Node.js) and **Socket.io**. It features modern dark-mode glassmorphism styling, instant message delivery without page refreshes, persistent chat history, real-time online/offline user tracking, image media sharing, and user profile management.

---

## 🌟 Key Features

1. **Authentication & User Management**
   - User Sign Up and Login with JWT authentication & bcrypt password hashing.
   - User profiles with avatars and custom bio status ("Hi Everyone, I am Using QuickChat").

2. **Real-Time Communication (Socket.io)**
   - Zero-refresh instant 1-on-1 message delivery.
   - Real-time online/offline user status badge indicators in sidebar.
   - Live typing indicators ("typing...").
   - Graceful socket connection & disconnection handling across multiple tabs/devices.

3. **Persistent Chat Logs**
   - All messages are saved in **MongoDB** (with automatic zero-setup in-memory database fallback).
   - Reloading or re-logging into the application preserves full conversation history.

4. **Modern Glassmorphic Dark UI**
   - Inspired by sleek dark mode aesthetics with ambient violet/blue glowing aura.
   - Translucent frosted glass panels (`backdrop-filter: blur(20px)`).
   - Sidebar contact search, message timestamps (`14:13`), image attachment sharing, and slide-out profile media drawer.

---

## 📁 Directory Structure

```
d:\DINESH\Chat
├── server/                      # Node.js + Express + Socket.io Backend
│   ├── config/                  # Database connection (MongoDB + fallback)
│   ├── controllers/             # Auth & Message controllers
│   ├── middleware/              # JWT authorization middleware
│   ├── models/                  # Mongoose User & Message schemas
│   ├── routes/                  # REST API routes (/api/auth, /api/messages)
│   ├── socket/                  # Socket.io real-time event handlers
│   ├── .env                     # Server environment variables
│   ├── package.json
│   └── server.js                # Server entry point
│
└── client/                      # React + Vite Frontend
    ├── public/
    ├── src/
    │   ├── assets/              # Icons & logos
    │   ├── components/
    │   │   ├── Auth/            # Signup / Login modal
    │   │   ├── Sidebar/         # Contacts list, search bar, status badges
    │   │   ├── Chat/            # Main chat container, message bubbles, media upload
    │   │   └── ProfileDrawer/   # Selected user drawer with shared media gallery
    │   ├── context/             # AuthContext & SocketContext
    │   ├── services/            # Axios API client setup
    │   ├── App.jsx              # Main application container
    │   ├── index.css            # Dark glassmorphism design system
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (Optional: if MongoDB is not running locally, the server automatically uses a built-in in-memory fallback store).

---

### Step 1: Backend Setup (`server/`)

```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Start the backend server
npm start
```
The server will start on **`http://localhost:5000`** and Socket.io on **`ws://localhost:5000`**.

---

### Step 2: Frontend Setup (`client/`)

```bash
# Open a new terminal and navigate to the client folder
cd client

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend application will be running on **`http://localhost:5173`**.

---

## 🛠️ Environment Variables Reference

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/quickchat
JWT_SECRET=quickchat_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
```

---

## 📡 REST API Documentation

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | No |
| `GET` | `/api/auth/me` | Fetch currently logged in user info | Yes |
| `GET` | `/api/auth/users` | List all available registered chat users | Yes |

### Message Routes (`/api/messages`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/messages/send` | Send text or image message | Yes |
| `GET` | `/api/messages/:userId` | Fetch conversation history with target user | Yes |

---

## ⚡ Socket.io Events Specification

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `connection` | Client -> Server | `query: { userId }` | Connection initiated with user ID |
| `join_chat` | Client -> Server | `userId` | Joins user's socket room |
| `send_message` | Client -> Server | `{ senderId, receiverId, text, image }` | Emits a new 1-on-1 real-time message |
| `receive_message` | Server -> Client | Message Object | Delivers incoming message instantly |
| `message_sent_success`| Server -> Client | Message Object | Confirms message storage and broadcast |
| `get_online_users` | Server -> Client | `[ userId1, userId2, ... ]` | Broadcasts updated list of online user IDs |
| `typing` | Client -> Server | `{ senderId, receiverId }` | Triggers "typing..." state |
| `stop_typing` | Client -> Server | `{ senderId, receiverId }` | Clears "typing..." state |
| `disconnect` | Client -> Server | None | Cleans up active user socket mapping |

---

## 📄 License
This project is open-source under the ISC License.
////////////////

Name	               Email             	Password
John Johnson	john@quickchat.com	   password123
Michael Brown	michael@quickchat.com	password123
William Jones	william@quickchat.com	password123