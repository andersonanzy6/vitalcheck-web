import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patientAPI } from '../../services/apiClient';
import {
  ArrowLeft,
  Star,
  BookOpen,
  CreditCard,
  MapPin,
  Phone,
  MessageSquare,
  Calendar,
  Check,
  ShieldCheck,
  User
} from 'lucide-react';

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
          {doctor.user?.profileImage ? (
            <img src={doctor.user.profileImage} alt={doctor.user.name} style={styles.avatarImg} />
          ) : (
            <User size={40} />
          )}
        </div>
        <h2 style={styles.name}>Dr. {doctor.user?.name || 'Unknown'}</h2>
        <p style={styles.specialization}>{doctor.specialization}</p>
        <div style={styles.ratingSection}>
          <div style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.round(doctor.rating || 0) ? '#ffc107' : 'none'}
                color={i < Math.round(doctor.rating || 0) ? '#ffc107' : 'white'}
              />
            ))}
          </div>
          <span style={styles.rating}>{doctor.rating ? `${doctor.rating.toFixed(1)} rating` : 'No ratings yet'}</span>
        </div>
      </div>

      {/* Doctor Info */}
      <div style={styles.infoSection}>
        <div style={styles.infoItem}>
          <div style={styles.infoIconWrapper}><BookOpen size={20} className="icon-blue" /></div>
          <div>
            <p style={styles.infoLabel}>Experience</p>
            <p style={styles.infoValue}>
              {doctor.experience ? `${doctor.experience} yrs` : 'Experienced'}
            </p>
          </div>
        </div>

        <div style={styles.infoItem}>
          <div style={styles.infoIconWrapper}><CreditCard size={20} className="icon-blue" /></div>
          <div>
            <p style={styles.infoLabel}>Consultation Fee</p>
            <p style={styles.infoValue}>{doctor.consultationFee ? `$${doctor.consultationFee}` : '$50 (Est.)'}</p>
          </div>
        </div>

        <div style={styles.infoItem}>
          <div style={styles.infoIconWrapper}><MapPin size={20} className="icon-blue" /></div>
          <div>
            <p style={styles.infoLabel}>Location</p>
            <p style={styles.infoValue}>{doctor.location || doctor.clinicAddress || 'Virtual / Online'}</p>
          </div>
        </div>

        <div style={styles.infoItem}>
          <div style={styles.infoIconWrapper}><Phone size={20} className="icon-blue" /></div>
          <div>
            <p style={styles.infoLabel}>Contact</p>
            <p style={styles.infoValue}>{doctor.phone || 'Available via app'}</p>
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

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Services Offered</h3>
        <div style={styles.servicesList}>
          <div style={styles.serviceItem}><Check size={16} className="icon-green" /> Online Consultation</div>
          <div style={styles.serviceItem}><Check size={16} className="icon-green" /> Medical Records Review</div>
          <div style={styles.serviceItem}><Check size={16} className="icon-green" /> Follow-up Appointments</div>
          <div style={styles.serviceItem}><Check size={16} className="icon-green" /> Prescription Services</div>
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
          <MessageSquare size={18} /> Send Message
        </button>
        <button
          style={styles.bookBtn}
          onClick={() => navigate(`/patient/booking/${doctor._id}`)}
        >
          <Calendar size={18} /> Book Appointment
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
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-light)',
    cursor: 'pointer',
    padding: '12px 0',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'color 0.2s ease',
  },
  doctorHeader: {
    background: 'var(--gradient)',
    color: 'white',
    padding: '48px 24px',
    borderRadius: '20px',
    textAlign: 'center',
    marginBottom: '32px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0, 102, 204, 0.3)',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  name: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 4px 0',
  },
  specialization: {
    fontSize: '16px',
    opacity: '0.9',
    margin: '0 0 16px 0',
    fontWeight: '500',
  },
  ratingSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  stars: {
    display: 'flex',
    gap: '4px',
  },
  rating: {
    fontSize: '13px',
    opacity: '0.8',
    fontWeight: '600',
  },
  infoSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    boxShadow: 'var(--shadow)',
  },
  infoItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  infoIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'var(--light-gray)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0 0 4px 0',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: '15px',
    fontWeight: '700',
    margin: '0',
    color: 'var(--text-color)',
  },
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: 'var(--shadow)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    color: 'var(--text-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  bioText: {
    fontSize: '15px',
    lineHeight: '1.7',
    margin: '0',
    color: '#475569',
  },
  servicesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  serviceItem: {
    fontSize: '14px',
    color: 'var(--text-color)',
    padding: '8px 12px',
    background: 'var(--light-gray)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
  },
  qualificationItem: {
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
    '&:lastChild': {
      borderBottom: 'none',
    },
  },
  qualificationLabel: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0 0 4px 0',
    fontWeight: '600',
  },
  qualificationValue: {
    fontSize: '14px',
    fontWeight: '700',
    margin: '0',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    position: 'sticky',
    bottom: '24px',
    padding: '16px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
  },
  messageBtn: {
    background: 'white',
    border: '2px solid var(--primary-color)',
    color: 'var(--primary-color)',
    borderRadius: '12px',
    padding: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
  },
  bookBtn: {
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)',
  },
  errorBox: {
    background: '#fee2e2',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    color: 'var(--danger-color)',
  },
  retryBtn: {
    marginTop: '16px',
    background: 'var(--danger-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default DoctorDetailPage;
