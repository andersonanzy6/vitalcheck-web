import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../../services/apiClient';

export const DoctorAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorAPI.getAppointments();
      const appointmentsData = Array.isArray(response.data) ? response.data : [];
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;
    const now = new Date();

    switch (selectedFilter) {
      case 'today':
        filtered = appointments.filter(apt => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const aptDate = new Date(apt.appointmentDate);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        });
        break;
      case 'upcoming':
        filtered = appointments.filter(
          apt => new Date(apt.appointmentDate) > now && apt.status !== 'cancelled'
        );
        break;
      case 'completed':
        filtered = appointments.filter(apt => apt.status === 'completed');
        break;
      case 'cancelled':
        filtered = appointments.filter(apt => apt.status === 'cancelled');
        break;
      default:
        filtered = appointments;
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await doctorAPI.updateAppointmentStatus(appointmentId, newStatus);
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', padding: '40px 20px' }}>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Appointments</h2>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {[
          { label: 'All', value: 'all' },
          { label: 'Today', value: 'today' },
          { label: 'Upcoming', value: 'upcoming' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ].map(filter => (
          <button
            key={filter.value}
            style={{
              ...styles.filterTab,
              ...(selectedFilter === filter.value ? styles.filterTabActive : {}),
            }}
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div style={styles.appointmentsList}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map(apt => (
            <div
              key={apt._id}
              style={styles.appointmentCard}
            >
              <div style={styles.dateTimeSection}>
                <p style={styles.date}>{formatDate(apt.appointmentDate)}</p>
                <p style={styles.time}>{apt.appointmentTime || formatTime(apt.appointmentDate)}</p>
              </div>

              <div style={styles.appointmentDetails}>
                <h3 style={styles.patientName}>
                  {apt.patient?.name || 'Patient'}
                </h3>
                <p style={styles.patientContact}>
                  📞 {apt.patient?.email || 'N/A'}
                </p>
                {apt.consultationType && (
                  <p style={styles.appointmentType}>{apt.consultationType}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ ...styles.statusBadge, ...getStatusStyle(apt.status) }}>
                  {apt.status}
                </span>
                {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                  <select
                    style={styles.actionSelect}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleStatusUpdate(apt._id, e.target.value);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Update Status</option>
                    <option value="confirmed">Confirm</option>
                    <option value="completed">Complete</option>
                    <option value="cancelled">Cancel</option>
                  </select>
                )}
                <button
                  style={styles.viewBtn}
                  onClick={() => navigate(`/shared/appointment-detail/${apt._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateIcon}>📅</p>
            <p style={styles.emptyStateText}>No appointments {selectedFilter !== 'all' ? `(${selectedFilter})` : ''}</p>
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={fetchAppointments}>
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
    confirmed: { backgroundColor: '#f3e5f5', color: '#7b1fa2' },
    completed: { backgroundColor: '#e8f5e9', color: '#388e3c' },
    cancelled: { backgroundColor: '#ffebee', color: '#d32f2f' },
  };
  return styles[status] || styles.scheduled;
};

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  filterTab: {
    padding: '8px 14px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'var(--text-color)',
    whiteSpace: 'nowrap',
  },
  filterTabActive: {
    background: 'var(--secondary-color)',
    color: 'white',
    borderColor: 'var(--secondary-color)',
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  appointmentCard: {
    display: 'flex',
    gap: '12px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px',
    alignItems: 'stretch',
  },
  dateTimeSection: {
    textAlign: 'center',
    minWidth: '60px',
    padding: '8px',
    background: 'var(--light-gray)',
    borderRadius: '8px',
    flexShrink: 0,
  },
  date: {
    fontSize: '11px',
    color: 'var(--text-light)',
    margin: '0 0 4px 0',
  },
  time: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--secondary-color)',
    margin: '0',
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  patientContact: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0 0 4px 0',
  },
  appointmentType: {
    fontSize: '11px',
    color: 'var(--secondary-color)',
    margin: '0',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  actionSelect: {
    padding: '6px 8px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  viewBtn: {
    padding: '6px 10px',
    background: 'var(--secondary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
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

export default DoctorAppointmentsPage;
