import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { patientAPI } from '../../services/apiClient';

export const ProfilePage = () => {
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
    age: user?.age || '',
    gender: user?.gender || '',
    address: user?.address || '',
    medicalHistory: user?.medicalHistory || '',
    bloodGroup: user?.bloodGroup || '',
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
      await patientAPI.updateProfile(formData);
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
        <h2 style={styles.greeting}>Welcome, {user?.name?.split(' ')[0]}</h2>
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
        <h3 style={styles.sectionTitle}>Personal Information</h3>

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
              placeholder="Enter phone number"
              style={styles.input}
            />
          ) : (
            <p style={styles.value}>{formData.phone || '-'}</p>
          )}
        </div>

        {/* Age */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Age</label>
          {isEditing ? (
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age"
              style={styles.input}
            />
          ) : (
            <p style={styles.value}>{formData.age || '-'}</p>
          )}
        </div>

        {/* Gender */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Gender</label>
          {isEditing ? (
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          ) : (
            <p style={styles.value}>{formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : '-'}</p>
          )}
        </div>

        {/* Blood Group */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Blood Group</label>
          {isEditing ? (
            <input
              type="text"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              placeholder="e.g., O+, A-, B+"
              style={styles.input}
            />
          ) : (
            <p style={styles.value}>{formData.bloodGroup || '-'}</p>
          )}
        </div>

        {/* Address */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Address</label>
          {isEditing ? (
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              style={{ ...styles.input, minHeight: '80px', resize: 'none' }}
            />
          ) : (
            <p style={styles.value}>{formData.address || '-'}</p>
          )}
        </div>

        {/* Medical History */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Medical History</label>
          {isEditing ? (
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Enter any relevant medical history"
              style={{ ...styles.input, minHeight: '80px', resize: 'none' }}
            />
          ) : (
            <p style={styles.value}>{formData.medicalHistory || '-'}</p>
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
                  age: user?.age || '',
                  gender: user?.gender || '',
                  address: user?.address || '',
                  medicalHistory: user?.medicalHistory || '',
                  bloodGroup: user?.bloodGroup || '',
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

      {/* Account Info */}
      <div style={styles.infoSection}>
        <h3 style={styles.sectionTitle}>Account Information</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <p style={styles.infoLabel}>Account Type</p>
            <p style={styles.infoValue}>Patient</p>
          </div>
          <div style={styles.infoCard}>
            <p style={styles.infoLabel}>Joined</p>
            <p style={styles.infoValue}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'Recently'}
            </p>
          </div>
          <div style={styles.infoCard}>
            <p style={styles.infoLabel}>Status</p>
            <p style={styles.infoValue}>Active ✓</p>
          </div>
        </div>
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
    marginBottom: '20px',
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
  infoSection: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
  },
  infoCard: {
    background: 'var(--light-gray)',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0 0 8px 0',
  },
  infoValue: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0',
  },
};

export default ProfilePage;
