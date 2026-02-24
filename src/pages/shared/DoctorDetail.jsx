import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/apiClient';

export const DoctorDetailPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientAPI.getDoctorDetails(doctorId);
      setDoctor(response.data);
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      setError('Failed to load doctor information');
    } finally {
      setLoading(false);
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
          <button style={styles.retryBtn} onClick={fetchDoctorDetails}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p style={{ textAlign: 'center', padding: '40px 20px' }}>Doctor not found</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Doctor Header */}
      <div style={styles.doctorHeader}>
        <div style={styles.avatar}>
          {doctor.user?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <h2 style={styles.name}>Dr. {doctor.user?.name || 'Unknown'}</h2>
        <p style={styles.specialization}>{doctor.specialization}</p>
        <div style={styles.ratingSection}>
          <span style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < Math.round(doctor.rating || 0) ? '⭐' : '☆'}</span>
            ))}
          </span>
          <span style={styles.rating}>{doctor.rating ? `${doctor.rating.toFixed(1)} rating` : 'No ratings yet'}</span>
        </div>
      </div>

      {/* Doctor Info */}
      <div style={styles.infoSection}>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>📚</span>
          <div>
            <p style={styles.infoLabel}>Experience</p>
            <p style={styles.infoValue}>
              {doctor.experience ? `${doctor.experience} yrs` : 'Experienced'}
            </p>
          </div>
        </div>

        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>💰</span>
          <div>
            <p style={styles.infoLabel}>Consultation Fee</p>
            <p style={styles.infoValue}>{doctor.consultationFee ? `$${doctor.consultationFee}` : 'Contact for fee'}</p>
          </div>
        </div>

        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>📍</span>
          <div>
            <p style={styles.infoLabel}>Location</p>
            <p style={styles.infoValue}>{doctor.clinicAddress || 'Virtual / Online'}</p>
          </div>
        </div>

        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>📱</span>
          <div>
            <p style={styles.infoLabel}>Contact</p>
            <p style={styles.infoValue}>{doctor.phone || doctor.user?.email || 'Available via app'}</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      {doctor.bio && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>About</h3>
          <p style={styles.bioText}>{doctor.bio}</p>
        </div>
      )}

      {/* Services Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Services Offered</h3>
        <div style={styles.servicesList}>
          <div style={styles.serviceItem}>✓ Online Consultation</div>
          <div style={styles.serviceItem}>✓ Medical Records Review</div>
          <div style={styles.serviceItem}>✓ Follow-up Appointments</div>
          <div style={styles.serviceItem}>✓ Prescription Services</div>
        </div>
      </div>

      {/* Qualifications Section */}
      {doctor.licenseNumber && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Qualifications</h3>
          <div style={styles.qualificationItem}>
            <p style={styles.qualificationLabel}>License Number</p>
            <p style={styles.qualificationValue}>{doctor.licenseNumber}</p>
          </div>
          <div style={styles.qualificationItem}>
            <p style={styles.qualificationLabel}>Specialization</p>
            <p style={styles.qualificationValue}>{doctor.specialization}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button
          style={styles.messageBtn}
          onClick={() => navigate(`/shared/chat/${doctor.user?._id}`)}
        >
          💬 Send Message
        </button>
        <button
          style={styles.bookBtn}
          onClick={() => navigate(`/patient/booking/${doctor._id}`)}
        >
          📅 Book Appointment
        </button>
      </div>
    </div>
  );
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
    marginBottom: '12px',
  },
  doctorHeader: {
    background: 'var(--gradient)',
    color: 'white',
    padding: '40px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 auto 16px',
  },
  name: {
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  specialization: {
    fontSize: '14px',
    opacity: '0.9',
    margin: '0 0 12px 0',
  },
  ratingSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  stars: {
    fontSize: '16px',
  },
  rating: {
    fontSize: '12px',
    opacity: '0.8',
  },
  infoSection: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    gap: '12px',
  },
  infoIcon: {
    fontSize: '20px',
  },
  infoLabel: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0 0 4px 0',
  },
  infoValue: {
    fontSize: '13px',
    fontWeight: '600',
    margin: '0',
    color: 'var(--text-color)',
  },
  section: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: 'var(--text-color)',
  },
  bioText: {
    fontSize: '13px',
    lineHeight: '1.6',
    margin: '0',
    color: 'var(--text-color)',
  },
  servicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  serviceItem: {
    fontSize: '13px',
    color: 'var(--text-color)',
    padding: '8px 0',
  },
  qualificationItem: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
    marginBottom: '8px',
  },
  qualificationLabel: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0 0 4px 0',
  },
  qualificationValue: {
    fontSize: '13px',
    fontWeight: '600',
    margin: '0',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
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
  bookBtn: {
    background: 'var(--secondary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
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

export default DoctorDetailPage;
