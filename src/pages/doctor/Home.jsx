import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { doctorAPI } from '../../services/apiClient';

export const DoctorHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorAPI.getAppointments();
      const allAppointments = response.data || [];

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });

      const completed = allAppointments.filter(apt => apt.status === 'completed');
      const pending = allAppointments.filter(
        apt => apt.status !== 'completed' && apt.status !== 'cancelled'
      );

      setAppointments(allAppointments);
      setStats({
        totalAppointments: allAppointments.length,
        todayAppointments: todayAppointments.length,
        completedAppointments: completed.length,
        pendingAppointments: pending.length,
      });
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', padding: '40px 20px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <h2 style={styles.greeting}>Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]} 👨‍⚕️</h2>
        <p style={styles.subtitle}>Manage your appointments and patient interactions</p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Appointments</p>
            <p style={styles.statValue}>{stats.totalAppointments}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Today</p>
            <p style={styles.statValue}>{stats.todayAppointments}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Pending</p>
            <p style={styles.statValue}>{stats.pendingAppointments}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Completed</p>
            <p style={styles.statValue}>{stats.completedAppointments}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <div style={styles.actionGrid}>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/doctor/appointments')}
          >
            <span style={styles.actionIcon}>📅</span>
            <span>View Appointments</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/doctor/messages')}
          >
            <span style={styles.actionIcon}>💬</span>
            <span>Messages</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/doctor/profile')}
          >
            <span style={styles.actionIcon}>👤</span>
            <span>My Profile</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/doctor/notifications')}
          >
            <span style={styles.actionIcon}>🔔</span>
            <span>Notifications</span>
          </button>
        </div>
      </div>

      {/* Today's Appointments Preview */}
      {appointments.length > 0 ? (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Today's Schedule</h3>
            <button
              style={styles.viewAllLink}
              onClick={() => navigate('/doctor/appointments')}
            >
              View All →
            </button>
          </div>
          <div style={styles.appointmentsList}>
            {appointments
              .filter(apt => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const aptDate = new Date(apt.appointmentDate);
                aptDate.setHours(0, 0, 0, 0);
                return aptDate.getTime() === today.getTime();
              })
              .slice(0, 4)
              .map(apt => (
                <div
                  key={apt._id}
                  style={styles.appointmentItem}
                  onClick={() => navigate(`/shared/appointment-detail/${apt._id}`)}
                >
                  <div style={styles.appointmentTime}>
                    <p style={styles.time}>
                      {apt.appointmentTime || new Date(apt.appointmentDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div style={styles.appointmentInfo}>
                    <p style={styles.patientName}>
                      {apt.patient?.name || 'Patient'}
                    </p>
                    {apt.consultationType && (
                      <p style={styles.appointmentType}>{apt.consultationType}</p>
                    )}
                  </div>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(apt.status) }}>
                    {apt.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={fetchData}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

const getStatusStyle = (status) => {
  const styles = {
    scheduled: { backgroundColor: '#e3f2fd', color: '#1976d2' },
    completed: { backgroundColor: '#e8f5e9', color: '#388e3c' },
    cancelled: { backgroundColor: '#ffebee', color: '#d32f2f' },
    confirmed: { backgroundColor: '#f3e5f5', color: '#7b1fa2' },
  };
  return styles[status] || styles.scheduled;
};

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
  },
  welcomeSection: {
    background: 'var(--gradient)',
    color: 'white',
    padding: '24px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  greeting: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    opacity: '0.9',
    margin: '0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  statIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  statContent: {},
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-light)',
    margin: '0 0 4px 0',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--secondary-color)',
    margin: '0',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
    color: 'var(--text-color)',
  },
  viewAllLink: {
    background: 'none',
    border: 'none',
    color: 'var(--secondary-color)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  actionButton: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-color)',
  },
  actionIcon: {
    fontSize: '28px',
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  appointmentItem: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  appointmentTime: {
    textAlign: 'center',
    minWidth: '50px',
    padding: '8px',
    background: 'var(--light-gray)',
    borderRadius: '8px',
  },
  time: {
    fontSize: '14px',
    fontWeight: '700',
    margin: '0',
    color: 'var(--secondary-color)',
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  appointmentType: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize',
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

export default DoctorHome;
