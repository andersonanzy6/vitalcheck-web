import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { notificationAPI } from '../../services/apiClient';
import {
  CheckCircle,
  Bell,
  MessageSquare,
  XCircle,
  Calendar,
  Trash2,
  Check,
  Inbox,
  Clock,
  AlertCircle
} from 'lucide-react';

export const DoctorNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMs / 1000 / 60 / 60);
    const diffDays = Math.floor(diffMs / 1000 / 60 / 60 / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_booked':
      case 'appointment_request':
        return <Calendar size={20} color="var(--primary-color)" />;
      case 'appointment_confirmed':
        return <CheckCircle size={20} color="var(--success-color)" />;
      case 'message':
        return <MessageSquare size={20} color="var(--primary-color)" />;
      case 'appointment_cancelled':
        return <XCircle size={20} color="var(--danger-color)" />;
      case 'account_approved':
        return <CheckCircle size={20} color="var(--success-color)" />;
      case 'account_rejected':
        return <AlertCircle size={20} color="var(--danger-color)" />;
      default:
        return <Inbox size={20} color="var(--text-light)" />;
    }
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorState}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={fetchNotifications}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Notifications</h2>
        {unreadCount > 0 && (
          <button style={styles.markAllBtn} onClick={handleMarkAllAsRead}>
            <Check size={14} /> Mark all as read
          </button>
        )}
      </div>

      {unreadCount > 0 && (
        <div style={styles.unreadBanner}>
          <Bell size={16} />
          <p style={styles.unreadText}>You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Notifications List */}
      <div style={styles.notificationsList}>
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification._id}
              style={{
                ...styles.notificationItem,
                ...(notification.isRead ? {} : styles.notificationItemUnread),
              }}
            >
              <div style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </div>

              <div style={styles.notificationContent}>
                <h3 style={styles.notificationTitle}>{notification.title}</h3>
                <p style={styles.notificationMessage}>{notification.message}</p>
                <div style={styles.notificationTime}>
                  <Clock size={12} />
                  <span>{formatTime(new Date(notification.createdAt))}</span>
                </div>
              </div>

              <div style={styles.notificationActions}>
                {!notification.isRead && (
                  <button
                    style={styles.iconBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification._id);
                    }}
                    title="Mark as read"
                  >
                    •
                  </button>
                )}
                <button
                  style={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification._id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIconWrapper}><Bell size={48} /></div>
            <p style={styles.emptyStateText}>All caught up!</p>
            <p style={styles.emptyStateSubtext}>
              You don't have any notifications right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0',
    color: 'var(--text-color)',
  },
  markAllBtn: {
    background: 'white',
    border: '1px solid var(--border-color)',
    color: 'var(--primary-color)',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  unreadBanner: {
    background: 'rgba(0, 102, 204, 0.05)',
    border: '1px solid rgba(0, 102, 204, 0.1)',
    borderRadius: '12px',
    padding: '12px 20px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--primary-color)',
  },
  unreadText: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0',
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  notificationItem: {
    display: 'flex',
    gap: '16px',
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    alignItems: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow)',
    position: 'relative',
    overflow: 'hidden',
  },
  notificationItemUnread: {
    background: 'white',
    borderLeft: '4px solid var(--primary-color)',
  },
  notificationIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'var(--light-gray)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    fontSize: '15px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: 'var(--text-color)',
  },
  notificationMessage: {
    fontSize: '14px',
    color: '#475569',
    margin: '0 0 10px 0',
    lineHeight: '1.5',
  },
  notificationTime: {
    fontSize: '12px',
    color: 'var(--text-light)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500',
  },
  notificationActions: {
    display: 'flex',
    gap: '10px',
    flexShrink: 0,
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--primary-color)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    // Hover style for native element since this is plain JS object styles
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: 'var(--shadow)',
  },
  emptyIconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--light-gray)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    color: '#cbd5e1',
  },
  emptyStateText: {
    fontSize: '20px',
    fontWeight: '800',
    margin: '0 0 8px 0',
    color: 'var(--text-color)',
  },
  emptyStateSubtext: {
    fontSize: '15px',
    color: 'var(--text-light)',
    margin: '0',
  },
  loadingState: {
    textAlign: 'center',
    padding: '100px 24px',
    color: 'var(--text-light)',
    fontSize: '16px',
    fontWeight: '600',
  },
  errorState: {
    textAlign: 'center',
    padding: '100px 24px',
    color: 'var(--danger-color)',
  },
  retryBtn: {
    marginTop: '16px',
    padding: '12px 24px',
    background: 'var(--danger-color)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
  },
};

export default DoctorNotificationsPage;
