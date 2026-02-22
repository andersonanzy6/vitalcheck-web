import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { patientAPI, doctorAPI } from '../../services/apiClient';

export const AppointmentDetailPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientAPI.getAppointmentDetails(appointmentId);
      setAppointment(response.data);
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!newDate) {
      alert('Please select a new date and time');
      return;
    }

    try {
      await patientAPI.rescheduleAppointment(appointmentId, {
        appointmentDate: newDate,
      });
      setShowRescheduleForm(false);
      setNewDate('');
      fetchAppointmentDetails();
    } catch (err) {
      console.error('Error rescheduling:', err);
      alert('Failed to reschedule appointment');
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await patientAPI.cancelAppointment(appointmentId);
        navigate(-1);
      } catch (err) {
        console.error('Error cancelling:', err);
        if (err.response?.status === 403) {
          alert('You do not have permission to cancel this appointment');
        } else if (err.response?.status === 400) {
          alert('This appointment cannot be cancelled');
        } else {
          alert('Failed to cancel appointment. Please try again.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p style={{ textAlign: 'center', padding: '40px 20px' }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={fetchAppointmentDetails}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p style={{ textAlign: 'center', padding: '40px 20px' }}>Appointment not found</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const isPatientView = user?.role === 'patient' || !user?.specialization;
  const isAppointmentOwner = appointment?.patient?._id === user?._id || appointment?.patientId === user?._id;
  const canReschedule =
    appointment.status !== 'completed' &&
    appointment.status !== 'cancelled' &&
    isPatientView &&
    isAppointmentOwner;

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Status Header */}
      <div style={{ ...styles.header, ...getStatusStyle(appointment.status) }}>
        <h2 style={styles.status}>{appointment.status.toUpperCase()}</h2>
        <p style={styles.timestamp}>{formatDate(appointment.appointmentDate)}</p>
      </div>

      {/* Main Details */}
      <div style={styles.detailsSection}>
        <div style={styles.detailItem}>
          <p style={styles.label}>Date & Time</p>
          <p style={styles.value}>
            {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentDate)}
          </p>
        </div>

        {isPatientView ? (
          <>
            <div style={styles.detailItem}>
              <p style={styles.label}>Doctor</p>
              <div style={styles.doctorInfo}>
                <div style={styles.doctorAvatar}>
                  {appointment.doctorId?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={styles.value}>Dr. {appointment.doctorId?.name}</p>
                  <p style={styles.specialty}>{appointment.doctorId?.specialization}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={styles.detailItem}>
              <p style={styles.label}>Patient</p>
              <div style={styles.patientInfo}>
                <div style={styles.patientAvatar}>
                  {appointment.patientId?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={styles.value}>{appointment.patientId?.name}</p>
                  <p style={styles.contact}>📞 {appointment.patientId?.phone}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {appointment.appointmentType && (
          <div style={styles.detailItem}>
            <p style={styles.label}>Type</p>
            <p style={styles.value}>{appointment.appointmentType}</p>
          </div>
        )}

        {appointment.notes && (
          <div style={styles.detailItem}>
            <p style={styles.label}>Notes</p>
            <p style={styles.value}>{appointment.notes}</p>
          </div>
        )}

        {appointment.diagnosis && (
          <div style={styles.detailItem}>
            <p style={styles.label}>Diagnosis</p>
            <p style={styles.value}>{appointment.diagnosis}</p>
          </div>
        )}

        {appointment.prescription && (
          <div style={styles.detailItem}>
            <p style={styles.label}>Prescription</p>
            <p style={styles.value}>{appointment.prescription}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isPatientView && (
        <div style={styles.actionSection}>
          <button
            style={styles.messageBtn}
            onClick={() => navigate(`/shared/chat/${appointment.doctorId?._id}`)}
          >
            💬 Message Doctor
          </button>

          {canReschedule && (
            <>
              <button
                style={styles.rescheduleBtn}
                onClick={() => setShowRescheduleForm(!showRescheduleForm)}
              >
                📅 Reschedule
              </button>

              {showRescheduleForm && (
                <div style={styles.rescheduleForm}>
                  <h3>Select New Date & Time</h3>
                  <input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    style={styles.input}
                  />
                  <div style={styles.formActions}>
                    <button style={styles.confirmBtn} onClick={handleReschedule}>
                      Confirm
                    </button>
                    <button
                      style={styles.cancelFormBtn}
                      onClick={() => {
                        setShowRescheduleForm(false);
                        setNewDate('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {canReschedule && (
            <button style={styles.cancelBtn} onClick={handleCancel}>
              ✕ Cancel Appointment
            </button>
          )}
        </div>
      )}

      {!isPatientView && appointment.status === 'scheduled' && (
        <div style={styles.actionSection}>
          <button
            style={styles.confirmApptBtn}
            onClick={async () => {
              try {
                await doctorAPI.updateAppointmentStatus(
                  appointmentId,
                  'confirmed'
                );
                fetchAppointmentDetails();
              } catch (err) {
                console.error('Error confirming:', err);
                alert('Failed to confirm appointment');
              }
            }}
          >
            ✓ Confirm Appointment
          </button>
          <button
            style={styles.cancelBtn}
            onClick={handleCancel}
          >
            ✕ Cancel Appointment
          </button>
        </div>
      )}
    </div>
  );
};

const getStatusStyle = (status) => {
  const styles = {
    scheduled: {
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      color: '#1565c0',
    },
    confirmed: {
      background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
      color: '#6a1b9a',
    },
    completed: {
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      color: '#2e7d32',
    },
    cancelled: {
      background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
      color: '#c62828',
    },
  };
  return styles[status] || styles.scheduled;
};

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--secondary-color)',
    cursor: 'pointer',
    padding: '12px 0',
    marginBottom: '16px',
  },
  header: {
    padding: '24px 16px',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'center',
    color: 'white',
  },
  status: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  timestamp: {
    fontSize: '13px',
    margin: '0',
    opacity: '0.9',
  },
  detailsSection: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  detailItem: {
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
  },
  'detailItem:last-child': {
    borderBottom: 'none',
    paddingBottom: 0,
  },
  label: {
    fontSize: '12px',
    color: 'var(--text-light)',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  value: {
    fontSize: '14px',
    color: 'var(--text-color)',
    fontWeight: '500',
    margin: '0',
  },
  doctorInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  doctorAvatar: {
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
  },
  specialty: {
    fontSize: '12px',
    color: 'var(--secondary-color)',
    margin: '4px 0 0 0',
  },
  patientInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  patientAvatar: {
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
  },
  contact: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '4px 0 0 0',
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageBtn: {
    background: 'white',
    border: '2px solid var(--secondary-color)',
    color: 'var(--secondary-color)',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  rescheduleBtn: {
    background: 'white',
    border: '2px solid var(--secondary-color)',
    color: 'var(--secondary-color)',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelBtn: {
    background: '#ffebee',
    border: '1px solid #ef5350',
    color: '#d32f2f',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  confirmApptBtn: {
    background: '#e8f5e9',
    border: '1px solid #4caf50',
    color: '#2e7d32',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  rescheduleForm: {
    background: 'var(--light-gray)',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '12px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '8px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    gap: '8px',
  },
  confirmBtn: {
    flex: 1,
    background: 'var(--secondary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelFormBtn: {
    flex: 1,
    background: 'white',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
    borderRadius: '6px',
    padding: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorBox: {
    background: '#ffebee',
    border: '1px solid #ef5350',
    borderRadius: '8px',
    padding: '16px',
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

export default AppointmentDetailPage;
