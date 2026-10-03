import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Paperclip, Send, X, Phone, Video, Search, MoreHorizontal } from 'lucide-react'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'
import { getSocket } from '../lib/socket'
import Sidebar from '../components/Sidebar'
import MessageBubble from '../components/MessageBubble'

// Short audio beep for notifications
const notifAudio = typeof Audio !== 'undefined'
  ? new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=')
  : null

export default function Chat() {
  const { user, selectedUser, setSelectedUser, messages, setMessages, addMessage, onlineUsers } = useStore()
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const bottomRef = useRef(null)

  // Fetch messages when contact is selected
  useEffect(() => {
    if (!selectedUser) return
    setMessages([])
    const fetchMessages = async () => {
      setLoadingMessages(true)
      try {
        const { data } = await axiosInstance.get(`/message/${selectedUser._id}`)
        setMessages(data.messages || data)
      } catch {
        toast.error('Could not load messages')
      } finally {
        setLoadingMessages(false)
      }
    }
    fetchMessages()
  }, [selectedUser, setMessages])

  // Real-time new messages
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const handler = (msg) => {
      if (selectedUser && msg.sender === selectedUser._id) {
        addMessage(msg)
        notifAudio?.play().catch(() => {})
      }
    }
    socket.on('newMessage', handler)
    return () => socket.off('newMessage', handler)
  }, [selectedUser, addMessage])

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => { setImageFile(null); setImagePreview(null) }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() && !imageFile) return
    setSending(true)
    try {
      const formData = new FormData()
      if (text.trim()) formData.append('text', text.trim())
      if (imageFile) formData.append('image', imageFile)
      const { data } = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      addMessage(data.message || data)
      setText('')
      removeImage()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const selectedName = selectedUser?.fullName || selectedUser?.email || ''
  const selectedIsOnline = selectedUser && onlineUsers.includes(selectedUser._id)

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#1a1b2e' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Chat area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div
              className="flex items-center justify-between px-5 py-3 flex-shrink-0"
              style={{ background: '#1e1f2f', borderBottom: '1px solid #2a2b3d', minHeight: '64px' }}
            >
              {/* Left: avatar + name + status */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedName}
                      className="rounded-full object-cover"
                      style={{ width: '40px', height: '40px' }}
                    />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center text-white font-semibold"
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
                      }}
                    >
                      {selectedName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {selectedIsOnline && (
                    <span
                      className="absolute bottom-0 right-0 rounded-full border-2"
                      style={{
                        width: '10px',
                        height: '10px',
                        background: '#22c55e',
                        borderColor: '#1e1f2f',
                      }}
                    />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{selectedName}</p>
                  <p className="text-xs" style={{ color: selectedIsOnline ? '#22c55e' : '#6b7280' }}>
                    {selectedIsOnline ? '● Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Right: action icons */}
              <div className="flex items-center gap-1">
                {[Phone, Video, Search, MoreHorizontal].map((Icon, i) => (
                  <button
                    key={i}
                    className="rounded-xl p-2 transition-colors"
                    style={{ background: 'transparent', color: '#9ca3af' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#252638')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4"
              style={{ background: '#1a1b2e' }}
            >
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <p className="text-sm" style={{ color: '#6b7280' }}>No messages yet</p>
                  <p className="text-xs" style={{ color: '#4b5563' }}>Say hi to {selectedName}! 👋</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble key={msg._id} msg={msg} currentUserId={user._id} />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="px-5 pb-2">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="rounded-xl object-cover"
                    style={{ width: '80px', height: '80px' }}
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 rounded-full flex items-center justify-center text-white"
                    style={{ width: '20px', height: '20px', background: '#ef4444', fontSize: '12px' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Input bar */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ background: '#1a1b2e', borderTop: '1px solid #2a2b3d' }}
            >
              {/* Attachment */}
              <label className="cursor-pointer flex-shrink-0" style={{ color: '#6b7280' }}>
                <Paperclip size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>

              {/* Text input */}
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 rounded-2xl px-5 py-3 text-sm outline-none text-white"
                style={{ background: '#252638', border: '1px solid #3b3d5c', color: '#e5e7eb' }}
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={sending || (!text.trim() && !imageFile)}
                className="rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
                style={{
                  width: '44px',
                  height: '44px',
                  background: '#6d28d9',
                  opacity: sending || (!text.trim() && !imageFile) ? 0.5 : 1,
                }}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={18} color="white" />
                )}
              </button>
            </form>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col flex-1 items-center justify-center gap-4" style={{ color: '#4b5563' }}>
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{ width: '64px', height: '64px', background: '#252638' }}
            >
              <Send size={28} color="#6d28d9" />
            </div>
            <p className="text-lg font-semibold" style={{ color: '#9ca3af' }}>Select a conversation</p>
            <p className="text-sm" style={{ color: '#6b7280' }}>Pick someone from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
