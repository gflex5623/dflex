import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function AdvertDetail() {
  const { id } = useParams()
  const [advert, setAdvert] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/adverts/${id}`)
      .then(r => setAdvert(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this advert?')) return
    await api.delete(`/adverts/${id}`)
    navigate('/my-adverts')
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!advert) return null

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="advert-detail">
        {advert.image_url && <img src={advert.image_url} alt={advert.title} />}
        <div className="detail-body">
          {advert.category && (
            <span className="category-tag">{advert.category.name}</span>
          )}
          <h1>{advert.title}</h1>
          <div className="detail-meta">
            {advert.location && <span>📍 {advert.location}</span>}
            <span>👤 {advert.owner.name}</span>
            <span>📅 {new Date(advert.created_at).toLocaleDateString()}</span>
          </div>
          {advert.price != null && (
            <div className="detail-price">${advert.price.toLocaleString()}</div>
          )}
          <p className="detail-description">{advert.description}</p>
          {advert.contact && (
            <div className="contact-box">
              <strong>Contact:</strong> {advert.contact}
            </div>
          )}
          {user && user.id === advert.owner.id && (
            <div className="advert-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn-primary btn-sm" onClick={() => navigate(`/edit/${advert.id}`)}>Edit</button>
              <button className="btn-danger btn-sm" onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
