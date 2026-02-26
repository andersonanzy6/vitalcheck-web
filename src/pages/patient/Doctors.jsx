import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/apiClient';
import {
  Search,
  Star,
  Stethoscope,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  Users
} from 'lucide-react';

export const DoctorsPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientAPI.getDoctors();
      const doctorsData = Array.isArray(response.data) ? response.data : response.data?.doctors || [];
      setDoctors(doctorsData);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty) {
      filtered = filtered.filter(doc => doc.specialization === selectedSpecialty);
    }

    setFilteredDoctors(filtered);
  };

  const specialties = [...new Set(doctors.map(doc => doc.specialization).filter(Boolean))];

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', padding: '40px 20px' }}>Loading doctors...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.title}>Find Doctors</h2>
          <p style={styles.subtitle}>Book appointments with top specialists near you.</p>
        </div>
        <div style={styles.headerIcon}><Users size={40} /></div>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBox}>
        <Search size={18} style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Search by doctor name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Speciality Filter */}
      {specialties.length > 0 && (
        <div style={styles.filterSection}>
          <p style={styles.filterLabel}>Specialization:</p>
          <div style={styles.filterTags}>
            <button
              style={{
                ...styles.filterTag,
                ...(selectedSpecialty === '' ? styles.filterTagActive : {}),
              }}
              onClick={() => setSelectedSpecialty('')}
            >
              All
            </button>
            {specialties.map(specialty => (
              <button
                key={specialty}
                style={{
                  ...styles.filterTag,
                  ...(selectedSpecialty === specialty ? styles.filterTagActive : {}),
                }}
                onClick={() => setSelectedSpecialty(specialty)}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Doctors List */}
      <div style={styles.doctorsList}>
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(doctor => (
            <div
              key={doctor._id}
              style={styles.doctorCard}
              onClick={() => navigate(`/shared/doctor-detail/${doctor._id}`)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.doctorAvatar}>
                  {doctor.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div style={styles.doctorInfo}>
                  <h3 style={styles.doctorName}>Dr. {doctor.user?.name || 'Unknown'}</h3>
                  <p style={styles.specialty}>
                    <Stethoscope size={14} /> {doctor.specialization || 'General Practitioner'}
                  </p>
                </div>
              </div>

              <div style={styles.cardDetails}>
                <div style={styles.detailItem}>
                  <Clock size={14} />
                  <span>{doctor.experience || 5}+ Years Experience</span>
                </div>
                <div style={styles.detailItem}>
                  <ShieldCheck size={14} color="var(--success-color)" />
                  <span>Verified Professional</span>
                </div>
              </div>

              <div style={styles.ratingSection}>
                <div style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.round(doctor.rating || 4.5) ? '#ffc107' : 'none'}
                      color={i < Math.round(doctor.rating || 4.5) ? '#ffc107' : '#cbd5e1'}
                    />
                  ))}
                </div>
                <p style={styles.rating}>{doctor.rating ? doctor.rating.toFixed(1) : '4.8'}</p>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <Search size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <p style={styles.emptyStateText}>No doctors found</p>
            <p style={styles.emptyStateSubtext}>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.retryBtn} onClick={fetchDoctors}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
  },
  header: {
    background: 'var(--gradient)',
    color: 'white',
    padding: '40px 32px',
    borderRadius: '24px',
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 25px -5px rgba(0, 102, 204, 0.3)',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    opacity: '0.9',
    margin: '0',
    fontWeight: '500',
  },
  headerIcon: {
    opacity: '0.2',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '16px 20px',
    marginBottom: '24px',
    gap: '12px',
    boxShadow: 'var(--shadow)',
    transition: 'border-color 0.2s ease',
    '&:focusWithin': {
      borderColor: 'var(--primary-color)',
    },
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    fontFamily: 'inherit',
    color: 'var(--text-color)',
  },
  filterSection: {
    marginBottom: '32px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 12px 0',
    color: 'var(--text-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterTags: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterTag: {
    padding: '10px 20px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'var(--text-light)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  filterTagActive: {
    background: 'var(--primary-color)',
    color: 'white',
    borderColor: 'var(--primary-color)',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)',
  },
  doctorsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  doctorCard: {
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'var(--shadow)',
    border: '1px solid transparent',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderColor: 'rgba(0, 102, 204, 0.1)',
    },
  },
  cardHeader: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'rgba(0, 102, 204, 0.1)',
    color: 'var(--primary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '800',
    flexShrink: 0,
  },
  doctorInfo: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: 'var(--text-color)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  specialty: {
    fontSize: '14px',
    color: 'var(--primary-color)',
    fontWeight: '600',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: 'var(--text-light)',
    fontWeight: '500',
  },
  ratingSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '16px',
  },
  stars: {
    display: 'flex',
    gap: '2px',
  },
  rating: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-color)',
    margin: '0',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '80px 24px',
    background: 'white',
    borderRadius: '24px',
    boxShadow: 'var(--shadow)',
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
  errorBox: {
    background: '#fee2e2',
    borderRadius: '16px',
    padding: '24px',
    marginTop: '32px',
    textAlign: 'center',
    color: '#b91c1c',
  },
  retryBtn: {
    marginTop: '16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
  },
};

export default DoctorsPage;
