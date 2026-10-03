import { create } from 'zustand'
import { connectSocket, disconnectSocket } from './socket'

const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: null,
  isCheckingAuth: true,

  setUser: (user) => {
    set({ user })
    if (user) {
      connectSocket(user._id)
    }
  },

  clearUser: () => {
    disconnectSocket()
    set({ user: null })
  },

  setIsCheckingAuth: (val) => set({ isCheckingAuth: val }),

  // ── Online users ──────────────────────────────────────────────────────────
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),

  // ── Contacts ─────────────────────────────────────────────────────────────
  contacts: [],
  setContacts: (contacts) => set({ contacts }),

  // ── Active chat ───────────────────────────────────────────────────────────
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),

  // ── Messages ─────────────────────────────────────────────────────────────
  messages: [],
  setMessages: (messages) => set({ messages }),

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
}))

export default useStore
