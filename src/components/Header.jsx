import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Calendar, LogOut, Settings, ChevronDown, Bell } from 'lucide-react'
import '../styles/header.css'

const Header = ({ title, user, unreadCount }) => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <div className="user-menu">
          <button
            className="user-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="user-avatar-placeholder">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="user-photo" />
              ) : (
                <User size={20} />
              )}
            </div>
            <span className="user-name">{user?.name}</span>
            <ChevronDown size={16} />
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => { navigate('/patient/profile'); setMenuOpen(false); }}>
                <User size={16} /> Profile
              </button>
              <button className="dropdown-item" onClick={() => { navigate('/patient/appointments'); setMenuOpen(false); }}>
                <Calendar size={16} /> Appointments
              </button>
              <button className="dropdown-item" onClick={() => { navigate('/settings'); setMenuOpen(false); }}>
                <Settings size={16} /> Settings
              </button>
              <hr />
              <button className="dropdown-item logout-item" onClick={() => { setMenuOpen(false); /* logout handled by parent */ }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
