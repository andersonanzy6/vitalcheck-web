import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/apiClient';

export const BookingFlowPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: doctorId || '',
    appointmentDate: '',
    appointmentType: 'consultation',
    notes: '',
    symptoms: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleBooking = async () => {
    if (!formData.appointmentDate) {
      setError('Please select a date and time');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await patientAPI.bookAppointment({
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentType: formData.appointmentType,
        notes: formData.notes,
        symptoms: formData.symptoms,
      });

      // Show success message
      alert('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2 style={styles.title}>Book an Appointment</h2>

      {/* Progress Indicator */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressStep, ...(step >= 1 ? styles.progressStepActive : {}) }}>
          1
        </div>
        <div style={{ ...styles.progressLine, ...(step >= 2 ? styles.progressLineActive : {}) }} />
        <div style={{ ...styles.progressStep, ...(step >= 2 ? styles.progressStepActive : {}) }}>
          2
        </div>
        <div style={{ ...styles.progressLine, ...(step >= 3 ? styles.progressLineActive : {}) }} />
        <div style={{ ...styles.progressStep, ...(step >= 3 ? styles.progressStepActive : {}) }}>
          3
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
        </div>
      )}

      {/* Step 1: Select Date & Time */}
      {step === 1 && (
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>When would you like to visit?</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Preferred Date & Time</label>
            <input
              type="datetime-local"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Appointment Type</label>
            <select
              name="appointmentType"
              value={formData.appointmentType}
              onChange={handleInputChange}
              style={styles.input}
            >
              <option value="consultation">General Consultation</option>
              <option value="follow-up">Follow-up Visit</option>
              <option value="check-up">Check-up</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Symptoms & Notes */}
      {step === 2 && (
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>Tell us about your symptoms</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Symptoms or Concerns (Optional)</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              placeholder="Describe your symptoms or health concerns..."
              style={{ ...styles.input, minHeight: '100px', resize: 'none' }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any other information you'd like to share..."
              style={{ ...styles.input, minHeight: '80px', resize: 'none' }}
            />
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>Review Your Booking</h3>

          <div style={styles.reviewSection}>
            <div style={styles.reviewItem}>
              <p style={styles.reviewLabel}>Date & Time</p>
              <p style={styles.reviewValue}>
                {new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })} at {new Date(formData.appointmentDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div style={styles.reviewItem}>
              <p style={styles.reviewLabel}>Appointment Type</p>
              <p style={styles.reviewValue}>{formData.appointmentType}</p>
            </div>

            {formData.symptoms && (
              <div style={styles.reviewItem}>
                <p style={styles.reviewLabel}>Symptoms</p>
                <p style={styles.reviewValue}>{formData.symptoms}</p>
              </div>
            )}

            {formData.notes && (
              <div style={styles.reviewItem}>
                <p style={styles.reviewLabel}>Notes</p>
                <p style={styles.reviewValue}>{formData.notes}</p>
              </div>
            )}
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              The doctor will review your information and confirm the appointment. You will receive a notification once they confirm.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={styles.navButtons}>
        <button
          style={styles.prevBtn}
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          ← Previous
        </button>

        {step < 3 ? (
          <button
            style={styles.nextBtn}
            onClick={() => setStep(step + 1)}
          >
            Next →
          </button>
        ) : (
          <button
            style={styles.confirmBtn}
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        )}
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
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 24px 0',
  },
  progressBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  progressStep: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--light-gray)',
    border: '2px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-light)',
    transition: 'all 0.3s ease',
  },
  progressStepActive: {
    background: 'var(--secondary-color)',
    color: 'white',
    borderColor: 'var(--secondary-color)',
  },
  progressLine: {
    width: '40px',
    height: '2px',
    background: 'var(--border-color)',
    transition: 'background 0.3s ease',
  },
  progressLineActive: {
    background: 'var(--secondary-color)',
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
  stepContent: {
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 20px 0',
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
  reviewSection: {
    background: 'var(--light-gray)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  reviewItem: {
    paddingBottom: '12px',
  },
  reviewLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-light)',
    margin: '0 0 4px 0',
  },
  reviewValue: {
    fontSize: '14px',
    color: 'var(--text-color)',
    fontWeight: '500',
    margin: '0',
  },
  infoBox: {
    background: '#e3f2fd',
    borderRadius: '8px',
    padding: '16px',
    borderLeft: '4px solid #1976d2',
  },
  infoText: {
    fontSize: '13px',
    color: '#1565c0',
    margin: '0',
    lineHeight: '1.5',
  },
  navButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  prevBtn: {
    flex: 1,
    padding: '12px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  nextBtn: {
    flex: 1,
    padding: '12px',
    background: 'var(--light-gray)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  confirmBtn: {
    flex: 1,
    padding: '12px',
    background: 'var(--secondary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default BookingFlowPage;
