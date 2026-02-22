import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/main-layout.css'

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const isPatient = user?.role === 'patient'
  const isMobile = window.innerWidth <= 768

  const patientTabs = [
    { label: 'Home', icon: '🏠', path: '/patient/home' },
    { label: 'Doctors', icon: '👨‍⚕️', path: '/patient/doctors' },
    { label: 'Appointments', icon: '📅', path: '/patient/appointments' },
    { label: 'Messages', icon: '💬', path: '/patient/messages' },
    { label: 'Notifications', icon: '🔔', path: '/patient/notifications' },
    { label: 'Profile', icon: '👤', path: '/patient/profile' },
  ]

  const doctorTabs = [
    { label: 'Home', icon: '🏠', path: '/doctor/home' },
    { label: 'Appointments', icon: '📅', path: '/doctor/appointments' },
    { label: 'Messages', icon: '💬', path: '/doctor/messages' },
    { label: 'Notifications', icon: '🔔', path: '/doctor/notifications' },
    { label: 'Profile', icon: '👤', path: '/doctor/profile' },
  ]

  const tabs = isPatient ? patientTabs : doctorTabs

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="main-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-logo">🏥 VitalCheck</h1>
          </div>
          <div className="header-right">
            <button 
              className="icon-btn notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              🔔
              <span className="badge">3</span>
            </button>
            <button 
              className="icon-btn menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="dropdown-menu">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                className={`menu-item ${isActive(tab.path) ? 'active' : ''}`}
                onClick={() => {
                  navigate(tab.path)
                  setMenuOpen(false)
                }}
              >
                <span className="icon">{tab.icon}</span>
                <span className="label">{tab.label}</span>
              </button>
            ))}
            <hr className="menu-divider" />
            <button className="menu-item logout-btn" onClick={handleLogout}>
              <span className="icon">🚪</span>
              <span className="label">Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="layout-container">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-logo">🏥 VitalCheck</h2>
            </div>
            <nav className="sidebar-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.path}
                  className={`nav-item ${isActive(tab.path) ? 'active' : ''}`}
                  onClick={() => navigate(tab.path)}
                  title={tab.label}
                >
                  <span className="icon">{tab.icon}</span>
                  <span className="label">{tab.label}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-footer">
              <div className="user-info">
                <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                <div className="user-details">
                  <p className="user-name">{user?.name}</p>
                  <p className="user-role">{isPatient ? 'Patient' : 'Doctor'}</p>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </aside>
        )}

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="bottom-nav">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              className={`nav-item ${isActive(tab.path) ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
              title={tab.label}
            >
              <span className="icon">{tab.icon}</span>
              <span className="label">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}

export default MainLayout
