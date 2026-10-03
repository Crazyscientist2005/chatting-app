import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import axiosInstance from './lib/axios'
import useStore from './lib/store'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chat from './pages/Chat'
import Profile from './pages/Profile'

// Protected route — redirects to /login when not authenticated
function ProtectedRoute({ children }) {
  const user = useStore((s) => s.user)
  const isCheckingAuth = useStore((s) => s.isCheckingAuth)
  if (isCheckingAuth) return null
  return user ? children : <Navigate to="/login" replace />
}

// Public-only route — redirects authenticated users to /chat
function PublicRoute({ children }) {
  const user = useStore((s) => s.user)
  const isCheckingAuth = useStore((s) => s.isCheckingAuth)
  if (isCheckingAuth) return null
  return !user ? children : <Navigate to="/chat" replace />
}

export default function App() {
  const { setUser, setIsCheckingAuth } = useStore()

  // On mount: verify existing JWT cookie
  useEffect(() => {
    axiosInstance
      .get('/auth/check')
      .then(({ data }) => setUser(data.user))
      .catch(() => {})
      .finally(() => setIsCheckingAuth(false))
  }, [setUser, setIsCheckingAuth])

  const isCheckingAuth = useStore((s) => s.isCheckingAuth)

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: 'hsl(var(--b1))', color: 'hsl(var(--bc))' },
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route
          path="/signup"
          element={<PublicRoute><Signup /></PublicRoute>}
        />
        <Route
          path="/login"
          element={<PublicRoute><Login /></PublicRoute>}
        />
        <Route
          path="/chat"
          element={<ProtectedRoute><Chat /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
