import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { formatPrice } from '../utils/currency'

const CATEGORY_ICONS = {
  'Real Estate': '🏠', 'Vehicles': '🚗', 'Electronics': '💻',
  'Jobs': '💼', 'Services': '🔧', 'Fashion': '👗',
  'Food & Drinks': '🍔', 'Other': '📦'
}

export default function Home() {
  const [adverts, setAdverts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [heroBg, setHeroBg] = useState(localStorage.getItem('dflex_bg') || '')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data))
    // Load hero background from server
    api.get('/settings').then(r => {
      if (r.data.hero_bg) {
        setHeroBg(r.data.hero_bg)
        localStorage.setItem('dflex_bg', r.data.hero_bg)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (categoryId) params.category_id = categoryId
    if (minPrice) params.min_price = minPrice
    if (maxPrice) params.max_price = maxPrice
    api.get('/adverts/', { params })
      .then(r => setAdverts(r.data))
      .finally(() => setLoading(false))
  }, [search, categoryId, minPrice, maxPrice])

  return (
    <div>
      {/* Chatbot Banner */}
      <div style={{ background: '#1a1a2e', color: 'white', padding: '1rem 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            🤖 Need help? Chat with our AI assistant →{' '}
            <a href="https://dflexchatbot.base44.app/" target="_blank" rel="noreferrer"
              style={{ color: '#e94560', fontWeight: 700, textDecoration: 'none' }}>
              dFlex Chatbot
            </a>
          </p>
        </div>
      </div>

      <div className="hero" style={heroBg ? {
        backgroundImage: `linear-gradient(rgba(26,26,46,0.75), rgba(26,26,46,0.75)), url(${heroBg})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
      } : {}}>
        <div className="container">
          <h1>Find the Best Adverts on dFlex</h1>
          <p>Browse thousands of listings across all categories on dflex.com</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search adverts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="filters">
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input type="number" placeholder="Min price" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{width: 120}} />
          <input type="number" placeholder="Max price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{width: 120}} />
          {(search || categoryId || minPrice || maxPrice) && (
            <button className="btn-outline" onClick={() => { setSearch(''); setCategoryId(''); setMinPrice(''); setMaxPrice('') }}>
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading adverts...</div>
        ) : adverts.length === 0 ? (
          <div className="empty-state">
            <p>No adverts found.</p>
          </div>
        ) : (
          <div className="adverts-grid">
            {adverts.map(ad => (
              <div key={ad.id} className="advert-card" onClick={() => navigate(`/advert/${ad.id}`)}>
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} />
                ) : (
                  <div className="card-img-placeholder">
                    {CATEGORY_ICONS[ad.category?.name] || '📢'}
                  </div>
                )}
                <div className="card-body">
                  {ad.category && <span className="category-tag">{ad.category.name}</span>}
                  <h3>{ad.title}</h3>
                  {ad.price != null && <div className="price">{formatPrice(ad.price, ad.currency)}</div>}
                  {ad.location && <div className="location">📍 {ad.location}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: '#1a1a2e', color: 'white', padding: '2rem 0', marginTop: '3rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ color: '#e94560', marginBottom: '0.75rem' }}>dFlex</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.6 }}>Nigeria's growing free business advert platform. Post, browse, and connect.</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '0.75rem', opacity: 0.9 }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[['Browse Adverts', '/'], ['Post Advert', '/post'], ['Pricing', '/pricing'], ['Register', '/register']].map(([label, href]) => (
                  <a key={label} href={href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '0.75rem', opacity: 0.9 }}>Our Services</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <a href="https://dflexchatbot.base44.app/" target="_blank" rel="noreferrer" style={{ color: '#e94560', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>🤖 dFlex AI Chatbot</a>
                <a href="/pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>💳 Subscription Plans</a>
                <a href="/pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>✅ Verified Badge</a>
                <a href="/pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem' }}>📢 Banner Advertising</a>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '0.75rem', opacity: 0.9 }}>Contact Us</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <a href="https://wa.me/2348109388210" target="_blank" rel="noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>💬 WhatsApp: +234 810 938 8210</a>
                <a href="mailto:davidzarch0@gmail.com" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>📧 davidzarch0@gmail.com</a>
                <a href="https://facebook.com/Dflex" target="_blank" rel="noreferrer" style={{ color: '#1877F2', textDecoration: 'none' }}>📘 Facebook: Dflex</a>
                <a href="https://tiktok.com/@Dflex" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>🎵 TikTok: @Dflex</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.6 }}>
            © 2025 dFlex — Nigeria's Free Business Advert Platform | <a href="https://dflexchatbot.base44.app/" target="_blank" rel="noreferrer" style={{ color: '#e94560', textDecoration: 'none' }}>AI Chatbot</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
