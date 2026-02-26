import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { patientAPI } from '../../services/apiClient';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  UserPlus,
  Calendar,
  MessageSquare,
  FileText,
  ShieldCheck,
  Activity,
  Zap,
  ChevronRight,
  Search
} from 'lucide-react';

export const PatientHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
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
      const response = await patientAPI.getAppointments();
      const allAppointments = response.data || [];

      // Calculate stats
      const upcoming = allAppointments.filter(
        apt => new Date(apt.appointmentDate) > new Date() && apt.status !== 'cancelled'
      );
      const completed = allAppointments.filter(apt => apt.status === 'completed');

      setAppointments(allAppointments);
      setStats({
        totalAppointments: allAppointments.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
      });
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'PA';
  };

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Welcome Section */}
      {/* Welcome Section / Hero */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h2 style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}! 👋</h2>
          <p style={styles.subtitle}>How can we help you today?</p>
          <div style={styles.searchBar}>
            <Search size={18} style={{ color: '#64748b' }} />
            <input type="text" placeholder="Search for doctors, specialists..." style={styles.searchInput} />
          </div>
        </div>
        <div style={styles.heroIllustration}>
          <Activity size={120} color="rgba(255,255,255,0.2)" />
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
          <div style={styles.statIconWrapper}><Clock className="icon-blue" /></div>
          <div style={styles.statContent}>
            <p style={styles.statLabel}>Upcoming</p>
            <p style={styles.statValue}>{stats.upcomingAppointments}</p>
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

      {/* Trust Badges */}
      <div style={styles.trustBadges}>
        <div style={styles.badgeItem}>
          <ShieldCheck size={18} className="icon-blue" />
          <span>Certified Doctors</span>
        </div>
        <div style={styles.badgeItem}>
          <Activity size={18} className="icon-blue" />
          <span>24/7 Service</span>
        </div>
        <div style={styles.badgeItem}>
          <Zap size={18} className="icon-blue" />
          <span>Secure Platform</span>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <div style={styles.actionGrid}>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/patient/doctors')}
          >
            <div style={styles.actionIconWrapper}><UserPlus /></div>
            <span>Find Doctors</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/patient/appointments')}
          >
            <div style={styles.actionIconWrapper}><Calendar /></div>
            <span>Appointments</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/patient/messages')}
          >
            <div style={styles.actionIconWrapper}><MessageSquare /></div>
            <span>Messages</span>
          </button>
          <button
            style={styles.actionButton}
            onClick={() => navigate('/patient/medical-records')}
          >
            <div style={styles.actionIconWrapper}><FileText /></div>
            <span>Medical Records</span>
          </button>
        </div>
      </div>

      {/* Upcoming Appointments Preview */}
      {appointments.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Upcoming Appointments</h3>
            <button
              style={styles.viewAllLink}
              onClick={() => navigate('/patient/appointments')}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={styles.appointmentsList}>
            {appointments
              .filter(apt => new Date(apt.appointmentDate) > new Date() && apt.status !== 'cancelled')
              .slice(0, 3)
              .map(apt => (
                <div
                  key={apt._id}
                  style={styles.appointmentItem}
                  onClick={() => navigate(`/patient/appointment-detail/${apt._id}`)}
                >
                  <div style={styles.appointmentDate}>
                    <p style={styles.appointmentDay}>
                      {new Date(apt.appointmentDate).getDate()}
                    </p>
                    <p style={styles.appointmentMonth}>
                      {new Date(apt.appointmentDate).toLocaleString('default', {
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <div style={styles.appointmentInfo}>
                    <p style={styles.doctorName}>
                      Dr. {apt.doctor?.user?.name || 'Doctor'}
                    </p>
                    <p style={styles.appointmentTime}>
                      {apt.appointmentTime || new Date(apt.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(apt.status) }}>
                    {apt.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

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
    margin: '0 0 24px 0',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    borderRadius: '12px',
    padding: '10px 16px',
    gap: '12px',
    maxWidth: '400px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#1e293b',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
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
    width: '48px',
    height: '48px',
    borderRadius: '12px',
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
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-color)',
    margin: '0',
  },
  trustBadges: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
    padding: '0 8px',
  },
  badgeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-light)',
    fontWeight: '500',
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
  appointmentDate: {
    textAlign: 'center',
    minWidth: '60px',
    padding: '10px',
    background: 'rgba(0, 102, 204, 0.05)',
    borderRadius: '12px',
  },
  appointmentDay: {
    fontSize: '18px',
    fontWeight: '800',
    margin: '0',
    color: 'var(--primary-color)',
  },
  appointmentMonth: {
    fontSize: '12px',
    color: 'var(--text-light)',
    fontWeight: '600',
    margin: '0',
    textTransform: 'uppercase',
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: '15px',
    fontWeight: '700',
    margin: '0 0 2px 0',
  },
  appointmentTime: {
    fontSize: '13px',
    color: 'var(--text-light)',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
    marginBottom: '24px',
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

export default PatientHome;
