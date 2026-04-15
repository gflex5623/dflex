import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/currency'
import CommissionReport from '../components/CommissionReport'

function ShareButtons({ advertId, title, location }) {
  const [links, setLinks] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get(`/adverts/${advertId}/share`).then(r => setLinks(r.data))
  }, [advertId])

  const copy = () => {
    navigator.clipboard.writeText(links?.url || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!links) return null
  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: 10 }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: '#444' }}>📤 Share this advert:</p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <a href={links.whatsapp} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>WhatsApp</a>
        <a href={links.facebook} target="_blank" rel="noreferrer" style={{ background: '#1877F2', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>Facebook</a>
        <a href={links.twitter} target="_blank" rel="noreferrer" style={{ background: '#1DA1F2', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>Twitter/X</a>
        <a href={links.linkedin} target="_blank" rel="noreferrer" style={{ background: '#0A66C2', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>LinkedIn</a>
        <a href={links.telegram} target="_blank" rel="noreferrer" style={{ background: '#0088cc', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>Telegram</a>
        <button onClick={copy} style={{ background: copied ? '#38a169' : '#718096', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
          {copied ? '✓ Copied!' : '🔗 Copy Link'}
        </button>
      </div>
    </div>
  )
}

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
        {advert.video_url && (
          <video src={advert.video_url} controls style={{width:'100%',maxHeight:420,background:'#000',display:'block'}} />
        )}
        <div className="detail-body">
          {advert.category && (
            <span className="category-tag">{advert.category.name}</span>
          )}
          <h1>{advert.title}</h1>
          <div className="detail-meta">
            {advert.location && <span>📍 {advert.location}</span>}
            <span>👤 {advert.owner.name} {advert.owner.is_verified && <span title="Verified Business">✅</span>}</span>
            <span>📅 {new Date(advert.created_at).toLocaleDateString()}</span>
          </div>
          {advert.price != null && (
            <div className="detail-price">{formatPrice(advert.price, advert.currency)}</div>
          )}
          <p className="detail-description">{advert.description}</p>
          {advert.contact && (
            <div className="contact-box">
              <strong>Contact:</strong> {advert.contact}
            </div>
          )}
          <CommissionReport advertId={advert.id} advertTitle={advert.title} />
          <ShareButtons advertId={advert.id} title={advert.title} location={advert.location} />
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
