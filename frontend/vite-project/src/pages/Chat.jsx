import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Image, Send, X, Loader2 } from 'lucide-react'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'
import { getSocket } from '../lib/socket'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import MessageBubble from '../components/MessageBubble'

// Notification sound (base64-encoded short beep)
const notifSound = new Audio(
  'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAA' +
  'EAAQARKwAAESsAAAEACABkYXRhAAAAAA=='
)

export default function Chat() {
  const { user, selectedUser, setSelectedUser, messages, setMessages, addMessage } = useStore()
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const bottomRef = useRef(null)

  // ── Fetch messages when contact selected ─────────────────────────────────
  useEffect(() => {
    if (!selectedUser) return
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

  // ── Real-time: listen for new messages ───────────────────────────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handler = (msg) => {
      if (selectedUser && msg.sender === selectedUser._id) {
        addMessage(msg)
        // play notification sound
        notifSound.play().catch(() => {})
      }
    }

    socket.on('newMessage', handler)
    return () => socket.off('newMessage', handler)
  }, [selectedUser, addMessage])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Image picker ─────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  // ── Send message ─────────────────────────────────────────────────────────
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
      toast.error(err?.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-base-200">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Chat area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-base-100 border-b border-base-300">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img
                      src={selectedUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.fullName || selectedUser.email)}&background=random`}
                      alt={selectedUser.fullName}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-semibold leading-none">{selectedUser.fullName || selectedUser.email}</p>
                  <p className="text-xs text-base-content/50 mt-0.5">
                    {useStore.getState().onlineUsers.includes(selectedUser._id) ? (
                      <span className="text-success">● Online</span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-base-content/40 mt-10">No messages yet. Say hi! 👋</p>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble key={msg._id} msg={msg} currentUserId={user._id} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="relative w-20 h-20 mx-4 mb-2">
                  <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Input bar */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 px-4 py-3 bg-base-100 border-t border-base-300"
              >
                <label className="cursor-pointer text-base-content/50 hover:text-primary transition-colors">
                  <Image className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                <input
                  type="text"
                  className="input input-bordered flex-1 input-sm"
                  placeholder="Type a message…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                <button
                  type="submit"
                  className="btn btn-primary btn-sm btn-circle"
                  disabled={sending || (!text.trim() && !imageFile)}
                >
                  {sending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-base-content/40 gap-3">
              <MessageSquare className="w-16 h-16 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Pick someone from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Inline import for the icon used in empty state
function MessageSquare(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
