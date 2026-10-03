import { useEffect, useState } from 'react'
import { Search, Settings, LogOut } from 'lucide-react'
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

  const getStatus = (contact) => {
    if (onlineUsers.includes(contact._id)) return 'Active Now'
    return 'Offline'
  }

  return (
    <div
      className="flex flex-col h-full flex-shrink-0"
      style={{ width: '280px', background: '#1e1f2f', borderRight: '1px solid #2a2b3d' }}
    >
      {/* Search bar */}
      <div className="p-4 pb-2">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: '#252638' }}
        >
          <Search size={16} style={{ color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent text-sm outline-none w-full"
            style={{ color: '#e5e7eb' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Online only toggle */}
      <div className="flex items-center justify-between px-4 py-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>Online Only</span>
          <span
            className="rounded-full inline-block"
            style={{ width: '8px', height: '8px', background: '#22c55e' }}
          />
        </div>
        <button
          onClick={() => setShowOnlineOnly((v) => !v)}
          className="relative inline-flex items-center rounded-full transition-colors"
          style={{
            width: '42px',
            height: '24px',
            background: showOnlineOnly ? '#6d28d9' : '#3b3d5c',
          }}
        >
          <span
            className="inline-block rounded-full bg-white transition-transform"
            style={{
              width: '18px',
              height: '18px',
              transform: showOnlineOnly ? 'translateX(21px)' : 'translateX(3px)',
            }}
          />
        </button>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs py-8" style={{ color: '#6b7280' }}>
            {showOnlineOnly ? 'No contacts online' : 'No contacts found'}
          </p>
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
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                style={{
                  background: isSelected ? '#252638' : 'transparent',
                  borderLeft: isSelected ? '3px solid #6d28d9' : '3px solid transparent',
                }}
              >
                {/* Avatar with online dot */}
                <div className="relative flex-shrink-0">
                  {contact.avatarUrl ? (
                    <img
                      src={contact.avatarUrl}
                      alt={name}
                      className="rounded-full object-cover"
                      style={{ width: '42px', height: '42px' }}
                    />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{
                        width: '42px',
                        height: '42px',
                        background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  {isOnline && (
                    <span
                      className="absolute bottom-0 right-0 rounded-full border-2"
                      style={{
                        width: '11px',
                        height: '11px',
                        background: '#22c55e',
                        borderColor: '#1e1f2f',
                      }}
                    />
                  )}
                </div>

                {/* Name + status */}
                <div className="text-left min-w-0 flex-1">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: isSelected ? '#fff' : '#e5e7eb' }}
                  >
                    {name}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: isOnline ? '#22c55e' : '#6b7280' }}>
                    {getStatus(contact)}
                  </p>
                </div>

                {/* Online indicator dot on right */}
                {isOnline && (
                  <span
                    className="rounded-full flex-shrink-0"
                    style={{ width: '8px', height: '8px', background: '#22c55e' }}
                  />
                )}
              </button>
            )
          })
        )}
      </div>

      {/* User profile & logout bar at bottom */}
      {user && (
        <div
          className="p-3 flex items-center justify-between border-t"
          style={{ background: '#191a27', borderColor: '#2a2b3d' }}
        >
          <Link to="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity">
            <div
              className="rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              }}
            >
              {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.fullName || 'My Account'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/profile"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Profile Settings"
            >
              <Settings size={16} />
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
