import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Image as ImageIcon } from 'lucide-react';

const ProfileDrawer = ({ selectedUser, onClose, sharedMedia = [] }) => {
  const { logout } = useAuth();

  if (!selectedUser) return null;

  return (
    <div style={{
      width: '280px',
      minWidth: '260px',
      borderLeft: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(12, 12, 18, 0.75)',
      padding: '24px 20px',
      overflowY: 'auto'
    }}>
      {/* Top Close Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile Header (Screenshot 3) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '28px'
      }}>
        <img
          src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedUser.fullName)}`}
          alt={selectedUser.fullName}
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: '14px',
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}
        />
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
          {selectedUser.fullName}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          {selectedUser.bio || 'Hi Everyone, I am Using QuickChat'}
        </p>
      </div>

      <div style={{ height: '1px', background: 'var(--border-glass)', marginBottom: '20px' }} />

      {/* Shared Media Gallery Section (Screenshot 3) */}
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Media
        </h4>

        {sharedMedia.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            background: 'var(--bg-input)',
            borderRadius: '12px',
            color: 'var(--text-muted)',
            fontSize: '0.82rem'
          }}>
            <ImageIcon size={24} style={{ margin: 'auto', marginBottom: '6px', opacity: 0.5 }} />
            No media shared yet
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {sharedMedia.map((mediaUrl, idx) => (
              <img
                key={idx}
                src={mediaUrl}
                alt="shared"
                style={{
                  width: '100%',
                  height: '80px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Logout Button at Bottom (Screenshot 3) */}
      <div style={{ marginTop: '24px' }}>
        <button
          onClick={logout}
          className="btn-primary"
          style={{
            width: '100%',
            borderRadius: '24px',
            padding: '12px',
            fontSize: '0.95rem'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDrawer;
