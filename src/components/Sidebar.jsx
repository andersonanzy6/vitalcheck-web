import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  Stethoscope,
  ClipboardList,
  MessageSquare,
  Bell
} from 'lucide-react'
import '../styles/sidebar.css'

const Sidebar = ({ userRole, onLogout }) => {
  const navigate = useNavigate()

  const location = useLocation();

  const doctorMenuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/doctor/home' },
    { label: 'Appointments', icon: <Calendar size={20} />, path: '/doctor/appointments' },
    { label: 'Messages', icon: <MessageSquare size={20} />, path: '/doctor/messages' },
    { label: 'Notifications', icon: <Bell size={20} />, path: '/doctor/notifications' },
    { label: 'Profile', icon: <User size={20} />, path: '/doctor/profile' },
  ]

  const patientMenuItems = [
    { label: 'Home', icon: <LayoutDashboard size={20} />, path: '/patient/home' },
    { label: 'Doctors', icon: <Stethoscope size={20} />, path: '/patient/doctors' },
    { label: 'Symptom Checker', icon: <ClipboardList size={20} />, path: '/patient/symptom-checker' },
    { label: 'Appointments', icon: <Calendar size={20} />, path: '/patient/appointments' },
    { label: 'Messages', icon: <MessageSquare size={20} />, path: '/patient/messages' },
    { label: 'Notifications', icon: <Bell size={20} />, path: '/patient/notifications' },
    { label: 'Profile', icon: <User size={20} />, path: '/patient/profile' },
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
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={20} />
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
