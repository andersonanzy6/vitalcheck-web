import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { medicalRecordsAPI } from '../../services/apiClient';

export const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    recordType: 'prescription',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    patientId: '', // Required for doctors
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicalRecordsAPI.getRecords();
      const recordsData = Array.isArray(response.data) ? response.data : response.data?.records || [];
      setRecords(recordsData);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAddRecord = async () => {
    if (!formData.title) {
      alert('Please fill in the title');
      return;
    }

    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('title', formData.title);
      data.append('recordType', formData.recordType);
      data.append('description', formData.description);
      data.append('date', formData.date);

      if (user.role === 'doctor') {
        if (!formData.patientId) {
          alert('Please enter a Patient ID');
          setLoading(false);
          return;
        }
        data.append('patientId', formData.patientId);
      }

      await medicalRecordsAPI.addRecord(data);

      setFormData({
        recordType: 'prescription',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        patientId: '',
      });
      setSelectedFile(null);
      setShowAddForm(false);
      fetchRecords();
    } catch (err) {
      console.error('Error adding record:', err);
      const errorMsg = err.response?.data?.message || err.message;
      alert(`Failed to add medical record: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await medicalRecordsAPI.deleteRecord(recordId);
        fetchRecords();
      } catch (err) {
        console.error('Error deleting record:', err);
        alert('Failed to delete record');
      }
    }
  };

  const getRecordIcon = (type) => {
    const icons = {
      prescription: '💊',
      lab_result: '🧪',
      medical_image: '🩻',
      report: '📋',
      other: '📄',
    };
    return icons[type] || '📄';
  };

  const formatDate = (dateString, fallback) => {
    const d = new Date(dateString || fallback);
    return isNaN(d.getTime()) ? 'Date unavailable' : d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && records.length === 0) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', padding: '40px 20px' }}>Loading records...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Medical Records</h2>
        <button style={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Record'}
        </button>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <div style={styles.formSection}>
          <h3 style={styles.formTitle}>Upload New Record</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Record Type</label>
            <select
              name="recordType"
              value={formData.recordType}
              onChange={handleInputChange}
              style={styles.input}
            >
              <option value="prescription">Prescription</option>
              <option value="lab_result">Lab Result</option>
              <option value="medical_image">Medical Image (X-Ray/MRI)</option>
              <option value="report">Medical Report</option>
              <option value="other">Other</option>
            </select>
          </div>

          {user.role === 'doctor' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Patient ID</label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                placeholder="Paste the patient's ID here"
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Blood Test Results"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add any details about this record..."
              style={{ ...styles.input, minHeight: '80px', resize: 'none' }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>File Upload</label>
            <input
              type="file"
              onChange={handleFileChange}
              style={styles.fileInput}
              accept="image/*,application/pdf"
            />
            {selectedFile && <p style={styles.fileHint}>Selected: {selectedFile.name}</p>}
          </div>

          <div style={styles.formActions}>
            <button style={styles.saveBtn} onClick={handleAddRecord} disabled={loading}>
              {loading ? 'Uploading...' : 'Upload & Save'}
            </button>
            <button
              style={styles.cancelBtn}
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  recordType: 'prescription',
                  title: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                  patientId: '',
                });
                setSelectedFile(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Records List */}
      <div style={styles.recordsList}>
        {records.length > 0 ? (
          records.map(record => (
            <div key={record._id} style={styles.recordCard}>
              <div style={styles.recordIcon}>
                {getRecordIcon(record.recordType)}
              </div>

              <div style={styles.recordInfo}>
                <h3 style={styles.recordTitle}>{record.title}</h3>
                <p style={styles.recordType}>{record.recordType.replace('_', ' ').toUpperCase()}</p>
                <p style={styles.recordDate}>
                  {formatDate(record.date, record.createdAt)}
                </p>
                {record.description && (
                  <p style={styles.recordDescription}>{record.description}</p>
                )}
              </div>

              <div style={styles.recordActions}>
                {record.fileUrl && (
                  <a
                    href={record.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.viewLink}
                  >
                    View File
                  </a>
                )}
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDeleteRecord(record._id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateIcon}>📋</p>
            <p style={styles.emptyStateText}>No medical records</p>
            <p style={styles.emptyStateSubtext}>Add your first medical record to keep track of your health</p>
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
  },
  addBtn: {
    background: 'var(--secondary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  formSection: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 16px 0',
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
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
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
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recordCard: {
    display: 'flex',
    gap: '12px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    alignItems: 'flex-start',
    transition: 'all 0.2s ease',
  },
  recordIcon: {
    fontSize: '28px',
    flexShrink: 0,
    marginTop: '4px',
  },
  recordInfo: {
    flex: 1,
    minWidth: 0,
  },
  recordTitle: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  recordType: {
    fontSize: '12px',
    color: 'var(--secondary-color)',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  recordDate: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0 0 8px 0',
  },
  recordDescription: {
    fontSize: '12px',
    color: 'var(--text-light)',
    margin: '0',
    lineHeight: '1.4',
  },
  recordActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  viewLink: {
    color: 'var(--secondary-color)',
    fontSize: '12px',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    background: 'var(--light-gray)',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'color 0.2s ease',
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
    fontSize: '13px',
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
    color: '#d32f2f',
    fontSize: '13px',
  },
  fileInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'var(--light-gray)',
  },
  fileHint: {
    fontSize: '12px',
    color: 'var(--secondary-color)',
    margin: '4px 0 0 0',
    fontWeight: '500',
  },
};

export default MedicalRecordsPage;
