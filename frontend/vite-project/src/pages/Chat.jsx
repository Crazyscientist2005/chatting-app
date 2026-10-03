import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Paperclip,
  Send,
  X,
  Phone,
  Video,
  Search,
  MoreVertical,
  ArrowLeft,
  Smile,
} from 'lucide-react'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'
import { getSocket } from '../lib/socket'
import Sidebar from '../components/Sidebar'
import MessageBubble from '../components/MessageBubble'

// Notification audio
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

  // Real-time socket message reception
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

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

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
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#0e1621' }}>
      {/* Sidebar: Full width on mobile when no chat is open, 320-360px on desktop */}
      <Sidebar />

      {/* Main Chat Area */}
      <div
        className={`flex-col flex-1 h-full overflow-hidden ${
          selectedUser ? 'flex w-full' : 'hidden md:flex'
        }`}
        style={{ background: '#0e1621' }}
      >
        {selectedUser ? (
          <>
            {/* Telegram Header */}
            <div
              className="flex items-center justify-between px-3 md:px-5 py-2.5 flex-shrink-0"
              style={{ background: '#17212b', borderBottom: '1px solid #0e1621' }}
            >
              {/* Left side: Back Arrow on Mobile + Avatar + Status */}
              <div className="flex items-center gap-2.5">
                {/* Mobile Back Button (Returns to chat list like Telegram) */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-1.5 rounded-full text-gray-300 hover:bg-[#242f3d] transition-colors"
                  title="Back to chats"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="relative">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedName}
                      className="rounded-full object-cover"
                      style={{ width: '42px', height: '42px' }}
                    />
                  ) : (
                    <div
                      className="rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        width: '42px',
                        height: '42px',
                        background: 'linear-gradient(135deg, #6c8db5, #2b5278)',
                      }}
                    >
                      {selectedName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {selectedIsOnline && (
                    <span
                      className="absolute bottom-0 right-0 rounded-full border-2"
                      style={{
                        width: '12px',
                        height: '12px',
                        background: '#4fae4e',
                        borderColor: '#17212b',
                      }}
                    />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-sm text-white leading-tight">
                    {selectedName}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: selectedIsOnline ? '#4fae4e' : '#7e8b99' }}
                  >
                    {selectedIsOnline ? 'online' : 'last seen recently'}
                  </p>
                </div>
              </div>

              {/* Right side: Telegram action icons */}
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#242f3d] transition-colors">
                  <Phone size={18} />
                </button>
                <button className="hidden sm:inline-flex p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#242f3d] transition-colors">
                  <Video size={18} />
                </button>
                <button className="hidden sm:inline-flex p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#242f3d] transition-colors">
                  <Search size={18} />
                </button>
                <button className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#242f3d] transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Telegram Messages Scroll Area */}
            <div
              className="flex-1 overflow-y-auto px-3 md:px-8 py-4 flex flex-col gap-3"
              style={{
                background: '#0e1621',
                backgroundImage: 'radial-gradient(circle at 50% 50%, #111a24 0%, #0e1621 100%)',
              }}
            >
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div
                    className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300"
                    style={{ background: '#182533' }}
                  >
                    No messages here yet... Say hello! 👋
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble key={msg._id} msg={msg} currentUserId={user._id} />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Image Preview before sending */}
            {imagePreview && (
              <div className="px-4 py-2 bg-[#17212b] border-t border-[#0e1621]">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="attachment"
                    className="rounded-lg object-cover"
                    style={{ width: '80px', height: '80px' }}
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 rounded-full flex items-center justify-center text-white shadow-md"
                    style={{ width: '22px', height: '22px', background: '#e53935' }}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Telegram Input Bar */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 px-3 md:px-6 py-3 flex-shrink-0"
              style={{ background: '#17212b', borderTop: '1px solid #0e1621' }}
            >
              {/* Attachment Icon */}
              <label
                className="p-2 text-gray-400 hover:text-white cursor-pointer rounded-full hover:bg-[#242f3d] transition-colors"
                title="Attach photo"
              >
                <Paperclip size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {/* Message Input Box */}
              <input
                type="text"
                placeholder="Write a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none text-white placeholder-gray-400"
                style={{ background: '#242f3d' }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={sending || (!text.trim() && !imageFile)}
                className="rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
                style={{
                  width: '42px',
                  height: '42px',
                  background:
                    text.trim() || imageFile
                      ? '#5288c1'
                      : '#242f3d',
                  color: text.trim() || imageFile ? '#ffffff' : '#6c7883',
                }}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </>
        ) : (
          /* Empty State (when no conversation is selected on desktop) */
          <div className="flex flex-col flex-1 items-center justify-center gap-3 select-none">
            <div
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-gray-400 shadow-sm"
              style={{ background: '#182533' }}
            >
              Select a chat to start messaging
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
