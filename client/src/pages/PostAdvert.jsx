import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import ImageUpload from '../components/ImageUpload'

export default function PostAdvert() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '',
    contact: '', image_url: '', category_id: '', currency: 'USD'
  })

  useEffect(() => {
    if (!user) navigate('/login')
    api.get('/categories/').then(r => setCategories(r.data))
    if (isEdit) {
      api.get(`/adverts/${id}`).then(r => {
        const a = r.data
        setForm({
          title: a.title, description: a.description,
          price: a.price ?? '', location: a.location ?? '',
          contact: a.contact ?? '', image_url: a.image_url ?? '',
          category_id: a.category?.id ?? '', currency: a.currency ?? 'USD'
        })
      })
    }
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      category_id: form.category_id ? parseInt(form.category_id) : null
    }
    try {
      if (isEdit) {
        await api.put(`/adverts/${id}`, payload)
      } else {
        await api.post('/adverts/', payload)
      }
      navigate('/my-adverts')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  return (
    <div className="container">
      <div className="form-page">
        <h2>{isEdit ? 'Edit Advert' : 'Post New Advert'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange}>
                <option value="USD">🇺🇸 USD — US Dollar</option>
                <option value="NGN">🇳🇬 NGN — Nigerian Naira</option>
                <option value="GBP">🇬🇧 GBP — British Pound</option>
                <option value="EUR">🇪🇺 EUR — Euro</option>
                <option value="GHS">🇬🇭 GHS — Ghanaian Cedi</option>
                <option value="KES">🇰🇪 KES — Kenyan Shilling</option>
                <option value="ZAR">🇿🇦 ZAR — South African Rand</option>
                <option value="CAD">🇨🇦 CAD — Canadian Dollar</option>
                <option value="AUD">🇦🇺 AUD — Australian Dollar</option>
                <option value="AED">🇦🇪 AED — UAE Dirham</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input name="contact" value={form.contact} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Photo</label>
            <ImageUpload
              currentImage={form.image_url}
              onUpload={(url) => setForm({ ...form, image_url: url })}
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            {isEdit ? 'Update Advert' : 'Post Advert'}
          </button>
        </form>
      </div>
    </div>
  )
}
