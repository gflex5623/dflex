import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

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
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data))
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
      <div className="hero">
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
                  {ad.price != null && <div className="price">${ad.price.toLocaleString()}</div>}
                  {ad.location && <div className="location">📍 {ad.location}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
