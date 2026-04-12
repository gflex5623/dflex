import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError(''); setStatus('')
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setStatus(res.data.message || 'Reset link sent!')
      // Dev mode: show token if email not configured
      if (res.data.reset_token) {
        setStatus(`Email not configured. Use this link to reset: /reset-password?token=${res.data.reset_token}`)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="form-page">
        <h2>Forgot Password</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Enter your email and we'll send you a reset link.
        </p>
        {status ? (
          <div style={{ background: '#f0fff4', border: '1px solid #68d391', borderRadius: 8, padding: '1rem', color: '#276749', fontSize: '0.9rem' }}>
            {status}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: '#e94560' }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
