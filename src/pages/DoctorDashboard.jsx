import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { doctorAPI } from '../services/apiClient'
import { Calendar, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import '../styles/dashboard.css'

const DoctorDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [appointmentStats, setAppointmentStats] = useState(null)
  const [recentAppointments, setRecentAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await doctorAPI.getAppointments()
      const appointments = response.data

      // Calculate stats from appointments
      const stats = {
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
      }

      setAppointmentStats(stats)
      setRecentAppointments(appointments.slice(-5).reverse())
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
      <Sidebar userRole="doctor" onLogout={handleLogout} />
      <div className="dashboard-content">
        <Header title="Doctor Dashboard" user={user} />

        <div className="dashboard-main">
          {loading ? (
            <div className="loading">Loading dashboard...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              <div className="stats-grid">
                <StatCard
                  title="Total Appointments"
                  value={appointmentStats?.totalAppointments || 0}
                  icon={<Calendar size={24} />}
                />
                <StatCard
                  title="Pending"
                  value={appointmentStats?.pendingAppointments || 0}
                  icon={<Clock size={24} />}
                />
                <StatCard
                  title="Completed"
                  value={appointmentStats?.completedAppointments || 0}
                  icon={<CheckCircle size={24} />}
                />
                <StatCard
                  title="Cancelled"
                  value={appointmentStats?.cancelledAppointments || 0}
                  icon={<XCircle size={24} />}
                />
              </div>

              <div className="recent-section">
                <h2>Recent Appointments</h2>
                {recentAppointments.length > 0 ? (
                  <div className="appointments-list">
                    {recentAppointments.map(apt => (
                      <div key={apt._id} className="appointment-item">
                        <div className="appointment-info">
                          <h3>{apt.patientName || 'Patient'}</h3>
                          <p className="appointment-date">
                            <Calendar size={14} style={{ marginRight: '6px' }} />
                            {new Date(apt.appointmentDate).toLocaleDateString()}
                          </p>
                          <p className="appointment-status">
                            Status: <span className={`status-${apt.status}`}>{apt.status}</span>
                          </p>
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
                  <p className="no-data">No recent appointments</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <p className="stat-title">{title}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
)

export default DoctorDashboard
