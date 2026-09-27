import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/Auth/AuthModal';
import Sidebar from './components/Sidebar/Sidebar';
import ChatBox from './components/Chat/ChatBox';
import ProfileDrawer from './components/ProfileDrawer/ProfileDrawer';

function App() {
  const { user, loading } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [activeMessages, setActiveMessages] = useState([]);

  const sharedMedia = activeMessages.filter((m) => m.image).map((m) => m.image);

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        color: '#fff',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(139, 92, 246, 0.3)',
            borderTopColor: '#a855f7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: 'auto',
            marginBottom: '16px'
          }} />
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>Loading QuickChat...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px'
    }}>
      {/* Background ambient glowing aura */}
      <div className="ambient-glow" />
      <div className="ambient-glow-secondary" />

      {/* Main Glassmorphic Container (Screenshots 2 & 3) */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1240px',
        height: 'calc(100vh - 48px)',
        maxHeight: '840px',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Sidebar */}
        <Sidebar
          selectedUser={selectedUser}
          onSelectUser={(u) => {
            setSelectedUser(u);
            setShowProfileDrawer(true);
          }}
        />

        {/* Central Chat Box Area */}
        <ChatBox
          selectedUser={selectedUser}
          toggleProfileDrawer={() => setShowProfileDrawer(!showProfileDrawer)}
          onMessageSent={() => setRefreshTrigger((prev) => prev + 1)}
          onMessagesChange={setActiveMessages}
        />

        {/* Right User Profile Side Drawer */}
        {selectedUser && showProfileDrawer && (
          <ProfileDrawer
            selectedUser={selectedUser}
            onClose={() => setShowProfileDrawer(false)}
            sharedMedia={sharedMedia}
          />
        )}
      </div>
    </div>
  );
}

export default App;
