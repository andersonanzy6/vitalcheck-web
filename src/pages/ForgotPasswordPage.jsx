import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/apiClient'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    setError('')

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setStatus('A password reset link has been sent to your email. Please check your inbox.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset link. Please try again later.')
      console.error('Forgot password error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to receive a reset link.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          {status && <div className="success-message">{status}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-link">
          <a href="/login">Back to login</a>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
