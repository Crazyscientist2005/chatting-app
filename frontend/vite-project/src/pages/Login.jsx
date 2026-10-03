import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
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
    if (!form.email.trim() || !form.password.trim()) {
      toast.error('Please fill in all fields')
      return
    }
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
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-base-content/60 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Email</span></label>
              <div className="input input-bordered flex items-center gap-2">
                <Mail className="w-4 h-4 text-base-content/40" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="grow"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Password</span></label>
              <div className="input input-bordered flex items-center gap-2">
                <Lock className="w-4 h-4 text-base-content/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Your password"
                  className="grow"
                  value={form.password}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword
                    ? <EyeOff className="w-4 h-4 text-base-content/40" />
                    : <Eye className="w-4 h-4 text-base-content/40" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="link link-primary font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
