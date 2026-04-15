import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const ADMIN_EMAIL = 'davidzarch0@gmail.com'
const ADMIN_SECRET = 'dflex-admin-2024'
const CLOUD_NAME = 'dneyg9kaw'
const UPLOAD_PRESET = 'dflex_uploads'

function BgImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(localStorage.getItem('dflex_bg') || '')
  const [msg, setMsg] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setMsg('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.secure_url) {
        setPreview(data.secure_url)
        localStorage.setItem('dflex_bg', data.secure_url)
        // Save to backend settings
        await api.post('/admin/settings', { secret: ADMIN_SECRET, key: 'hero_bg', value: data.secure_url })
        setMsg('✅ Background image updated! Refresh the homepage to see it.')
      }
    } catch { setMsg('Upload failed. Try again.') }
    finally { setUploading(false) }
  }

  const remove = async () => {
    setPreview('')
    localStorage.removeItem('dflex_bg')
    await api.post('/admin/settings', { secret: ADMIN_SECRET, key: 'hero_bg', value: '' })
    setMsg('✅ Background image removed.')
  }

  return (
    <div>
      {preview && (
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <img src={preview} alt="Background" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }} />
          <button onClick={remove} style={{ position: 'absolute', top: 8, right: 8, background: '#e53e3e', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
        </div>
      )}
      <label style={{ display: 'inline-block', background: '#e94560', color: 'white', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
        {uploading ? 'Uploading...' : '📷 Upload Background Image'}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
      </label>
      {msg && <p style={{ marginTop: '0.5rem', color: msg.startsWith('✅') ? '#38a169' : '#e53e3e', fontSize: '0.85rem' }}>{msg}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [adverts, setAdverts] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) { navigate('/'); return }
    loadStats()
  }, [user])

  const loadStats = async () => {
    const r = await api.get(`/admin/stats?secret=${ADMIN_SECRET}`)
    setStats(r.data)
  }

  const loadUsers = async () => {
    setLoading(true)
    const r = await api.get(`/admin/users?secret=${ADMIN_SECRET}`)
    setUsers(r.data)
    setLoading(false)
  }

  const loadAdverts = async () => {
    setLoading(true)
    const r = await api.get(`/admin/adverts?secret=${ADMIN_SECRET}`)
    setAdverts(r.data)
    setLoading(false)
  }

  const upgradeUser = async (email, plan) => {
    await api.post('/admin/upgrade', { secret: ADMIN_SECRET, emails: [email], plan })
    setMsg(`✅ ${email} upgraded to ${plan}`)
    loadUsers()
  }

  const verifyUser = async (email) => {
    await api.post('/admin/verify', { secret: ADMIN_SECRET, email })
    setMsg(`✅ ${email} verified`)
    loadUsers()
  }

  const toggleAdvert = async (id, current) => {
    await api.post('/admin/edit-advert', { secret: ADMIN_SECRET, advert_id: id, is_active: !current })
    setMsg(`✅ Advert ${!current ? 'activated' : 'deactivated'}`)
    loadAdverts()
  }

  const deleteAdvert = async (id) => {
    if (!confirm('Delete this advert permanently?')) return
    await api.delete(`/admin/delete-advert/${id}?secret=${ADMIN_SECRET}`)
    setMsg('✅ Advert deleted')
    loadAdverts()
  }

  const filtered = (list, key) => list.filter(i =>
    (i[key] || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (!user || user.email !== ADMIN_EMAIL) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9' }}>
      <div style={{ background: '#1a1a2e', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem' }}>⚙️ dFlex Admin Dashboard</h1>
          <small style={{ opacity: 0.7 }}>Welcome, {user.name}</small>
        </div>
        <a href="/" style={{ color: '#e94560', textDecoration: 'none' }}>← Back to Site</a>
      </div>

      {msg && <div style={{ background: '#f0fff4', borderLeft: '4px solid #68d391', padding: '0.75rem 2rem', color: '#276749' }}>{msg} <button onClick={() => setMsg('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></div>}

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '0 2rem', display: 'flex', gap: '0.5rem' }}>
        {['stats', 'users', 'adverts'].map(t => (
          <button key={t} onClick={() => { setTab(t); t === 'users' ? loadUsers() : t === 'adverts' ? loadAdverts() : null }}
            style={{ padding: '1rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === t ? '3px solid #e94560' : '3px solid transparent', fontWeight: tab === t ? 700 : 400, color: tab === t ? '#e94560' : '#444', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>

        {/* Stats */}
        {tab === 'stats' && stats && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Users', value: stats.total_users, color: '#1a1a2e' },
                { label: 'Total Adverts', value: stats.total_adverts, color: '#e94560' },
                { label: 'Active Adverts', value: stats.active_adverts, color: '#38a169' },
                { label: 'Pro Users', value: stats.pro_users, color: '#d69e2e' },
                { label: 'Basic Users', value: stats.basic_users, color: '#3182ce' },
                { label: 'Verified Users', value: stats.verified_users, color: '#805ad5' },
                { label: 'Free Users', value: stats.free_users, color: '#718096' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: 10, padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: 10, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
              <h3>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <a href="/pricing" className="btn-primary" style={{ padding: '0.6rem 1.2rem', textDecoration: 'none' }}>💳 Pricing Page</a>
                <a href="/" className="btn-outline" style={{ padding: '0.6rem 1.2rem', textDecoration: 'none' }}>🏠 Browse Adverts</a>
                <a href="/post" className="btn-primary" style={{ padding: '0.6rem 1.2rem', textDecoration: 'none', background: '#1a1a2e' }}>➕ Post Advert</a>
                <a href="/my-adverts" className="btn-outline" style={{ padding: '0.6rem 1.2rem', textDecoration: 'none' }}>📋 My Adverts</a>
              </div>
            </div>

            {/* Payment & Upgrade */}
            <div style={{ background: 'white', borderRadius: 10, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>💰 Upgrade Users After Payment</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>After a user pays via Paystack, OPay, PalmPay, UBA, or Zenith — go to the <strong>Users</strong> tab and click the upgrade button next to their name.</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <button className="btn-primary" style={{ background: '#d69e2e' }} onClick={() => { setTab('users'); loadUsers(); }}>⬆ Upgrade to Pro (₦5,000)</button>
                <button className="btn-primary" style={{ background: '#3182ce' }} onClick={() => { setTab('users'); loadUsers(); }}>⬆ Upgrade to Basic (₦2,000)</button>
                <button className="btn-primary" style={{ background: '#38a169' }} onClick={() => { setTab('users'); loadUsers(); }}>✅ Verify User (₦1,000)</button>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 8, padding: '1rem', fontSize: '0.85rem' }}>
                <strong>Steps:</strong> Users tab → Search user → Click upgrade/verify button → Done ✓
              </div>
            </div>

            {/* Payment Dashboards */}
            <div style={{ background: 'white', borderRadius: 10, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>🏦 Payment Dashboards</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Paystack', url: 'https://dashboard.paystack.com', bg: '#00c3f7' },
                  { label: 'OPay Merchant', url: 'https://merchant.opay.ng', bg: '#1a8917' },
                  { label: 'PalmPay Business', url: 'https://business.palmpay.com', bg: '#00b14f' },
                  { label: 'UBA Internet Banking', url: 'https://ibank.ubagroup.com', bg: '#e31e24' },
                  { label: 'Zenith Internet Banking', url: 'https://ibank.zenithbank.com', bg: '#003087' },
                ].map(p => (
                  <a key={p.label} href={p.url} target="_blank" rel="noreferrer"
                    style={{ background: p.bg, color: 'white', padding: '0.6rem 1.2rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                    {p.label}
                  </a>
                ))}
              </div>
            </div>

            {/* App Management */}
            {/* App Management */}
            <div style={{ background: 'white', borderRadius: 10, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>🖼️ App Background Image</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Upload a background image for the homepage hero section. Use a high-quality image (1920×600px recommended).
              </p>
              <BgImageUpload />
            </div>

            <div style={{ background: 'white', borderRadius: 10, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ marginBottom: '1rem' }}>🔧 App Management</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Render Dashboard', url: 'https://dashboard.render.com' },
                  { label: 'GitHub Repo', url: 'https://github.com/gflex5623/dflex' },
                  { label: 'Cloudinary (Media)', url: 'https://cloudinary.com/console' },
                  { label: 'Google Search Console', url: 'https://search.google.com/search-console' },
                  { label: 'API Docs', url: 'https://dflex-fdya.onrender.com/docs' },
                  { label: 'Paystack Settings', url: 'https://dashboard.paystack.com/#/settings/developers' },
                ].map(l => (
                  <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="btn-outline"
                    style={{ padding: '0.5rem 1rem', textDecoration: 'none', fontSize: '0.85rem' }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>All Users ({users.length})</h2>
              <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #ddd', width: 250 }} />
            </div>
            {loading ? <div className="loading">Loading...</div> : (
              <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                      {['ID', 'Name', 'Email', 'Plan', 'Verified', 'Adverts', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#666' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered(users, 'name').map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#888' }}>{u.id}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.name}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: u.plan === 'pro' ? '#fef3c7' : u.plan === 'basic' ? '#ebf8ff' : '#f0f0f0', color: u.plan === 'pro' ? '#d69e2e' : u.plan === 'basic' ? '#3182ce' : '#666', padding: '2px 8px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                            {u.plan?.toUpperCase() || 'FREE'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>{u.is_verified ? '✅' : '—'}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{u.advert_count}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {u.plan !== 'pro' && <button onClick={() => upgradeUser(u.email, 'pro')} style={{ background: '#d69e2e', color: 'white', border: 'none', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}>→ Pro</button>}
                            {u.plan !== 'basic' && u.plan !== 'pro' && <button onClick={() => upgradeUser(u.email, 'basic')} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}>→ Basic</button>}
                            {!u.is_verified && <button onClick={() => verifyUser(u.email)} style={{ background: '#38a169', color: 'white', border: 'none', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}>Verify</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Adverts */}
        {tab === 'adverts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>All Adverts ({adverts.length})</h2>
              <input placeholder="Search adverts..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #ddd', width: 250 }} />
            </div>
            {loading ? <div className="loading">Loading...</div> : (
              <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                      {['ID', 'Title', 'Owner', 'Category', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#666' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered(adverts, 'title').map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#888' }}>{a.id}</td>
                        <td style={{ padding: '0.75rem 1rem', maxWidth: 300 }}>
                          <a href={`/advert/${a.id}`} style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '0.9rem' }}>{a.title.substring(0, 60)}{a.title.length > 60 ? '...' : ''}</a>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{a.owner}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{a.category}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ background: a.is_active ? '#f0fff4' : '#fff5f5', color: a.is_active ? '#38a169' : '#e53e3e', padding: '2px 8px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                            {a.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <a href={`/edit/${a.id}`} style={{ background: '#3182ce', color: 'white', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', textDecoration: 'none' }}>Edit</a>
                            <button onClick={() => toggleAdvert(a.id, a.is_active)} style={{ background: a.is_active ? '#718096' : '#38a169', color: 'white', border: 'none', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}>
                              {a.is_active ? 'Hide' : 'Show'}
                            </button>
                            <button onClick={() => deleteAdvert(a.id)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}>Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
