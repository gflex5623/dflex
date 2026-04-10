import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="container">
      <div className="form-page">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Login</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#e94560' }}>Register</Link>
        </p>
      </div>
    </div>
  )
}
