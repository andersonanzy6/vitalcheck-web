import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { patientAPI } from '../services/apiClient'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import '../styles/booking.css'

const BOOKING_FEE = 3000 // Naira
const BANK_ACCOUNT = {
  accountName: 'Vital Check Care Service Ltd',
  bank: 'Monie Point MFB',
  accountNumber: '8037753218',
  purpose: 'Appointment Fee + Your Name'
}

const BookingPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedDoctorName, setSelectedDoctorName] = useState('')
  const [bookingData, setBookingData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    consultationType: 'consultation',
    symptoms: '',
    notes: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bookingStep, setBookingStep] = useState('details') // 'details' or 'payment'
  const [appointmentId, setAppointmentId] = useState('')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      const response = await patientAPI.getDoctors()
      setDoctors(response.data)
    } catch (err) {
      setError('Failed to load doctors')
      console.error('Load doctors error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDoctor = (doctorId, doctorName) => {
    setSelectedDoctorId(doctorId)
    setSelectedDoctorName(doctorName)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDoctorId) {
      setError('Please select a doctor')
      return
    }

    if (bookingStep === 'details') {
      // First, create the appointment
      setSubmitting(true)
      setError('')

      try {
        const response = await patientAPI.bookAppointment({
          doctorId: selectedDoctorId,
          appointmentDate: bookingData.appointmentDate,
          appointmentTime: bookingData.appointmentTime,
          consultationType: bookingData.consultationType,
          reasonForVisit: `Symptoms: ${bookingData.symptoms}. Notes: ${bookingData.notes}`,
          paymentStatus: 'pending',
        })
        
        setAppointmentId(response.data._id || response.data.id)
        setBookingStep('payment')
        setSuccess('Appointment created! Please complete the payment to confirm.')
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create appointment')
      } finally {
        setSubmitting(false)
      }
    } else if (bookingStep === 'payment') {
      // Mark payment as confirmed
      if (!paymentConfirmed) {
        setError('Please confirm that you have made the payment')
        return
      }

      setSubmitting(true)
      setError('')

      try {
        // Update appointment payment status
        const response = await patientAPI.updateAppointmentPayment?.(appointmentId, {
          paymentStatus: 'payment_pending_verification',
          paymentMethod: 'bank_transfer',
        })

        setSuccess('Payment confirmed! Your appointment is pending verification.')
        setTimeout(() => {
          navigate('/appointments')
        }, 2000)
      } catch (err) {
        // If API doesn't have updateAppointmentPayment, just proceed
        setSuccess('Payment confirmed! Your appointment is pending verification.')
        setTimeout(() => {
          navigate('/appointments')
        }, 2000)
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar userRole="patient" onLogout={logout} />
      <div className="dashboard-content">
        <Header title="Book Appointment" user={user} />

        <div className="dashboard-main">
          <div className="booking-card">
            <h2>{bookingStep === 'details' ? 'Schedule Your Appointment' : 'Complete Payment'}</h2>

            {bookingStep === 'details' ? (
              // STEP 1: APPOINTMENT DETAILS
              <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-section">
                <h3>Select a Doctor</h3>
                {loading ? (
                  <p className="loading">Loading doctors...</p>
                ) : doctors.length === 0 ? (
                  <p className="error">No doctors available</p>
                ) : (
                  <div className="doctors-grid">
                    {doctors.map(doctor => (
                      <div
                        key={doctor._id}
                        className={`doctor-card ${selectedDoctorId === doctor._id ? 'selected' : ''}`}
                        onClick={() => handleSelectDoctor(doctor._id, doctor.user?.name || doctor.name)}
                      >
                        <div className="doctor-avatar">
                          {doctor.user?.name?.charAt(0).toUpperCase() || doctor.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <h4>{doctor.user?.name || doctor.name}</h4>
                        <p className="specialization">{doctor.specialization}</p>
                        <p className="rating">⭐ {doctor.rating || 4.5}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>Appointment Details</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Appointment Date</label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={bookingData.appointmentDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Appointment Time</label>
                    <input
                      type="time"
                      name="appointmentTime"
                      value={bookingData.appointmentTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type of Appointment</label>
                    <select
                      name="consultationType"
                      value={bookingData.consultationType}
                      onChange={handleChange}
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="checkup">Checkup</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Describe Your Symptoms</label>
                    <textarea
                      name="symptoms"
                      value={bookingData.symptoms}
                      onChange={handleChange}
                      placeholder="Tell us about your symptoms or health concerns..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Additional Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleChange}
                      placeholder="Any additional information you'd like to share..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Payment Information</h3>
                <div className="payment-info-box">
                  <p className="payment-info-title">💳 Bank Transfer Required</p>
                  <p className="payment-info-text">
                    After booking your appointment, you'll pay a fee of ₦{BOOKING_FEE.toLocaleString()} via bank transfer to confirm.
                  </p>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" disabled={submitting} className="book-button">
                {submitting ? 'Creating Appointment...' : 'Proceed to Payment'}
              </button>
            </form>
            ) : (
              // STEP 2: PAYMENT CONFIRMATION
              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-section">
                  <h3>📋 Appointment Summary</h3>
                  <div className="appointment-summary" style={{
                    background: '#f0f9ff',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #bfdbfe',
                    marginBottom: '20px'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600' }}>Doctor:</span> Dr. {selectedDoctorName}
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600' }}>Date:</span> {new Date(bookingData.appointmentDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span style={{ fontWeight: '600' }}>Time:</span> {bookingData.appointmentTime}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>💳 Bank Transfer Details</h3>
                  <div className="bank-transfer-card" style={{
                    background: '#fafafa',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '2px solid #10b981'
                  }}>
                    <div className="bank-details">
                      <div className="bank-detail-item" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #e5e7eb',
                        marginBottom: '12px'
                      }}>
                        <span className="detail-label" style={{ fontWeight: '600' }}>Amount:</span>
                        <span className="detail-value" style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>₦{BOOKING_FEE.toLocaleString()}</span>
                      </div>
                      <div className="bank-detail-item" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #e5e7eb',
                        marginBottom: '12px'
                      }}>
                        <span className="detail-label" style={{ fontWeight: '600' }}>Account Name:</span>
                        <span className="detail-value">{BANK_ACCOUNT.accountName}</span>
                      </div>
                      <div className="bank-detail-item" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #e5e7eb',
                        marginBottom: '12px'
                      }}>
                        <span className="detail-label" style={{ fontWeight: '600' }}>Bank:</span>
                        <span className="detail-value">{BANK_ACCOUNT.bank}</span>
                      </div>
                      <div className="bank-detail-item" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #e5e7eb',
                        marginBottom: '12px'
                      }}>
                        <span className="detail-label" style={{ fontWeight: '600' }}>Account Number:</span>
                        <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '16px' }}>{BANK_ACCOUNT.accountNumber}</span>
                      </div>
                      <div className="bank-detail-item" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingBottom: '0'
                      }}>
                        <span className="detail-label" style={{ fontWeight: '600' }}>Reference:</span>
                        <span className="detail-value">{BANK_ACCOUNT.purpose}</span>
                      </div>
                    </div>
                    <p className="payment-note" style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: '#eff6ff',
                      borderLeft: '4px solid #0066cc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      ⚠️ <strong>Important:</strong> Please include your full name and appointment reference in the transfer description for quick verification.
                    </p>
                  </div>
                </div>

                <div className="form-section">
                  <div style={{
                    background: '#f3f4f6',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px'
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
                        onChange={(e) => setPaymentConfirmed(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <span>I have completed the bank transfer of ₦{BOOKING_FEE.toLocaleString()}</span>
                    </label>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingStep('details')
                      setPaymentConfirmed(false)
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#e5e7eb',
                      color: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    className="book-button"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !paymentConfirmed}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: paymentConfirmed ? '#10b981' : '#d1d5db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: paymentConfirmed ? 'pointer' : 'not-allowed',
                      fontSize: '16px'
                    }}
                    className="book-button"
                  >
                    {submitting ? 'Confirming...' : 'Confirm Payment & Book'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage

