import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { MessageSquare, Search, MoreVertical, LogOut } from 'lucide-react';

const Sidebar = ({ selectedUser, onSelectUser }) => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const currentUserId = user?.id || user?._id;

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch user list:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Refresh user list periodically or when online status changes
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, [onlineUsers]);

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      width: '320px',
      minWidth: '300px',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(12, 12, 18, 0.65)'
    }}>
      {/* Top Sidebar Header (Screenshot 2) */}
      <div style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'var(--primary-gradient)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={20} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>
            QuickChat
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <MoreVertical size={20} />
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              background: 'rgba(20, 20, 30, 0.95)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '8px',
              minWidth: '150px',
              zIndex: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <button
                onClick={logout}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  borderRadius: '8px'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Search Bar (Screenshot 2) */}
      <div style={{ padding: '0 20px 16px 20px' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search User..."
            className="glass-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '38px',
              paddingTop: '9px',
              paddingBottom: '9px',
              fontSize: '0.88rem'
            }}
          />
        </div>
      </div>

      {/* Contacts List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 12px 12px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {loadingUsers ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Loading contacts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No users found
          </div>
        ) : (
          filteredUsers.map((u) => {
            const uId = u.id || u._id;
            const isSelected = selectedUser && (selectedUser.id === uId || selectedUser._id === uId);
            const isOnline = onlineUsers.includes(uId) || u.isOnline;

            return (
              <div
                key={uId}
                onClick={() => onSelectUser(u)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  border: isSelected ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent'
                }}
              >
                {/* Avatar with status indicator badge */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.fullName)}`}
                    alt={u.fullName}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      background: 'rgba(255,255,255,0.05)'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    backgroundColor: isOnline ? 'var(--online-green)' : 'var(--offline-gray)',
                    border: '2px solid #09090b'
                  }} />
                </div>

                {/* User Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {u.fullName}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: isOnline ? 'var(--online-green)' : 'var(--text-muted)',
                    marginTop: '2px'
                  }}>
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
