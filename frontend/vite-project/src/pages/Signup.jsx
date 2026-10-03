import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axios'
import useStore from '../lib/store'

export default function Signup() {
  const navigate = useNavigate()
  const setUser = useStore((s) => s.setUser)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.fullName.trim()) { toast.error('Full name is required'); return false }
    if (!form.email.trim()) { toast.error('Email is required'); return false }
    if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error('Enter a valid email'); return false }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/auth/signup', form)
      setUser(data.user)
      toast.success('Account created! Welcome 🎉')
      navigate('/chat')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Signup failed')
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
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-base-content/60 text-sm">Get started with a free account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Full Name</span></label>
              <div className="input input-bordered flex items-center gap-2">
                <User className="w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  className="grow"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

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
                  placeholder="Min 6 characters"
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
