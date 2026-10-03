import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Settings, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, clearUser } = useStore()

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout')
      clearUser()
      toast.success('Logged out')
      navigate('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <header className="bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between z-10">
      {/* Brand */}
      <Link to="/chat" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <span className="text-lg font-bold">ChatApp</span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link to="/profile" className="btn btn-ghost btn-sm gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Profile</span>
        </Link>
        {user && (
          <button onClick={handleLogout} className="btn btn-ghost btn-sm gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  )
}
