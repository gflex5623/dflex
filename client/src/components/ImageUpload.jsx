import { useState, useRef } from 'react'

const CLOUD_NAME = 'dneyg9kaw'
const UPLOAD_PRESET = 'dflex_uploads'

export default function ImageUpload({ onUpload, currentImage }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || null)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }
    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.secure_url) {
        setPreview(data.secure_url)
        onUpload(data.secure_url)
      } else {
        setError('Upload failed. Check your Cloudinary preset is set to Unsigned.')
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="image-upload">
      <div
        className={`upload-area ${uploading ? 'uploading' : ''}`}
        onClick={() => inputRef.current.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="upload-preview" />
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">📷</span>
            <p>{uploading ? 'Uploading...' : 'Click to upload photo'}</p>
            <small>JPG, PNG, WEBP — max 5MB</small>
          </div>
        )}
        {uploading && <div className="upload-spinner" />}
      </div>
      {preview && !uploading && (
        <button
          type="button"
          className="btn-remove-img"
          onClick={(e) => { e.stopPropagation(); setPreview(null); onUpload('') }}
        >
          ✕ Remove photo
        </button>
      )}
      {error && <p className="error-msg">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  )
}
