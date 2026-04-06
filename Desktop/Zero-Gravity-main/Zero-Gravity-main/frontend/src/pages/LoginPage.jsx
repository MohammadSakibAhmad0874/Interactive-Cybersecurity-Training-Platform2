import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { auth as authApi } from '../services/api'
import './AuthPages.css'

// SVG Google icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

// Simulated Google account picker
const GOOGLE_ACCOUNTS = [
  { name: 'Alex Johnson', email: 'alex.johnson@gmail.com', avatar: 'AJ' },
  { name: 'Priya Sharma', email: 'priya.dev@gmail.com', avatar: 'PS' },
  { name: 'Marcus Chen', email: 'marcus.chen@gmail.com', avatar: 'MC' },
]

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showGooglePicker, setShowGooglePicker] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authApi.login(form)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (account) => {
    setGoogleLoading(true)
    setShowGooglePicker(false)
    setError('')
    try {
      const data = await authApi.googleAuth(account)
      login(data.token, data.user)
      navigate(data.isNew ? '/profile' : '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <div className="auth-icon">
            <LogIn size={24} />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your DevMatch account</p>
        </div>

        {/* Google OAuth Button */}
        <button
          className="btn-google"
          onClick={() => setShowGooglePicker(true)}
          disabled={googleLoading}
          id="google-login-btn"
        >
          <GoogleIcon />
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              id="login-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                id="login-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading} id="login-submit">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>

      {/* Google Account Picker Modal */}
      {showGooglePicker && (
        <div className="modal-overlay" onClick={() => setShowGooglePicker(false)}>
          <div className="modal-content google-picker-modal" onClick={e => e.stopPropagation()}>
            <div className="google-picker-header">
              <GoogleIcon />
              <h2>Choose an account</h2>
              <p>to continue to DevMatch</p>
            </div>
            <div className="google-picker-list">
              {GOOGLE_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  className="google-picker-item"
                  onClick={() => handleGoogleLogin(acc)}
                >
                  <div className="avatar avatar-sm" style={{ background: ['var(--gradient-primary)', 'var(--gradient-cool)', 'var(--gradient-warm)'][i] }}>
                    {acc.avatar.charAt(0)}
                  </div>
                  <div className="google-picker-info">
                    <span className="google-picker-name">{acc.name}</span>
                    <span className="google-picker-email">{acc.email}</span>
                  </div>
                </button>
              ))}
            </div>
            <button className="google-picker-other" onClick={() => setShowGooglePicker(false)}>
              Use another account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
