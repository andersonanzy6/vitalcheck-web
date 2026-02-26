import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { doctorAPI } from '../../services/apiClient';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Bell,
  User,
  Clock,
  CheckCircle,
  ClipboardList,
  ChevronRight
} from 'lucide-react';

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
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h2 style={styles.greeting}>Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]}! 👋</h2>
          <p style={styles.subtitle}>You have {stats.todayAppointments} appointments scheduled for today.</p>
        </div>
        <div style={styles.heroIllustration}>
          <User size={100} color="rgba(255,255,255,0.2)" />
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapper}><ClipboardList className="icon-blue" /></div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Total Visits</p>
            <p style={styles.statValue}>{stats.totalAppointments}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconWrapper}><Calendar className="icon-blue" /></div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Today</p>
            <p style={styles.statValue}>{stats.todayAppointments}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconWrapper}><Clock className="icon-orange" /></div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Pending</p>
            <p style={styles.statValue}>{stats.pendingAppointments}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconWrapper}><CheckCircle className="icon-green" /></div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Completed</p>
            <p style={styles.statValue}>{stats.completedAppointments}</p>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <div style={styles.actionGrid}>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/doctor/appointments')}
          >
            <div style={styles.actionIconWrapper}><Calendar size={28} /></div>
            <span>Appointments</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/doctor/messages')}
          >
            <div style={styles.actionIconWrapper}><MessageSquare size={28} /></div>
            <span>Messages</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/doctor/profile')}
          >
            <div style={styles.actionIconWrapper}><User size={28} /></div>
            <span>My Profile</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/doctor/notifications')}
          >
            <div style={styles.actionIconWrapper}><Bell size={28} /></div>
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
              View All <ChevronRight size={14} />
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
  heroSection: {
    background: 'var(--gradient)',
    color: 'white',
    padding: '40px 32px',
    borderRadius: '16px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0, 102, 204, 0.3)',
  },
  heroContent: {
    zIndex: 1,
    flex: 1,
  },
  heroIllustration: {
    flex: '0 0 150px',
    display: 'flex',
    justifyContent: 'center',
    opacity: 0.6,
  },
  greeting: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    opacity: '0.9',
    margin: '0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: 'var(--shadow)',
  },
  statIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'var(--light-gray)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-light)',
    fontWeight: '600',
    margin: '0',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-color)',
    margin: '0',
  },
  section: {
    marginBottom: '32px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0',
    color: 'var(--text-color)',
  },
  viewAllLink: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-color)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  actionButton: {
    background: 'white',
    border: 'none',
    borderRadius: '16px',
    padding: '24px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: 'var(--shadow)',
    color: 'var(--text-color)',
    fontWeight: '600',
  },
  actionIconWrapper: {
    color: 'var(--primary-color)',
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  appointmentItem: {
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow)',
  },
  appointmentTime: {
    textAlign: 'center',
    minWidth: '60px',
    padding: '10px',
    background: 'rgba(0, 102, 204, 0.05)',
    borderRadius: '12px',
  },
  time: {
    fontSize: '14px',
    fontWeight: '800',
    margin: '0',
    color: 'var(--primary-color)',
  },
  appointmentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: '15px',
    fontWeight: '700',
    margin: '0 0 2px 0',
  },
  appointmentType: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0',
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  errorBox: {
    background: '#fee2e2',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: '12px',
    background: 'var(--danger-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '600',
  },
};

export default DoctorHome;
