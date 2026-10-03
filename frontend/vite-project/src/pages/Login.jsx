import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'

export default function Login() {
  const navigate = useNavigate()
  const setUser = useStore((s) => s.setUser)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/auth/login', form)
      setUser(data.user)
      toast.success('Welcome back! 👋')
      navigate('/chat')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#1a1b2e' }}>
      <div
        className="w-full rounded-2xl p-8"
        style={{ maxWidth: '400px', background: '#1e1f2f', border: '1px solid #2a2b3d' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{ width: '52px', height: '52px', background: '#6d28d9' }}
          >
            <MessageSquare size={26} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: '#9ca3af' }}>Email</label>
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: '#252638', border: '1px solid #3b3d5c' }}
            >
              <Mail size={16} color="#6b7280" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="bg-transparent text-sm outline-none flex-1 text-white"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: '#9ca3af' }}>Password</label>
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: '#252638', border: '1px solid #3b3d5c' }}
            >
              <Lock size={16} color="#6b7280" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Your password"
                className="bg-transparent text-sm outline-none flex-1 text-white"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}>
                {showPassword
                  ? <EyeOff size={16} color="#6b7280" />
                  : <Eye size={16} color="#6b7280" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity mt-2"
            style={{ background: '#6d28d9', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium" style={{ color: '#a78bfa' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
