import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { doctorAPI } from '../../services/apiClient';

export const DoctorProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    yearsOfExperience: user?.yearsOfExperience || '',
    bio: user?.bio || '',
    licenseNumber: user?.licenseNumber || '',
    clinicAddress: user?.clinicAddress || '',
    consultationFee: user?.consultationFee || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await doctorAPI.updateProfile(formData);
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header with Profile Avatar */}
      <div style={styles.profileHeader}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h2 style={styles.greeting}>Dr. {user?.name?.split(' ').slice(-1)[0]}</h2>
        <p style={styles.specialization}>{user?.specialization || 'Medical Professional'}</p>
        <p style={styles.email}>{user?.email}</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
        </div>
      )}
      {successMessage && (
        <div style={styles.successBox}>
          <p>{successMessage}</p>
        </div>
      )}

      {/* Edit Button */}
      {!isEditing && (
        <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
          ✏️ Edit Profile
        </button>
      )}

      {/* Profile Form */}
      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>Professional Information</h3>

        {/* Name */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />
          ) : (
            <p style={styles.value}>{formData.name || '-'}</p>
          )}
        </div>

        {/* Email */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              disabled
            />
          ) : (
            <p style={styles.value}>{formData.email || '-'}</p>
          )}
        </div>

        {/* Phone */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Phone Number</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
            />
          ) : (
            <p style={styles.value}>{formData.phone || '-'}</p>
          )}
        </div>

        {/* Specialization */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Specialization</label>
          {isEditing ? (
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g., Cardiology, Neurology"
              style={styles.input}
            />
          ) : (
            <p style={styles.value}>{formData.specialization || '-'}</p>
          )}
        </div>

        {/* Years of Experience */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Years of Experience</label>
          {isEditing ? (
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              style={styles.input}
            />
          ) : (
            <p style={styles.value}>{formData.yearsOfExperience ? `${formData.yearsOfExperience} years` : '-'}</p>
          )}
        </div>

        {/* License Number */}
        <div style={styles.formGroup}>
          <label style={styles.label}>License Number</label>
          {isEditing ? (
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              style={styles.input}
            />
          ) : (
            <p style={styles.value}>{formData.licenseNumber || '-'}</p>
          )}
        </div>

        {/* Consultation Fee */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Consultation Fee</label>
          {isEditing ? (
            <input
              type="text"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              placeholder="e.g., $50"
              style={styles.input}
            />
          ) : (
            <p style={styles.value}>{formData.consultationFee || '-'}</p>
          )}
        </div>

        {/* Clinic Address */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Clinic Address</label>
          {isEditing ? (
            <textarea
              name="clinicAddress"
              value={formData.clinicAddress}
              onChange={handleChange}
              style={{ ...styles.input, minHeight: '80px', resize: 'none' }}
            />
          ) : (
            <p style={styles.value}>{formData.clinicAddress || '-'}</p>
          )}
        </div>

        {/* Bio */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Professional Bio</label>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell patients about your experience and approach"
              style={{ ...styles.input, minHeight: '80px', resize: 'none' }}
            />
          ) : (
            <p style={styles.value}>{formData.bio || '-'}</p>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div style={styles.actionButtons}>
            <button
              style={styles.saveBtn}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              style={styles.cancelBtn}
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                  specialization: user?.specialization || '',
                  yearsOfExperience: user?.yearsOfExperience || '',
                  bio: user?.bio || '',
                  licenseNumber: user?.licenseNumber || '',
                  clinicAddress: user?.clinicAddress || '',
                  consultationFee: user?.consultationFee || '',
                });
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div style={styles.accountSection}>
        <h3 style={styles.sectionTitle}>Account</h3>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
    maxWidth: '600px',
    margin: '0 auto',
  },
  profileHeader: {
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
  greeting: {
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  specialization: {
    fontSize: '13px',
    margin: '0 0 8px 0',
    opacity: '0.9',
  },
  email: {
    fontSize: '13px',
    margin: '0',
    opacity: '0.9',
  },
  errorBox: {
    background: '#ffebee',
    border: '1px solid #ef5350',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    color: '#d32f2f',
    fontSize: '13px',
  },
  successBox: {
    background: '#e8f5e9',
    border: '1px solid #4caf50',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    color: '#388e3c',
    fontSize: '13px',
  },
  editBtn: {
    width: '100%',
    background: 'var(--secondary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
  },
  formSection: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: 'var(--text-color)',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-light)',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  value: {
    fontSize: '14px',
    color: 'var(--text-color)',
    margin: '0',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  saveBtn: {
    flex: 1,
    background: 'var(--secondary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1,
    background: 'var(--light-gray)',
    color: 'var(--text-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  accountSection: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
  },
  logoutBtn: {
    width: '100%',
    background: '#ffebee',
    color: '#d32f2f',
    border: '1px solid #d32f2f',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default DoctorProfilePage;
