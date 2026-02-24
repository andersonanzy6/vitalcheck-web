import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { chatAPI } from '../../services/apiClient';
import io from 'socket.io-client';

export const ChatScreen = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    fetchConversation();
  }, [doctorId]);

  useEffect(() => {
    if (conversationId && user?._id) {
      initializeSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [conversationId, user?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      if (!doctorId) {
        setError('Chat partner ID is missing');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Get messages with the doctor/partner
      const messagesResponse = await chatAPI.getMessages(doctorId);
      const messagesData = messagesResponse.data || [];
      setMessages(messagesData);

      // Mark conversation as read
      try {
        await chatAPI.markAsRead(doctorId);
      } catch (err) {
        console.warn('Could not mark as read:', err);
      }

      // Extract other participant info from first message
      if (messagesData.length > 0) {
        const firstMsg = messagesData[0];
        const currentUserId = (user?.id || user?._id)?.toString();
        const otherUserData = firstMsg.sender._id?.toString() === currentUserId ? firstMsg.receiver : firstMsg.sender;
        setOtherParticipant(otherUserData);
      } else {
        // If no messages, we'll fetch the user details differently
        console.warn('No messages found, other participant info not available yet');
      }

      // Store doctor ID as conversation ID for socket operations
      setConversationId(doctorId);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    try {
      const token = localStorage.getItem('authToken');
      socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        auth: {
          token: token,
        },
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        socketRef.current.emit('join_conversation', conversationId);
      });

      socketRef.current.on('message_received', (message) => {
        setMessages(prev => [...prev, message]);
      });

      socketRef.current.on('error', (err) => {
        console.error('Socket error:', err);
      });
    } catch (err) {
      console.error('Error initializing socket:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      // Send message via API
      const response = await chatAPI.sendMessage(doctorId, messageText);

      const sentMessage = response.data;
      setMessages(prev => [...prev, sentMessage]);

      // Emit via socket
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          conversationId: doctorId,
          message: sentMessage,
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  let lastMessageDate = null;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ←
          </button>
          <h2 style={styles.title}>Loading...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ←
          </button>
          <h2 style={styles.title}>Chat</h2>
        </div>
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={fetchConversation}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Chat Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>
        <div style={styles.headerContent}>
          <h2 style={styles.title}>
            {otherParticipant?.name || 'Chat'}
          </h2>
          <p style={styles.status}>Online</p>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>💬</p>
            <p style={styles.emptyText}>Start a conversation</p>
            <p style={styles.emptySubtext}>
              Send your first message to {otherParticipant?.name}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const currentDate = new Date(message.createdAt).toDateString();
            const showDateDivider =
              lastMessageDate && lastMessageDate !== currentDate;
            lastMessageDate = currentDate;

            const currentUserId = (user?.id || user?._id)?.toString();
            const senderId = message.sender?._id ? message.sender._id.toString() : message.sender?.toString();
            const isOwnMessage = senderId === currentUserId;

            return (
              <div key={message._id || index} style={{ width: '100%' }}>
                {showDateDivider && <div style={styles.dateDivider}>{formatDate(message.createdAt)}</div>}
                <div
                  style={{
                    ...styles.messageRow,
                    ...(isOwnMessage ? styles.messageRowOwn : styles.messageRowOther),
                  }}
                >
                  {isOwnMessage ? (
                    <>
                      <div
                        style={{
                          ...styles.messageBubble,
                          ...styles.messageBubbleOwn,
                        }}
                      >
                        <p style={styles.messageContent}>
                          {message.message}
                        </p>
                        <span style={styles.messageTime}>
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <div style={styles.avatar}>
                        Y
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.avatar}>
                        {message.sender?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.messageBubble}>
                        <p style={styles.messageContent}>
                          {message.message}
                        </p>
                        <span style={styles.messageTime}>
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button
          style={styles.sendBtn}
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          📤
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'var(--gradient)',
    color: 'white',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0 8px',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    margin: '0',
  },
  status: {
    fontSize: '12px',
    margin: '0',
    opacity: '0.8',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: 'var(--light-gray)',
  },
  messageRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    marginBottom: '4px',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--gradient)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    border: 'none',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
    background: '#e5e7eb',
  },
  messageBubbleOwn: {
    background: '#6366f1',
    color: 'white',
    borderRadius: '18px',
  },
  messageContent: {
    fontSize: '14px',
    margin: '0 0 4px 0',
    lineHeight: '1.4',
    wordWrap: 'break-word',
  },
  messageTime: {
    fontSize: '11px',
    opacity: '0.7',
  },
  dateDivider: {
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '16px 0 8px 0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    margin: '0 0 16px 0',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    fontSize: '13px',
    color: 'var(--text-light)',
    margin: '0',
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    background: 'white',
    borderTop: '1px solid var(--border-color)',
  },
  input: {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  sendBtn: {
    background: 'var(--secondary-color)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  errorBox: {
    background: '#ffebee',
    border: '1px solid #ef5350',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    margin: '16px',
  },
  retryBtn: {
    marginTop: '12px',
    background: '#ef5350',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
  },
};

export default ChatScreen;
