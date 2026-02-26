import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { chatAPI } from '../../services/apiClient';
import { Search, MessageSquare, Clock, User, ChevronRight } from 'lucide-react';

export const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getConversations();
      const convData = Array.isArray(response.data) ? response.data : response.data?.conversations || [];
      setConversations(convData);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const name = conv.partner?.name || 'Unknown';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getOtherParticipant = (conversation) => {
    return conversation.partner || {};
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', padding: '40px 20px' }}>Loading messages...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Messages</h2>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBox}>
        <Search size={18} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Conversations List */}
      <div style={styles.conversationsList}>
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => {
            const otherParticipant = conversation.partner;
            const lastMessage = conversation.lastMessage;
            const isUnread = conversation.unreadCount > 0;
            const lastMessagePreview = lastMessage?.message ?
              (lastMessage.sender?._id === user?._id ? `You: ${lastMessage.message}` : lastMessage.message)
              : 'No messages yet';

            return (
              <div
                key={otherParticipant._id}
                style={{
                  ...styles.conversationItem,
                  ...(isUnread ? styles.conversationItemUnread : {}),
                }}
                onClick={() => navigate(`/shared/chat/${otherParticipant._id}`)}
              >
                <div style={styles.avatar}>
                  {otherParticipant.name?.charAt(0).toUpperCase() || '?'}
                </div>

                <div style={styles.conversationInfo}>
                  <div style={styles.conversationHeader}>
                    <h3 style={styles.conversationName}>{otherParticipant.name || 'Unknown'}</h3>
                    <span style={styles.conversationTime}>
                      {lastMessage?.createdAt ? formatDate(lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <p style={styles.lastMessage}>
                    {lastMessagePreview}
                  </p>
                </div>

                {isUnread && <div style={styles.unreadBadge}>{conversation.unreadCount}</div>}
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateIcon}>💬</p>
            <p style={styles.emptyStateText}>
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p style={styles.emptyStateSubtext}>
              {searchTerm
                ? 'Try a different search'
                : 'Book an appointment to start chatting with a doctor'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={fetchConversations}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '16px',
    gap: '12px',
  },
  searchIcon: {
    fontSize: '18px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  conversationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  conversationItem: {
    display: 'flex',
    gap: '12px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    alignItems: 'center',
  },
  conversationItemUnread: {
    background: 'var(--light-gray)',
    borderColor: 'var(--secondary-color)',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'var(--gradient)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0,
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: '4px',
  },
  conversationName: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0',
    color: 'var(--text-color)',
  },
  conversationTime: {
    fontSize: '12px',
    color: 'var(--text-light)',
    flexShrink: 0,
  },
  lastMessage: {
    fontSize: '13px',
    color: 'var(--text-light)',
    margin: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  unreadBadge: {
    background: 'var(--secondary-color)',
    color: 'white',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: '48px',
    margin: '0 0 16px 0',
  },
  emptyStateText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  emptyStateSubtext: {
    fontSize: '14px',
    color: 'var(--text-light)',
    margin: '0',
  },
  errorBox: {
    background: '#ffebee',
    border: '1px solid #ef5350',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '20px',
    textAlign: 'center',
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

export default MessagesPage;
