import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { patientAPI } from '../services/apiClient'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import '../styles/dashboard.css'

const PatientDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await patientAPI.getAppointments()
      const appointments = response.data
      
      // Filter upcoming appointments (future dates)
      const upcoming = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate > new Date() && apt.status !== 'cancelled'
      }).slice(0, 5)
      
      setUpcomingAppointments(upcoming)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <Sidebar userRole="patient" onLogout={handleLogout} />
      <div className="dashboard-content">
        <Header title="Patient Dashboard" user={user} />
        
        <div className="dashboard-main">
          {loading ? (
            <div className="loading">Loading dashboard...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              <div className="welcome-section">
                <h2>Welcome, {user?.name}!</h2>
                <p>Your health dashboard awaits</p>
              </div>

              <div className="quick-actions">
                <ActionButton 
                  label="Book Appointment"
                  icon="📅"
                  onClick={() => navigate('/patient/book-appointment')}
                />
                <ActionButton 
                  label="View Appointments"
                  icon="📋"
                  onClick={() => navigate('/appointments')}
                />
                <ActionButton 
                  label="My Profile"
                  icon="👤"
                  onClick={() => navigate('/patient/profile')}
                />
              </div>

              <div className="upcoming-section">
                <h2>Upcoming Appointments</h2>
                {upcomingAppointments.length > 0 ? (
                  <div className="appointments-list">
                    {upcomingAppointments.map(apt => (
                      <div key={apt._id} className="appointment-item">
                        <div className="appointment-info">
                          <h3>{apt.doctorName || 'Doctor'}</h3>
                          <p className="appointment-date">
                            📅 {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                          </p>
                          <p className="appointment-type">{apt.appointmentType}</p>
                        </div>
                        <button 
                          className="view-btn"
                          onClick={() => navigate(`/appointments/${apt._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No upcoming appointments. Book one now!</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const ActionButton = ({ label, icon, onClick }) => (
  <button className="action-button" onClick={onClick}>
    <span className="action-icon">{icon}</span>
    <span className="action-label">{label}</span>
  </button>
)

export default PatientDashboard
