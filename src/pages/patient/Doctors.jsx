import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/apiClient';

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
        <h2 style={styles.title}>Find Doctors</h2>
        <p style={styles.subtitle}>Browse and book appointments</p>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>🔍</span>
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
              <div style={styles.doctorAvatar}>
                {doctor.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div style={styles.doctorInfo}>
                <h3 style={styles.doctorName}>Dr. {doctor.user?.name || 'Unknown'}</h3>
                <p style={styles.specialty}>{doctor.specialization || 'General Practitioner'}</p>
                <p style={styles.experience}>
                  {doctor.experience
                    ? `${doctor.experience} years experience`
                    : 'Experienced'}
                </p>
              </div>
              <div style={styles.ratingSection}>
                <div style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < Math.round(doctor.rating || 0) ? '#ffc107' : '#ddd' }}>
                      ⭐
                    </span>
                  ))}
                </div>
                <p style={styles.rating}>{doctor.rating ? doctor.rating.toFixed(1) : 'N/A'}</p>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateIcon}>🔍</p>
            <p style={styles.emptyStateText}>No doctors found</p>
            <p style={styles.emptyStateSubtext}>Try adjusting your search</p>
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
    flex: 1,
    overflowY: 'auto',
  },
  header: {
    background: 'var(--gradient)',
    color: 'white',
    padding: '20px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    opacity: '0.9',
    margin: '0',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '16px',
    gap: '12px',
  },
  searchIcon: {
    fontSize: '18px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  filterSection: {
    marginBottom: '20px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: 'var(--text-light)',
  },
  filterTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterTag: {
    padding: '8px 16px',
    background: 'white',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'var(--text-color)',
  },
  filterTagActive: {
    background: 'var(--secondary-color)',
    color: 'white',
    borderColor: 'var(--secondary-color)',
  },
  doctorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  doctorCard: {
    display: 'flex',
    gap: '12px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    alignItems: 'stretch',
  },
  doctorAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'var(--gradient)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    flexShrink: 0,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: 'var(--text-color)',
  },
  specialty: {
    fontSize: '13px',
    color: 'var(--secondary-color)',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  experience: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0',
  },
  ratingSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  },
  stars: {
    display: 'flex',
    gap: '2px',
    fontSize: '12px',
  },
  rating: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-color)',
    margin: '0',
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
    fontSize: '14px',
    color: 'var(--text-light)',
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

export default DoctorsPage;
