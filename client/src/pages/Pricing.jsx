import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const PLANS = [
  {
    key: 'free', name: 'Free', price: 0, color: '#888',
    features: ['3 adverts/month', 'Photo upload', 'Basic listing']
  },
  {
    key: 'basic', name: 'Basic', price: 2000, color: '#e94560',
    features: ['10 adverts/month', 'Photo & video upload', 'Priority listing', 'Email support']
  },
  {
    key: 'pro', name: 'Pro', price: 5000, color: '#1a1a2e',
    features: ['Unlimited adverts', 'Photo & video upload', 'Featured badge ✓', 'Top placement', 'Priority support']
  }
]

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [msg, setMsg] = useState('')

  const handleSubscribe = async (plan) => {
    if (!user) { navigate('/login'); return }
    if (plan.key === 'free') return
    setLoading(plan.key); setMsg('')
    try {
      const res = await api.post('/payments/initialize', { type: 'subscription', plan: plan.key })
      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url
      }
    } catch (e) {
      setMsg('Payment initialization failed. Try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Choose Your Plan</h1>
        <p style={{ color: '#666' }}>Upgrade to post more adverts and reach more customers</p>
        {user && <p style={{ color: '#e94560', fontWeight: 600 }}>Current plan: {user.plan?.toUpperCase() || 'FREE'}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
        {PLANS.map(plan => (
          <div key={plan.key} style={{
            background: 'white', borderRadius: 12, padding: '2rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            border: plan.key === 'basic' ? '2px solid #e94560' : '2px solid transparent',
            position: 'relative'
          }}>
            {plan.key === 'basic' && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#e94560', color: 'white', padding: '2px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                POPULAR
              </div>
            )}
            <h2 style={{ color: plan.color, marginBottom: '0.5rem' }}>{plan.name}</h2>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
              {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
              {plan.price > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#888' }}>/month</span>}
            </div>
            <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
              {plan.features.map(f => (
                <li key={f} style={{ padding: '0.4rem 0', color: '#444', fontSize: '0.9rem' }}>
                  ✅ {f}
                </li>
              ))}
            </ul>
            <button
              className={plan.key === 'free' ? 'btn-outline' : 'btn-primary'}
              style={{ width: '100%', padding: '0.75rem', opacity: user?.plan === plan.key ? 0.5 : 1 }}
              onClick={() => handleSubscribe(plan)}
              disabled={loading === plan.key || user?.plan === plan.key}
            >
              {user?.plan === plan.key ? 'Current Plan' : loading === plan.key ? 'Processing...' : plan.key === 'free' ? 'Get Started' : `Subscribe — ₦${plan.price.toLocaleString()}/mo`}
            </button>
          </div>
        ))}
      </div>
      {msg && <p style={{ textAlign: 'center', color: '#e94560', marginTop: '1rem' }}>{msg}</p>}

      {/* Verification Badge */}
      <div style={{ maxWidth: 600, margin: '3rem auto 0', background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
        <h2>Verified Business Badge</h2>
        <p style={{ color: '#666', margin: '0.75rem 0 1.5rem' }}>
          Get a verified badge on all your adverts. Build trust with buyers and stand out from the crowd.
        </p>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>₦1,000 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#888' }}>one-time</span></div>
        {user?.is_verified ? (
          <div style={{ color: '#276749', fontWeight: 600 }}>✅ Your account is verified!</div>
        ) : (
          <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}
            onClick={async () => {
              if (!user) { navigate('/login'); return }
              setLoading('verify')
              try {
                const res = await api.post('/payments/initialize', { type: 'verification' })
                if (res.data.authorization_url) window.location.href = res.data.authorization_url
              } catch { setMsg('Failed. Try again.') }
              finally { setLoading(null) }
            }}
            disabled={loading === 'verify'}
          >
            {loading === 'verify' ? 'Processing...' : 'Get Verified — ₦1,000'}
          </button>
        )}
      </div>

      {/* Banner Advertising */}
      <div style={{ maxWidth: 600, margin: '2rem auto', background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📢</div>
        <h2>Banner Advertising</h2>
        <p style={{ color: '#666', margin: '0.75rem 0 1.5rem' }}>
          Place your banner on the dFlex homepage and reach thousands of visitors daily.
        </p>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>₦10,000 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#888' }}>/month</span></div>
        <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}
          onClick={() => { if (!user) navigate('/login'); else navigate('/advertise') }}>
          Advertise With Us
        </button>
      </div>
    </div>
  )
}
