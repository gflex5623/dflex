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
      <div style={{ maxWidth: 600, margin: '0 auto 2rem', background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤝</div>
        <h2>Transaction Commission</h2>
        <p style={{ color: '#666', margin: '0.75rem 0 1rem' }}>
          Completed a deal through dFlex? Report it and pay a small 2% commission to support the platform.
        </p>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>2% <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#888' }}>of deal value</span></div>
        <p style={{ fontSize: '0.85rem', color: '#888' }}>Commission button available on every advert page.</p>
      </div>

      {/* Manual Payment Methods */}
      <div style={{ maxWidth: 700, margin: '0 auto 2rem', background: 'white', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>💳 Pay via Bank Transfer / Mobile Money</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Prefer to pay directly? Transfer to any of the accounts below, then submit your payment proof.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { bank: 'OPay', icon: '🟢', number: '6110346055', name: 'David Ahmed' },
            { bank: 'PalmPay', icon: '🌴', number: '8990852086', name: 'David Ahmed' },
            { bank: 'UBA', icon: '🔴', number: '2087569669', name: 'Ahmed David' },
            { bank: 'Zenith Bank', icon: '🔵', number: '4297560296', name: 'David Ahmed' },
          ].map(acc => (
            <div key={acc.bank} style={{ background: '#f9f9f9', borderRadius: 10, padding: '1rem', border: '1px solid #eee' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{acc.icon} {acc.bank}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: 1, color: '#1a1a2e', marginBottom: '0.2rem' }}>{acc.number}</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>{acc.name}</div>
              <button
                style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                onClick={() => { navigator.clipboard.writeText(acc.number); }}
              >
                📋 Copy number
              </button>
            </div>
          ))}
        </div>

        <ManualPaymentForm user={user} navigate={navigate} setSuccess={setSuccess} setMsg={setMsg} />
      </div>
    </div>
  )
}

function ManualPaymentForm({ user, navigate, setSuccess, setMsg }) {
  const [form, setForm] = useState({ plan: 'basic', payment_method: 'OPay', amount: '', transaction_ref: '', screenshot_url: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const AMOUNTS = { basic: 2000, pro: 5000, verification: 1000, banner: 10000 }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setLoading(true)
    try {
      await api.post('/payments/manual', {
        ...form,
        amount: AMOUNTS[form.plan],
        user_email: user.email,
        user_name: user.name
      })
      setSent(true)
      setSuccess('✅ Payment submitted! Your account will be activated within 1 hour after confirmation.')
    } catch {
      setMsg('Submission failed. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div style={{ background: '#f0fff4', border: '1px solid #68d391', borderRadius: 8, padding: '1rem', color: '#276749', textAlign: 'center' }}>
      ✅ Payment proof submitted! We'll activate your account within 1 hour.<br />
      <small>Questions? Email: davidzarch0@gmail.com</small>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Submit Payment Proof</h3>
      <div className="form-row">
        <div className="form-group">
          <label>What are you paying for?</label>
          <select value={form.plan} onChange={e => setForm({...form, plan: e.target.value})}>
            <option value="basic">Basic Plan — ₦2,000/month</option>
            <option value="pro">Pro Plan — ₦5,000/month</option>
            <option value="verification">Verified Badge — ₦1,000</option>
            <option value="banner">Banner Ad — ₦10,000/month</option>
          </select>
        </div>
        <div className="form-group">
          <label>Payment Method Used</label>
          <select value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})}>
            <option>OPay</option>
            <option>PalmPay</option>
            <option>UBA</option>
            <option>Zenith Bank</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Transaction Reference / Receipt Number</label>
        <input value={form.transaction_ref} onChange={e => setForm({...form, transaction_ref: e.target.value})} required placeholder="e.g. TXN123456789" />
      </div>
      <div className="form-group">
        <label>Screenshot URL <span style={{color:'#888',fontSize:'0.8rem'}}>(optional — upload to imgbb.com or similar)</span></label>
        <input value={form.screenshot_url} onChange={e => setForm({...form, screenshot_url: e.target.value})} placeholder="https://..." />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Payment Proof'}
      </button>
    </form>
  )
}
