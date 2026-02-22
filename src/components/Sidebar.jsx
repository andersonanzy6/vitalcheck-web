import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/sidebar.css'

const Sidebar = ({ userRole, onLogout }) => {
  const navigate = useNavigate()

  const doctorMenuItems = [
    { label: 'Dashboard', icon: '📊', path: '/doctor/dashboard' },
    { label: 'Appointments', icon: '📅', path: '/appointments' },
    { label: 'Profile', icon: '👤', path: '/doctor/profile' },
  ]

  const patientMenuItems = [
    { label: 'Dashboard', icon: '🏠', path: '/patient/dashboard' },
    { label: 'Book Appointment', icon: '📅', path: '/patient/book-appointment' },
    { label: 'My Appointments', icon: '📋', path: '/appointments' },
    { label: 'Profile', icon: '👤', path: '/patient/profile' },
  ]

  const menuItems = userRole === 'doctor' ? doctorMenuItems : patientMenuItems

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">🏥 VitalCheck</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.path}
            className="sidebar-item"
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-button" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
