import { useState, useRef } from 'react'

const CLOUD_NAME = 'dneyg9kaw'
const UPLOAD_PRESET = 'dflex_uploads'

export default function VideoUpload({ onUpload, currentVideo }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentVideo || null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 100 * 1024 * 1024) {
      setError('Video must be under 100MB')
      return
    }
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file')
      return
    }
    setError(''); setUploading(true); setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('resource_type', 'video')

    try {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText)
        if (data.secure_url) {
          setPreview(data.secure_url)
          onUpload(data.secure_url)
        } else {
          setError('Upload failed. Check your Cloudinary preset allows video.')
        }
        setUploading(false)
      }
      xhr.onerror = () => { setError('Upload failed. Try again.'); setUploading(false) }
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`)
      xhr.send(formData)
    } catch {
      setError('Upload failed.'); setUploading(false)
    }
  }

  return (
    <div className="video-upload">
      <div className={`upload-area ${uploading ? 'uploading' : ''}`} onClick={() => !uploading && inputRef.current.click()}>
        {preview ? (
          <video src={preview} controls className="video-preview" />
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">🎥</span>
            <p>{uploading ? `Uploading... ${progress}%` : 'Click to upload video'}</p>
            <small>MP4, MOV, AVI — max 100MB</small>
          </div>
        )}
        {uploading && (
          <div className="upload-progress-bar">
            <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {preview && !uploading && (
        <button type="button" className="btn-remove-img" onClick={() => { setPreview(null); onUpload('') }}>
          ✕ Remove video
        </button>
      )}
      {error && <p className="error-msg">{error}</p>}
      <input ref={inputRef} type="file" accept="video/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  )
}
