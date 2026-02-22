import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { doctorAPI } from '../services/apiClient'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import '../styles/profile.css'

const DoctorProfile = () => {
  const { user, logout, updateUser } = useAuth()
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    specialization: user?.specialization || '',
    licenseNumber: user?.licenseNumber || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await doctorAPI.updateProfile(profileData)
      updateUser(response.data)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar userRole="doctor" onLogout={logout} />
      <div className="dashboard-content">
        <Header title="Doctor Profile" user={user} />
        
        <div className="dashboard-main">
          <div className="profile-card">
            <h2>Professional Information</h2>
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={profileData.specialization}
                    onChange={handleChange}
                    placeholder="Your specialization"
                  />
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={profileData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Medical license number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    placeholder="Your contact number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    placeholder="Write about yourself..."
                    rows="5"
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" disabled={loading} className="save-button">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
