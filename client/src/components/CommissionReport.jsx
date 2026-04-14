import { useState } from 'react'
import api from '../api'

export default function CommissionReport({ advertId, advertTitle }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ buyer_name: '', buyer_email: '', deal_amount: '' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/commissions', {
        advert_id: advertId,
        buyer_name: form.buyer_name,
        buyer_email: form.buyer_email,
        deal_amount: parseFloat(form.deal_amount)
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to report deal')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return (
    <button className="btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => setOpen(true)}>
      💼 Report a Deal (2% commission)
    </button>
  )

  return (
    <div style={{ marginTop: '1.5rem', background: '#f9f9f9', borderRadius: 10, padding: '1.5rem', border: '1px solid #eee' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Report a Completed Deal</h3>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
        Completed a deal through this advert? Report it and pay a 2% commission to support dFlex.
      </p>
      {result ? (
        <div style={{ color: '#276749', background: '#f0fff4', padding: '1rem', borderRadius: 8 }}>
          ✅ Deal reported! Commission: <strong>₦{result.commission_amount?.toLocaleString()}</strong>
          <br /><small>Payment link will be sent to {form.buyer_email}</small>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <input value={form.buyer_name} onChange={e => setForm({...form, buyer_name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Your Email</label>
            <input type="email" value={form.buyer_email} onChange={e => setForm({...form, buyer_email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Deal Amount (₦)</label>
            <input type="number" value={form.deal_amount} onChange={e => setForm({...form, deal_amount: e.target.value})} required min="1" />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary btn-sm" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
            <button type="button" className="btn-outline btn-sm" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
