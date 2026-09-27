import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { MessageSquare, Send, Image as ImageIcon, Info, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';

const ChatBox = ({ selectedUser, toggleProfileDrawer, onMessageSent, onMessagesChange }) => {
  const { user } = useAuth();
  const { socket, typingMap, emitTyping, emitStopTyping } = useSocket();
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUserId = user?.id || user?._id;
  const targetUserId = selectedUser?.id || selectedUser?._id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history from REST API whenever selectedUser changes
  useEffect(() => {
    if (!targetUserId) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/messages/${targetUserId}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setLoadingHistory(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchHistory();
  }, [targetUserId]);

  // Socket real-time message listeners
  useEffect(() => {
    if (!socket || !targetUserId) return;

    const handleReceiveMessage = (newMsg) => {
      // Check if message belongs to the current open chat
      if (
        (newMsg.senderId === targetUserId && newMsg.receiverId === currentUserId) ||
        (newMsg.senderId === currentUserId && newMsg.receiverId === targetUserId)
      ) {
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 100);
        if (onMessageSent) onMessageSent();
      }
    };

    const handleMessageSentSuccess = (newMsg) => {
      if (
        (newMsg.senderId === currentUserId && newMsg.receiverId === targetUserId)
      ) {
        setMessages((prev) => {
          // Prevent duplicates if already added locally
          if (prev.some((m) => m._id === newMsg._id || m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 100);
        if (onMessageSent) onMessageSent();
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent_success', handleMessageSentSuccess);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent_success', handleMessageSentSuccess);
    };
  }, [socket, targetUserId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
    if (onMessagesChange) onMessagesChange(messages);
  }, [messages]);

  const handleTypingChange = (e) => {
    setTextInput(e.target.value);
    if (!socket || !targetUserId) return;

    emitTyping(targetUserId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(targetUserId);
    }, 2000);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageInput(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!textInput.trim() && !imageInput) || !targetUserId) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: targetUserId,
      text: textInput.trim(),
      image: imageInput
    };

    setSending(true);
    emitStopTyping(targetUserId);

    try {
      if (socket && socket.connected) {
        // Send real-time via Socket.io
        socket.emit('send_message', messageData);
      } else {
        // Fallback REST API send
        const res = await api.post('/messages/send', messageData);
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.message]);
        }
      }

      setTextInput('');
      setImageInput('');
      setImagePreview(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // If no conversation is selected (Screenshot 2 view)
  if (!selectedUser) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 10, 15, 0.4)'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          background: 'var(--primary-gradient)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 15px 35px rgba(139, 92, 246, 0.35)',
          marginBottom: '20px'
        }}>
          <MessageSquare size={38} color="#fff" fill="#fff" />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
          Chat anytime, anywhere
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Select a user from the sidebar to start real-time messaging.
        </p>
      </div>
    );
  }

  const isTargetTyping = typingMap[targetUserId];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      background: 'rgba(10, 10, 15, 0.4)'
    }}>
      {/* Header Bar (Screenshot 3) */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 15, 22, 0.7)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedUser.fullName)}`}
            alt={selectedUser.fullName}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#fff' }}>
              {selectedUser.fullName}
            </h4>
            <span style={{ fontSize: '0.78rem', color: isTargetTyping ? '#a855f7' : 'var(--text-muted)' }}>
              {isTargetTyping ? 'typing...' : selectedUser.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <button
          onClick={toggleProfileDrawer}
          style={{
            background: 'none',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <Info size={18} />
        </button>
      </div>

      {/* Messages Scroll View (Screenshot 3) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {loadingHistory ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
            <Loader2 className="animate-spin" size={24} style={{ margin: 'auto', marginBottom: '8px' }} />
            Loading chat history...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No messages yet. Say hello to {selectedUser.fullName}!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const timeStr = msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : '';

            return (
              <div
                key={msg._id || msg.id || index}
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}
              >
                {!isMe && (
                  <img
                    src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedUser.fullName)}`}
                    alt="avatar"
                    style={{ width: '28px', height: '28px', borderRadius: '50%', marginBottom: '4px' }}
                  />
                )}

                <div style={{
                  maxWidth: '65%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    padding: '12px 18px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? 'var(--primary-purple)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontSize: '0.94rem',
                    lineHeight: '1.45',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isMe ? '0 6px 16px rgba(139, 92, 246, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}>
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="attachment"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '220px',
                          borderRadius: '12px',
                          marginBottom: msg.text ? '8px' : '0',
                          display: 'block'
                        }}
                      />
                    )}
                    {msg.text}
                  </div>

                  {timeStr && (
                    <span style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      padding: '0 4px'
                    }}>
                      {timeStr}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Thumbnail prior to send */}
      {imagePreview && (
        <div style={{
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(20, 20, 30, 0.9)'
        }}>
          <div style={{ position: 'relative' }}>
            <img src={imagePreview} alt="upload preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
            <button
              onClick={() => { setImagePreview(null); setImageInput(''); }}
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                padding: '2px',
                cursor: 'pointer'
              }}
            >
              <X size={12} />
            </button>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Image ready to send</span>
        </div>
      )}

      {/* Message Input Box (Screenshot 3) */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 15, 22, 0.8)'
        }}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-input)',
          borderRadius: '16px',
          padding: '4px 16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <input
            type="text"
            placeholder="Send a message"
            value={textInput}
            onChange={handleTypingChange}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              outline: 'none',
              padding: '10px 0',
              fontSize: '0.94rem'
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ImageIcon size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={sending || (!textInput.trim() && !imageInput)}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(139, 92, 246, 0.4)',
            opacity: (!textInput.trim() && !imageInput) ? 0.5 : 1
          }}
        >
          {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
