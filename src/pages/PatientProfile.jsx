import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { patientAPI } from '../services/apiClient'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import '../styles/profile.css'

const PatientProfile = () => {
  const { user, logout, updateUser } = useAuth()
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bloodType: user?.bloodType || '',
    medicalHistory: user?.medicalHistory || '',
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
      const response = await patientAPI.updateProfile(profileData)
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
      <Sidebar userRole="patient" onLogout={logout} />
      <div className="dashboard-content">
        <Header title="Patient Profile" user={user} />
        
        <div className="dashboard-main">
          <div className="profile-card">
            <h2>Personal Information</h2>
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
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={profileData.age}
                    onChange={handleChange}
                    placeholder="Your age"
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
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
                <div className="form-group">
                  <label>Blood Type</label>
                  <select
                    name="bloodType"
                    value={profileData.bloodType}
                    onChange={handleChange}
                  >
                    <option value="">Select blood type</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    placeholder="Your address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Medical History</label>
                  <textarea
                    name="medicalHistory"
                    value={profileData.medicalHistory}
                    onChange={handleChange}
                    placeholder="Any previous medical conditions, allergies, etc."
                    rows="4"
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

export default PatientProfile
