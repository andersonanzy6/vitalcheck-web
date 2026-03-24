import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/apiClient'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setError('Invalid password reset link.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    setError('')

    if (!token) {
      setError('Reset token is missing.')
      return
    }

    if (!password || !confirmPassword) {
      setError('Please complete both fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await authAPI.resetPassword(token, password)
      setStatus('Password reset successful. Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.')
      console.error('Reset password error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Create a new password for your account.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          {status && <div className="success-message">{status}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-link">
          <a href="/login">Back to login</a>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordPage
