import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'
import Navbar from '../components/Navbar'

export default function Profile() {
  const { user, setUser } = useStore()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return }

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
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="card w-full max-w-sm bg-base-100 shadow-xl">
          <div className="card-body items-center gap-4">
            <h2 className="card-title">My Profile</h2>

            {/* Avatar */}
            <div className="relative">
              <div className="avatar">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-2">
                  <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.email)}&size=96&background=random`}
                    alt="avatar"
                  />
                </div>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 btn btn-circle btn-xs btn-primary"
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <p className="font-semibold text-lg">{user.fullName || 'User'}</p>
            <p className="text-base-content/60 text-sm">{user.email}</p>

            {/* Account info */}
            <div className="w-full divider my-0" />
            <div className="w-full flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-base-content/60">Member since</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/60">Account status</span>
                <span className="text-success font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
