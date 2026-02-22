import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/header.css'

const Header = ({ title, user }) => {
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
            <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <span className="user-name">{user?.name}</span>
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { navigate('/patient/profile'); setMenuOpen(false); }}>
                👤 Profile
              </button>
              <button onClick={() => { navigate('/appointments'); setMenuOpen(false); }}>
                📅 Appointments
              </button>
              <hr />
              <button onClick={() => { setMenuOpen(false); /* logout handled by parent */ }}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
