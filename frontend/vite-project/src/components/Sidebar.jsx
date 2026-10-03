import { useEffect, useState } from 'react'
import { Users, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'
import { getSocket } from '../lib/socket'

export default function Sidebar() {
  const { setSelectedUser, selectedUser, onlineUsers, setOnlineUsers } = useStore()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)

  // Fetch contacts
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

  // Subscribe to online users via socket
  useEffect(() => {
    const s = getSocket()
    if (!s) return
    const handler = (users) => setOnlineUsers(users)
    s.on('onlineUsers', handler)
    return () => s.off('onlineUsers', handler)
  }, [setOnlineUsers])

  const filtered = showOnlineOnly
    ? contacts.filter((c) => onlineUsers.includes(c._id))
    : contacts

  return (
    <div className="w-64 lg:w-72 flex flex-col border-r border-base-300 bg-base-100">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-base-300">
        <Users className="w-5 h-5" />
        <span className="font-semibold">Contacts</span>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-base-300">
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-xs checkbox-primary"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
          />
          <span className="text-xs">Online only</span>
        </label>
        <span className="text-xs text-base-content/40 ml-auto">
          {onlineUsers.length} online
        </span>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs text-base-content/40 mt-6">
            {showOnlineOnly ? 'No online contacts' : 'No contacts found'}
          </p>
        ) : (
          filtered.map((contact) => {
            const isOnline = onlineUsers.includes(contact._id)
            const isSelected = selectedUser?._id === contact._id
            return (
              <button
                key={contact._id}
                onClick={() => setSelectedUser(contact)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors ${
                  isSelected ? 'bg-base-200 ring-inset ring-1 ring-primary' : ''
                }`}
              >
                <div className="relative">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src={
                          contact.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            contact.fullName || contact.email
                          )}&background=random`
                        }
                        alt={contact.fullName}
                      />
                    </div>
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-base-100" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className="font-medium text-sm truncate">
                    {contact.fullName || contact.email}
                  </p>
                  <p className="text-xs text-base-content/50">
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
