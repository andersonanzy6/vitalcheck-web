import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { patientAPI } from '../services/apiClient'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import '../styles/booking.css'

const BookingPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
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

    setSubmitting(true)
    setError('')

    try {
      await patientAPI.bookAppointment({
        doctorId: selectedDoctorId,
        appointmentDate: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        consultationType: bookingData.consultationType,
        reasonForVisit: `Symptoms: ${bookingData.symptoms}. Notes: ${bookingData.notes}`,
      })
      setSuccess('Appointment booked successfully!')
      setTimeout(() => {
        navigate('/appointments')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar userRole="patient" onLogout={logout} />
      <div className="dashboard-content">
        <Header title="Book Appointment" user={user} />

        <div className="dashboard-main">
          <div className="booking-card">
            <h2>Schedule Your Appointment</h2>

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
                        onClick={() => setSelectedDoctorId(doctor._id)}
                      >
                        <div className="doctor-avatar">
                          {doctor.name?.charAt(0).toUpperCase()}
                        </div>
                        <h4>{doctor.name}</h4>
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

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" disabled={submitting} className="book-button">
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
