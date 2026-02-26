import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { notificationAPI } from '../services/apiClient'
import {
  Home,
  User,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  MessageCircle,
  Stethoscope,
  ClipboardList,
  Sparkles,
  CreditCard
} from 'lucide-react'
import '../styles/main-layout.css'

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const isPatient = user?.role === 'patient'
  const isMobile = window.innerWidth <= 768

  React.useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount()
      setUnreadCount(res.data.count || 0)
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }

  const patientTabs = [
    { label: 'Home', icon: <Home size={22} />, path: '/patient/home' },
    { label: 'Doctors', icon: <Stethoscope size={22} />, path: '/patient/doctors' },
    { label: 'Symptom Checker', icon: <ClipboardList size={22} />, path: '/patient/symptom-checker' },
    { label: 'Appointments', icon: <Calendar size={22} />, path: '/patient/appointments' },
    { label: 'Messages', icon: <MessageSquare size={22} />, path: '/patient/messages' },
    { label: 'Notifications', icon: <Bell size={22} />, path: '/patient/notifications' },
    { label: 'Payments', icon: <CreditCard size={22} />, path: '/patient/payments' },
    { label: 'Profile', icon: <User size={22} />, path: '/patient/profile' },
  ]

  const doctorTabs = [
    { label: 'Home', icon: <Home size={22} />, path: '/doctor/home' },
    { label: 'Appointments', icon: <Calendar size={22} />, path: '/doctor/appointments' },
    { label: 'Messages', icon: <MessageSquare size={22} />, path: '/doctor/messages' },
    { label: 'Notifications', icon: <Bell size={22} />, path: '/doctor/notifications' },
    { label: 'Profile', icon: <User size={22} />, path: '/doctor/profile' },
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
              onClick={() => {
                navigate(isPatient ? '/patient/notifications' : '/doctor/notifications')
                setMenuOpen(false)
              }}
            >
              <Bell size={24} />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            <button
              className="icon-btn menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={24} />
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
              <span className="icon"><LogOut size={20} /></span>
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
                  {tab.label === 'Notifications' && unreadCount > 0 && (
                    <span className="sidebar-badge">{unreadCount}</span>
                  )}
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
                <LogOut size={16} style={{ marginRight: '8px' }} />
                Logout
              </button>
            </div>
          </aside>
        )}

        {/* Page Content */}
        <main className="page-content">
          {children}

          {/* Floating AI Chat Button */}
          {isPatient && location.pathname !== '/patient/symptom-checker' && (
            <button
              className="floating-ai-btn"
              onClick={() => navigate('/patient/symptom-checker')}
              title="AI Symptom Checker"
            >
              <Sparkles className="ai-sparkle" size={20} />
              <MessageCircle size={24} />
            </button>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="bottom-nav">
          {tabs
            .filter(tab => tab.label !== 'Symptom Checker' && tab.label !== 'Payments')
            .map((tab) => (
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
