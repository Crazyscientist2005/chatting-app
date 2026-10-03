import { useEffect, useState } from 'react'
import { Search, Settings, LogOut, CheckCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'
import { getSocket } from '../lib/socket'

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, clearUser, setSelectedUser, selectedUser, onlineUsers, setOnlineUsers } = useStore()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data } = await axiosInstance.get('/message/contacts')
        setContacts(data.users || data)
      } catch {
        toast.error('Could not load contacts')
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [])

  useEffect(() => {
    const s = getSocket()
    if (!s) return
    const handler = (users) => setOnlineUsers(users)
    s.on('onlineUsers', handler)
    return () => s.off('onlineUsers', handler)
  }, [setOnlineUsers])

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

  const filtered = contacts
    .filter((c) => (showOnlineOnly ? onlineUsers.includes(c._id) : true))
    .filter((c) =>
      (c.fullName || c.email).toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div
      className={`h-full flex-col flex-shrink-0 ${
        selectedUser ? 'hidden md:flex' : 'flex w-full'
      } md:w-[320px] lg:w-[360px]`}
      style={{ background: '#17212b', borderRight: '1px solid #0e1621' }}
    >
      {/* Top Bar with Search & Telegram Branding */}
      <div className="p-3.5 pb-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs"
              style={{ background: 'linear-gradient(135deg, #2b5278, #5288c1)' }}
            >
              TG
            </div>
            <span className="font-bold text-base text-white tracking-wide">Telegram</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: '#4fae4e' }}
              title="Real-time connected"
            />
            <span className="text-xs text-gray-400 font-medium">
              {onlineUsers.length} online
            </span>
          </div>
        </div>

        {/* Telegram-style Search Box */}
        <div
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
          style={{ background: '#242f3d' }}
        >
          <Search size={16} style={{ color: '#7e8b99' }} />
          <input
            type="text"
            placeholder="Search contacts"
            className="bg-transparent text-sm outline-none w-full text-white placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Online Only Filter Chip */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#202b36' }}>
        <span className="text-xs font-semibold text-gray-300">Online Users Only</span>
        <button
          onClick={() => setShowOnlineOnly((v) => !v)}
          className="relative inline-flex items-center rounded-full transition-colors"
          style={{
            width: '38px',
            height: '20px',
            background: showOnlineOnly ? '#5288c1' : '#2b3644',
          }}
        >
          <span
            className="inline-block rounded-full bg-white transition-transform"
            style={{
              width: '14px',
              height: '14px',
              transform: showOnlineOnly ? 'translateX(20px)' : 'translateX(3px)',
            }}
          />
        </button>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#202b36]/40">
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm text-gray-400">
              {showOnlineOnly ? 'No contacts online right now' : 'No contacts yet'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Invite your friends by sharing the app link!
            </p>
          </div>
        ) : (
          filtered.map((contact) => {
            const isOnline = onlineUsers.includes(contact._id)
            const isSelected = selectedUser?._id === contact._id
            const name = contact.fullName || contact.email
            const initials = name.charAt(0).toUpperCase()

            return (
              <button
                key={contact._id}
                onClick={() => setSelectedUser(contact)}
                className="w-full flex items-center gap-3 px-3.5 py-3 transition-colors text-left"
                style={{
                  background: isSelected ? '#2b5278' : 'transparent',
                }}
              >
                {/* Avatar with Telegram green online badge */}
                <div className="relative flex-shrink-0">
                  {contact.avatarUrl ? (
                    <img
                      src={contact.avatarUrl}
                      alt={name}
                      className="rounded-full object-cover"
                      style={{ width: '48px', height: '48px' }}
                    />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #6c8db5, #2b5278)',
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  {isOnline && (
                    <span
                      className="absolute bottom-0 right-0 rounded-full border-2"
                      style={{
                        width: '13px',
                        height: '13px',
                        background: '#4fae4e',
                        borderColor: '#17212b',
                      }}
                    />
                  )}
                </div>

                {/* Name & last status */}
                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-white truncate">{name}</p>
                    <span className="text-[11px] text-gray-400 ml-1">
                      {isOnline ? 'now' : ''}
                    </span>
                  </div>
                  <p
                    className="text-xs truncate mt-1 flex items-center gap-1"
                    style={{ color: isOnline ? '#4fae4e' : '#7e8b99' }}
                  >
                    {isOnline ? 'online' : 'offline'}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Telegram User Profile Bar at Bottom */}
      {user && (
        <div
          className="p-3 flex items-center justify-between border-t"
          style={{ background: '#141d26', borderColor: '#202b36' }}
        >
          <Link
            to="/profile"
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
          >
            <div
              className="rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #5288c1, #2b5278)',
              }}
            >
              {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user.fullName || 'My Account'}
              </p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/profile"
              className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Profile"
            >
              <Settings size={18} />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
