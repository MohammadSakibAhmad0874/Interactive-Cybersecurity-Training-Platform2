import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, User, Eye, EyeOff, UserPlus, CheckCircle, X } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store/index.js'
import api from '../lib/api.js'
import toast from 'react-hot-toast'

function PwRule({ met, text }) {
  return (
    <div className="flex items-center gap-sm">
      {met ? <CheckCircle size={11} color="var(--clr-green)" /> : <X size={11} color="var(--clr-text-3)" />}
      <span className="text-xs" style={{ color: met ? 'var(--clr-green)' : 'var(--clr-text-3)' }}>{text}</span>
    </div>
  )
}

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const pw = form.password
  const rules = [
    { met: pw.length >= 8,        text: 'At least 8 characters' },
    { met: /[A-Za-z]/.test(pw),  text: 'Contains a letter' },
    { met: /\d/.test(pw),        text: 'Contains a number' },
    { met: pw === form.confirmPassword && pw.length > 0, text: 'Passwords match' },
  ]
  const pwStrength = rules.filter(r => r.met).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rules.every(r => r.met)) return toast.error('Please meet all password requirements')
    if (form.username.length < 3) return toast.error('Username must be at least 3 characters')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        username: form.username, email: form.email, password: form.password,
      })
      login(data.user, data.token)
      toast.success('Account created! Welcome to Cyber Lab 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <>
      <Helmet><title>Register – Cyber Attack Simulation Lab</title></Helmet>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 440 }}>

          <div className="glass-card p-xl">
            <div className="text-center mb-xl">
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--clr-green-dim)', border: '1px solid rgba(0,255,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <UserPlus size={24} color="var(--clr-green)" />
              </div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h1>
              <p className="text-muted text-sm">Join the Cyber Attack Simulation Lab</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { field: 'username', type: 'text', icon: User, placeholder: 'cyberUser42', label: 'Username', auto: 'username' },
                { field: 'email', type: 'email', icon: Mail, placeholder: 'you@example.com', label: 'Email Address', auto: 'email' },
              ].map(({ field, type, icon: Icon, placeholder, label, auto }) => (
                <div key={field}>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)' }} />
                    <input id={`reg-${field}`} type={type} className="cyber-input" value={form[field]}
                      onChange={set(field)} placeholder={placeholder} style={{ paddingLeft: 36 }} autoComplete={auto} />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)' }} />
                  <input id="reg-password" type={showPw ? 'text' : 'password'} className="cyber-input" value={form.password}
                    onChange={set('password')} placeholder="Min 8 chars, letter + number"
                    style={{ paddingLeft: 36, paddingRight: 40 }} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength bar */}
                {pw && (
                  <div className="progress-bar mt-sm">
                    <div className="progress-fill" style={{ width: `${(pwStrength / 4) * 100}%`,
                      background: pwStrength < 2 ? 'var(--clr-red)' : pwStrength < 4 ? 'var(--clr-yellow)' : 'var(--clr-green)',
                      transition: 'all 0.3s' }} />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)' }} />
                  <input id="reg-confirm-password" type={showPw ? 'text' : 'password'} className="cyber-input" value={form.confirmPassword}
                    onChange={set('confirmPassword')} placeholder="Repeat password"
                    style={{ paddingLeft: 36 }} autoComplete="new-password" />
                </div>
              </div>

              {/* Password rules */}
              {pw && (
                <div className="glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {rules.map(r => <PwRule key={r.text} met={r.met} text={r.text} />)}
                </div>
              )}

              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                className="btn btn-primary w-full" id="register-submit" style={{ marginTop: '0.5rem' }}>
                {loading
                  ? <motion.div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  : <><UserPlus size={16} /> Create Account</>}
              </motion.button>
            </form>

            <p className="text-center text-sm text-muted mt-lg">
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--clr-cyan)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
