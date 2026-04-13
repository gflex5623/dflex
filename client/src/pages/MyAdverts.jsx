import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/currency'

export default function MyAdverts() {
  const [adverts, setAdverts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/adverts/my')
      .then(r => setAdverts(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this advert?')) return
    await api.delete(`/adverts/${id}`)
    setAdverts(adverts.filter(a => a.id !== id))
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="container my-adverts">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>My Adverts</h2>
        <button className="btn-primary" onClick={() => navigate('/post')}>+ Post New</button>
      </div>
      {adverts.length === 0 ? (
        <div className="empty-state">
          <p>You haven't posted any adverts yet.</p>
          <button className="btn-primary" onClick={() => navigate('/post')}>Post Your First Advert</button>
        </div>
      ) : (
        <div className="adverts-grid">
          {adverts.map(ad => (
            <div key={ad.id} className="advert-card">
              <div onClick={() => navigate(`/advert/${ad.id}`)}>
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} />
                ) : (
                  <div className="card-img-placeholder">📢</div>
                )}
                <div className="card-body">
                  {ad.category && <span className="category-tag">{ad.category.name}</span>}
                  <h3>{ad.title}</h3>
                  {ad.price != null && <div className="price">{formatPrice(ad.price, ad.currency)}</div>}
                  {ad.location && <div className="location">📍 {ad.location}</div>}
                </div>
              </div>
              <div className="advert-actions" style={{ padding: '0 1rem 1rem' }}>
                <button className="btn-outline btn-sm" onClick={() => navigate(`/edit/${ad.id}`)}>Edit</button>
                <button className="btn-danger btn-sm" onClick={() => handleDelete(ad.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
