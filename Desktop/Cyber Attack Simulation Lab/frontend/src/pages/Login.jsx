import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/index.js'
import api from '../lib/api.js'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.user, data.token)
      toast.success(`Welcome back, ${data.user.username}!`)
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (role) => {
    setEmail(role === 'admin' ? 'admin@cyberlab.local' : 'demo@cyberlab.local')
    setPassword(role === 'admin' ? 'Admin@123' : 'Demo@123')
  }

  return (
    <>
      <Helmet><title>Login – Cyber Attack Simulation Lab</title></Helmet>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}>

          {/* Card */}
          <div className="glass-card p-xl">
            <div className="text-center mb-xl">
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--clr-cyan-dim)', border: '1px solid rgba(0,245,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Shield size={24} color="var(--clr-cyan)" />
              </div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
              <p className="text-muted text-sm">Sign in to access your cyber lab</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)' }} />
                  <input id="login-email" type="email" className="cyber-input" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="admin@cyberlab.local"
                    style={{ paddingLeft: 36 }} autoComplete="email" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)' }} />
                  <input id="login-password" type={showPw ? 'text' : 'password'} className="cyber-input" value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    style={{ paddingLeft: 36, paddingRight: 40 }} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                className="btn btn-primary w-full" id="login-submit" style={{ marginTop: '0.5rem' }}>
                {loading
                  ? <motion.div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  : <><LogIn size={16} /> Sign In</>}
              </motion.button>
            </form>

            {/* Demo accounts */}
            <div className="mt-lg" style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '1rem' }}>
              <p className="text-xs text-muted text-center mb-sm">Quick Demo Access</p>
              <div className="flex gap-sm">
                <button onClick={() => demoLogin('admin')} className="btn btn-ghost btn-sm" style={{ flex: 1 }} id="demo-admin">
                  Admin Demo
                </button>
                <button onClick={() => demoLogin('student')} className="btn btn-ghost btn-sm" style={{ flex: 1 }} id="demo-student">
                  Student Demo
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-muted mt-lg">
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--clr-cyan)', fontWeight: 600 }}>Create one free</Link>
            </p>
          </div>

          {/* Default creds hint */}
          <div className="glass-card p-md mt-md" style={{ borderColor: 'rgba(0,245,255,0.15)' }}>
            <p className="text-xs font-mono text-center text-muted">
              Default admin: <span style={{ color: 'var(--clr-cyan)' }}>admin@cyberlab.local</span> / <span style={{ color: 'var(--clr-cyan)' }}>Admin@123</span>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
