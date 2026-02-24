import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { patientAPI, doctorAPI } from '../services/apiClient'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import '../styles/appointments.css'

const AppointmentsPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelDialog, setCancelDialog] = useState({
    show: false,
    appointmentId: null,
  })

  useEffect(() => {
    loadAppointments()
  }, [user?.role])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      let response

      if (user?.role === 'doctor') {
        response = await doctorAPI.getAppointments()
      } else {
        response = await patientAPI.getAppointments()
      }

      setAppointments(response.data)
    } catch (err) {
      setError('Failed to load appointments')
      console.error('Load appointments error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRequest = async (appointmentId) => {
    setCancelDialog({ show: true, appointmentId })
  }

  const handleCancelConfirm = async () => {
    try {
      await patientAPI.cancelAppointment(cancelDialog.appointmentId)
      setAppointments(prev =>
        prev.filter(apt => apt._id !== cancelDialog.appointmentId)
      )
      setCancelDialog({ show: false, appointmentId: null })
    } catch (err) {
      setError('Failed to cancel appointment')
      console.error('Cancel error:', err)
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar userRole={user?.role} onLogout={logout} />
      <div className="dashboard-content">
        <Header title={`${user?.role === 'doctor' ? 'Doctor' : 'Patient'} Appointments`} user={user} />

        <div className="dashboard-main">
          {loading ? (
            <div className="loading">Loading appointments...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="appointments-container">
              {appointments.length > 0 ? (
                <div className="appointments-list">
                  {appointments.map(apt => (
                    <div key={apt._id} className="appointment-detail-card">
                      <div className="apt-header">
                        <h3>{user?.role === 'doctor' ? apt.patient?.name : apt.doctor?.user?.name} {apt.doctor?.specialization && `- ${apt.doctor?.specialization}`}</h3>
                        <span className={`apt-status status-${apt.status}`}>{apt.status}</span>
                      </div>

                      <div className="apt-content">
                        <div className="apt-detail">
                          <icon>📅</icon>
                          <div>
                            <strong>Date & Time</strong>
                            <p>{new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}</p>
                          </div>
                        </div>

                        <div className="apt-detail">
                          <icon>📝</icon>
                          <div>
                            <strong>Type</strong>
                            <p>{apt.consultationType}</p>
                          </div>
                        </div>

                        {apt.symptoms && (
                          <div className="apt-detail">
                            <icon>🏥</icon>
                            <div>
                              <strong>Symptoms/Concerns</strong>
                              <p>{apt.symptoms}</p>
                            </div>
                          </div>
                        )}

                        {apt.notes && (
                          <div className="apt-detail">
                            <icon>📌</icon>
                            <div>
                              <strong>Notes</strong>
                              <p>{apt.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="apt-actions">
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <>
                            {user?.role === 'doctor' && (
                              <>
                                <button
                                  className="btn btn-accept"
                                  onClick={() => {/* Handle accept */ }}
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  className="btn btn-decline"
                                  onClick={() => {/* Handle decline */ }}
                                >
                                  ✕ Decline
                                </button>
                              </>
                            )}
                            {user?.role === 'patient' && (
                              <button
                                className="btn btn-cancel"
                                onClick={() => handleCancelRequest(apt._id)}
                              >
                                ✕ Cancel
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-appointments">
                  <p>No appointments found</p>
                  {user?.role === 'patient' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/patient/book-appointment')}
                    >
                      Book an Appointment
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelDialog.show && (
        <div className="modal-overlay" onClick={() => setCancelDialog({ show: false, appointmentId: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Appointment?</h3>
            <p>Are you sure you want to cancel this appointment?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setCancelDialog({ show: false, appointmentId: null })}
              >
                Keep Appointment
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancelConfirm}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentsPage
