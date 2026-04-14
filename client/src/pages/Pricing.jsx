import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const PAYSTACK_PUBLIC_KEY = 'pk_test_9df68d4c4b89e5b3eaf97171f096c2152407e421'

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
    features: ['Unlimited adverts', 'Photo & video upload', '⭐ Featured badge', 'Top placement', 'Priority support']
  }
]

function loadPaystack() {
  return new Promise((resolve) => {
    if (window.PaystackPop) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.onload = resolve
    document.head.appendChild(s)
  })
}

export default function Pricing() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(null)
  const [msg, setMsg] = useState('')
  const [success, setSuccess] = useState('')

  // Handle return from Paystack redirect
  useEffect(() => {
    const ref = searchParams.get('reference') || searchParams.get('trxref')
    if (ref && user) {
      api.post('/payments/verify', { reference: ref })
        .then(r => {
          setSuccess(`✅ Payment successful! Your plan is now ${r.data.plan?.toUpperCase() || 'active'}.`)
        })
        .catch(() => setMsg('Payment verification failed. Contact support.'))
    }
  }, [])

  const pay = async (type, plan, amount, label) => {
    if (!user) { navigate('/login'); return }
    setLoading(type + plan); setMsg('')
    await loadPaystack()
    const ref = `dflex_${type}_${plan}_${Date.now()}`
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: amount * 100, // kobo
      ref,
      currency: 'NGN',
      metadata: { payment_type: type, plan, user_id: user.id },
      callback: async (response) => {
        try {
          const res = await api.post('/payments/verify', { reference: response.reference })
          setSuccess(`✅ ${label} activated successfully!`)
          // Refresh user data
          const me = await api.get('/auth/me')
          const token = localStorage.getItem('token')
          login(me.data, token)
        } catch {
          setMsg('Payment received but verification failed. Contact support.')
        }
        setLoading(null)
      },
      onClose: () => setLoading(null)
    })
    handler.openIframe()
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Pricing & Plans</h1>
        <p style={{ color: '#666' }}>Upgrade to reach more customers and grow your business</p>
        {user && <p style={{ color: '#e94560', fontWeight: 600, marginTop: '0.5rem' }}>
          Current plan: <strong>{user.plan?.toUpperCase() || 'FREE'}</strong>
          {user.is_verified && ' · ✅ Verified'}
        </p>}
      </div>

      {success && <div style={{ background: '#f0fff4', border: '1px solid #68d391', borderRadius: 8, padding: '1rem', color: '#276749', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 600 }}>{success}</div>}
      {msg && <p style={{ textAlign: 'center', color: '#e94560', marginBottom: '1rem' }}>{msg}</p>}

      {/* Subscription Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: 900, margin: '0 auto 3rem' }}>
        {PLANS.map(plan => (
          <div key={plan.key} style={{
            background: 'white', borderRadius: 12, padding: '2rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            border: plan.key === 'basic' ? '2px solid #e94560' : '2px solid transparent',
            position: 'relative'
          }}>
            {plan.key === 'basic' && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#e94560', color: 'white', padding: '2px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>POPULAR</div>
            )}
            <h2 style={{ color: plan.color, marginBottom: '0.5rem' }}>{plan.name}</h2>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
              {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
              {plan.price > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#888' }}>/month</span>}
            </div>
            <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
              {plan.features.map(f => <li key={f} style={{ padding: '0.4rem 0', color: '#444', fontSize: '0.9rem' }}>✅ {f}</li>)}
            </ul>
            <button
              className={plan.key === 'free' ? 'btn-outline' : 'btn-primary'}
              style={{ width: '100%', padding: '0.75rem' }}
              onClick={() => plan.price > 0 && pay('subscription', plan.key, plan.price, `${plan.name} Plan`)}
              disabled={loading === `subscription${plan.key}` || user?.plan === plan.key}
            >
              {user?.plan === plan.key ? '✓ Current Plan'
                : loading === `subscription${plan.key}` ? 'Processing...'
                : plan.key === 'free' ? 'Get Started'
                : `Subscribe — ₦${plan.price.toLocaleString()}/mo`}
            </button>
          </div>
        ))}
      </div>

      {/* Verification Badge */}
      <div style={{ maxWidth: 600, margin: '0 auto 2rem', background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
        <h2>Verified Business Badge</h2>
        <p style={{ color: '#666', margin: '0.75rem 0 1rem' }}>
          Get a verified badge on all your adverts. Build trust with buyers and stand out from the crowd.
        </p>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>
          ₦1,000 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#888' }}>one-time</span>
        </div>
        {user?.is_verified ? (
          <div style={{ color: '#276749', fontWeight: 600, fontSize: '1.1rem' }}>✅ Your account is verified!</div>
        ) : (
          <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}
            onClick={() => pay('verification', 'badge', 1000, 'Verified Badge')}
            disabled={loading === 'verificationbadge'}>
            {loading === 'verificationbadge' ? 'Processing...' : 'Get Verified — ₦1,000'}
          </button>
        )}
      </div>

      {/* Banner Advertising */}
      <div style={{ maxWidth: 600, margin: '0 auto 2rem', background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📢</div>
        <h2>Banner Advertising</h2>
        <p style={{ color: '#666', margin: '0.75rem 0 1rem' }}>
          Place your banner on the dFlex homepage and reach thousands of visitors daily.
        </p>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          ₦10,000 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#888' }}>/month</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
          Send your banner image and link to <strong>davidzarch0@gmail.com</strong> after payment.
        </p>
        <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}
          onClick={() => pay('banner', 'monthly', 10000, 'Banner Ad')}
          disabled={loading === 'bannermonthly'}>
          {loading === 'bannermonthly' ? 'Processing...' : 'Book Banner — ₦10,000/mo'}
        </button>
      </div>

      {/* Commission info */}
      <div style={{ maxWidth: 600, margin: '0 auto', background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤝</div>
        <h2>Transaction Commission</h2>
        <p style={{ color: '#666', margin: '0.75rem 0 1rem' }}>
          Completed a deal through dFlex? Report it and pay a small 2% commission to support the platform.
        </p>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>2% <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#888' }}>of deal value</span></div>
        <p style={{ fontSize: '0.85rem', color: '#888' }}>Commission button available on every advert page.</p>
      </div>
    </div>
  )
}
