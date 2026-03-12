import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/apiClient';
import {
  Calendar,
  Clock,
  FileText,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Copy
} from 'lucide-react';

const BOOKING_FEE = 3000 // Naira
const BANK_ACCOUNT = {
  accountName: 'Vital Check Care Service Ltd',
  bank: 'Monie Point MFB',
  accountNumber: '8037753218',
  purpose: 'Appointment Fee + Your Name'
}

export const BookingFlowPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: doctorId || '',
    appointmentDate: '',
    consultationType: 'consultation',
    notes: '',
    symptoms: '',
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await patientAPI.getDoctorDetails(doctorId);
        setDoctor(res.data);
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
      }
    };
    if (doctorId) fetchDoctor();
  }, [doctorId]);

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

    if (!paymentConfirmed) {
      setError('Please confirm that you have completed the bank transfer');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dateObj = new Date(formData.appointmentDate);
      const appointmentTime = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      await patientAPI.bookAppointment({
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: appointmentTime,
        consultationType: formData.consultationType,
        reasonForVisit: `Symptoms: ${formData.symptoms}. Notes: ${formData.notes}`,
        paymentStatus: 'payment_pending_verification',
        paymentMethod: 'bank_transfer',
        amount: BOOKING_FEE,
      });

      setStep(4); // Success step
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              name="consultationType"
              value={formData.consultationType}
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

      {/* Step 3: Payment */}
      {step === 3 && (
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>💳 Complete Payment via Bank Transfer</h3>
          <div style={styles.paymentCard}>
            {/* Summary */}
            <div style={styles.summaryBox}>
              <div style={styles.summaryRow}>
                <span>Consultation Fee</span>
                <span style={styles.amount}>₦{BOOKING_FEE.toLocaleString()}</span>
              </div>
              <div style={{ ...styles.summaryRow, borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '12px' }}>
                <span style={{ fontWeight: '800' }}>Total Amount</span>
                <span style={{ fontWeight: '800', fontSize: '20px', color: '#10b981' }}>
                  ₦{BOOKING_FEE.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bank Transfer Details */}
            <div style={{...styles.bankSection, background: '#fafafa', padding: '20px', borderRadius: '12px', border: '2px solid #10b981', marginTop: '20px'}}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>Bank Account Details</h4>
              
              <div style={styles.bankDetailRow}>
                <span style={styles.bankLabel}>Amount:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontStyle: 'monospace', fontWeight: '600', fontSize: '16px', color: '#10b981' }}>₦{BOOKING_FEE.toLocaleString()}</span>
                </div>
              </div>

              <div style={styles.bankDetailRow}>
                <span style={styles.bankLabel}>Account Name:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{BANK_ACCOUNT.accountName}</span>
                  <button style={styles.copyBtn} onClick={() => copyToClipboard(BANK_ACCOUNT.accountName)} title="Copy">
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div style={styles.bankDetailRow}>
                <span style={styles.bankLabel}>Bank:</span>
                <span>{BANK_ACCOUNT.bank}</span>
              </div>

              <div style={styles.bankDetailRow}>
                <span style={styles.bankLabel}>Account Number:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: '600' }}>{BANK_ACCOUNT.accountNumber}</span>
                  <button style={styles.copyBtn} onClick={() => copyToClipboard(BANK_ACCOUNT.accountNumber)} title="Copy">
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div style={{...styles.bankDetailRow, borderBottom: 'none'}}>
                <span style={styles.bankLabel}>Reference:</span>
                <span style={{ fontSize: '13px' }}>{BANK_ACCOUNT.purpose}</span>
              </div>

              {copied && <p style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>✓ Copied to clipboard</p>}

              <p style={{
                marginTop: '16px',
                padding: '12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0369a1'
              }}>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                <strong>Important:</strong> Include your full name in the transfer reference for quick verification.
              </p>
            </div>

            {/* Confirmation Checkbox */}
            <div style={{
              background: '#f0fdf4',
              padding: '16px',
              borderRadius: '12px',
              marginTop: '20px',
              border: '1px solid #dcfce7'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) => {
                    setPaymentConfirmed(e.target.checked);
                    setError(null);
                  }}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500' }}>I have completed the bank transfer of ₦{BOOKING_FEE.toLocaleString()}</span>
              </label>
            </div>

            <p style={styles.securityNote}>
              <ShieldCheck size={14} /> Your appointment will be confirmed after payment verification.
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div style={{ ...styles.stepContent, textAlign: 'center', padding: '60px 24px' }}>
          <div style={styles.successIcon}><CheckCircle2 size={64} color="var(--success-color)" /></div>
          <h3 style={{ ...styles.stepTitle, marginBottom: '12px' }}>Booking Confirmed!</h3>
          <p style={styles.successText}>
            Your appointment with Dr. {doctor?.user?.name} has been scheduled.
          </p>
          <p style={{ ...styles.successText, fontSize: '14px', color: '#64748b' }}>
            Payment is pending verification. Your appointment will be confirmed once we validate your transfer.
          </p>
          <button style={styles.finishBtn} onClick={() => navigate('/patient/appointments')}>
            View My Appointments
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      {step < 4 && (
        <div style={styles.navButtons}>
          <button
            style={styles.prevBtn}
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
          >
            <ArrowLeft size={18} /> Back
          </button>

          {step < 3 ? (
            <button
              style={styles.nextBtn}
              onClick={() => setStep(step + 1)}
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button
              style={{
                ...styles.confirmBtn,
                opacity: paymentConfirmed ? 1 : 0.6,
                cursor: paymentConfirmed ? 'pointer' : 'not-allowed'
              }}
              onClick={handleBooking}
              disabled={loading || !paymentConfirmed}
            >
              {loading ? 'Processing...' : `Confirm Payment & Book`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 16px',
    maxWidth: '600px',
    margin: '0 auto',
    paddingBottom: '80px',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-light)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 32px 0',
    color: 'var(--text-color)',
    textAlign: 'center',
  },
  progressBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  progressStep: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    background: 'white',
    border: '2px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-light)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  progressStepActive: {
    background: 'var(--primary-color)',
    color: 'white',
    borderColor: 'var(--primary-color)',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)',
  },
  progressLine: {
    width: '40px',
    height: '2px',
    background: 'var(--border-color)',
  },
  progressLineActive: {
    background: 'var(--primary-color)',
  },
  errorBox: {
    background: '#fee2e2',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#b91c1c',
    fontSize: '14px',
    fontWeight: '500',
  },
  stepContent: {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: 'var(--shadow)',
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 24px 0',
    color: 'var(--text-color)',
  },
  formGroup: {
    marginBottom: '20px',
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
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    fontSize: '14px',
    background: 'var(--light-gray)',
    transition: 'border-color 0.2s ease',
    outline: 'none',
  },
  summaryBox: {
    background: 'var(--light-gray)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: 'var(--text-light)',
    marginBottom: '8px',
  },
  amount: {
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  paymentMethods: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '600',
  },
  paymentOptionActive: {
    borderColor: 'var(--primary-color)',
    background: 'rgba(0, 102, 204, 0.05)',
    color: 'var(--primary-color)',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-light)',
    marginTop: '24px',
  },
  successIcon: {
    marginBottom: '24px',
  },
  successText: {
    fontSize: '15px',
    color: 'var(--text-light)',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  finishBtn: {
    width: '100%',
    padding: '14px',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  navButtons: {
    display: 'flex',
    gap: '16px',
  },
  prevBtn: {
    flex: 1,
    padding: '14px',
    background: 'white',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  nextBtn: {
    flex: 1,
    padding: '14px',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  confirmBtn: {
    flex: 1,
    padding: '14px',
    background: 'var(--success-color)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  bankSection: {
    marginTop: '20px',
  },
  bankDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '14px',
    marginBottom: '14px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
  },
  bankLabel: {
    fontWeight: '600',
    color: 'var(--text-color)',
  },
  copyBtn: {
    background: 'transparent',
    border: '1px solid #e5e7eb',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'var(--text-light)',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    transition: 'all 0.2s ease',
  },
};

export default BookingFlowPage;
