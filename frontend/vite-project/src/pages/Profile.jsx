import { useState, useRef } from 'react'
import { Camera, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'

export default function Profile() {
  const { user, setUser } = useStore()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB')
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)
    setUploading(true)
    try {
      const { data } = await axiosInstance.put('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser(data.user)
      toast.success('Profile photo updated!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#1a1b2e' }}>
      <div
        className="w-full rounded-2xl p-6 relative"
        style={{ maxWidth: '400px', background: '#1e1f2f', border: '1px solid #2a2b3d' }}
      >
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to chat
        </Link>

        <h2 className="text-xl font-bold text-white mb-6 text-center">My Profile</h2>

        <div className="flex flex-col items-center gap-4">
          {/* Avatar with Camera button */}
          <div className="relative">
            <div
              className="rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-2xl"
              style={{
                width: '96px',
                height: '96px',
                background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
                border: '3px solid #6d28d9',
              }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (user.fullName || user.email || 'U').charAt(0).toUpperCase()
              )}
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 rounded-full p-2 text-white shadow-lg transition-transform hover:scale-105"
              style={{ background: '#6d28d9' }}
            >
              <Camera size={16} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="text-center">
            <p className="font-bold text-lg text-white">{user.fullName || 'User'}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>

          <div className="w-full border-t my-2" style={{ borderColor: '#2a2b3d' }} />

          {/* Details */}
          <div className="w-full flex flex-col gap-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Account Status</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Member Since</span>
              <span className="text-gray-300">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
