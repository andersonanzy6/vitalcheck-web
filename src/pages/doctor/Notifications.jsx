import { useState } from 'react';

export const DoctorNotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      _id: '1',
      type: 'appointment_booked',
      title: 'New Appointment',
      message: 'John Doe has booked an appointment for tomorrow',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
    {
      _id: '2',
      type: 'appointment_request',
      title: 'Appointment Confirmation Needed',
      message: 'Patient needs confirmation for appointment at 2:00 PM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    },
    {
      _id: '3',
      type: 'message',
      title: 'New Message',
      message: 'Patient sent you a message',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    },
  ]);

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif._id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDelete = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
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
    const icons = {
      appointment_booked: '📅',
      appointment_request: '⏳',
      message: '💬',
      appointment_cancelled: '❌',
      patient_review: '⭐',
    };
    return icons[type] || '📬';
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Notifications</h2>
        {unreadCount > 0 && (
          <button style={styles.markAllBtn} onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {unreadCount > 0 && (
        <div style={styles.unreadBanner}>
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
                ...(notification.read ? {} : styles.notificationItemUnread),
              }}
            >
              <div style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </div>

              <div style={styles.notificationContent}>
                <h3 style={styles.notificationTitle}>{notification.title}</h3>
                <p style={styles.notificationMessage}>{notification.message}</p>
                <p style={styles.notificationTime}>{formatTime(notification.timestamp)}</p>
              </div>

              <div style={styles.notificationActions}>
                {!notification.read && (
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
                  onClick={() => handleDelete(notification._id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateIcon}>🔔</p>
            <p style={styles.emptyStateText}>No notifications yet</p>
            <p style={styles.emptyStateSubtext}>
              You'll receive notifications about new appointments and messages
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
  },
  markAllBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--secondary-color)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0',
  },
  unreadBanner: {
    background: 'var(--light-gray)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
  },
  unreadText: {
    fontSize: '13px',
    fontWeight: '500',
    margin: '0',
    color: 'var(--text-color)',
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  notificationItem: {
    display: 'flex',
    gap: '12px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    alignItems: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  notificationItemUnread: {
    background: 'var(--light-gray)',
    borderColor: 'var(--secondary-color)',
    borderWidth: '2px',
  },
  notificationIcon: {
    fontSize: '24px',
    flexShrink: 0,
    marginTop: '2px',
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: 'var(--text-color)',
  },
  notificationMessage: {
    fontSize: '13px',
    color: 'var(--text-light)',
    margin: '0 0 8px 0',
    lineHeight: '1.4',
  },
  notificationTime: {
    fontSize: '11px',
    color: 'var(--text-light)',
    margin: '0',
  },
  notificationActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--secondary-color)',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
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
    fontSize: '13px',
    color: 'var(--text-light)',
    margin: '0',
  },
};

export default DoctorNotificationsPage;
