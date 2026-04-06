import { useContext, useState } from 'react'
import { AuthContext, ThemeContext } from '../App'
import { Sun, Moon, Bell, Lock, User, Globe, LogOut, Trash2, Save } from 'lucide-react'
import { auth as authApi, users as usersApi } from '../services/api'
import { useNavigate } from 'react-router-dom'
import './StaticPages.css'

export default function SettingsPage() {
  const { user, setUser, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '',
    country: user?.country || '',
    bio: user?.bio || '',
  })

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const data = await usersApi.updateMe(form)
      setUser(data.user)
      setSuccess('Settings saved!')
    } catch (err) {
      setError(err.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/')
  }

  return (
    <div className="static-page">
      <div className="static-hero" style={{ paddingBottom: 'var(--space-xl)' }}>
        <h1 className="hd-heading">Settings</h1>
        <p className="static-lead" style={{ fontSize: '1rem' }}>
          Manage your account and preferences
        </p>
      </div>

      <div className="static-content page-container settings-layout">

        {/* Profile Settings */}
        <div className="settings-card hd-card">
          <div className="settings-card-header">
            <User size={20} />
            <h2 className="hd-heading">Profile Information</h2>
          </div>
          <form onSubmit={handleSave} className="settings-form">
            <div className="form-group">
              <label className="form-label hd-subheading">Display Name</label>
              <input
                name="name"
                type="text"
                className="form-input-hd"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label hd-subheading">Country</label>
              <input
                name="country"
                type="text"
                className="form-input-hd"
                placeholder="India"
                value={form.country}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label hd-subheading">Bio</label>
              <textarea
                name="bio"
                className="form-input-hd"
                rows={3}
                placeholder="A short bio about you..."
                value={form.bio}
                onChange={handleChange}
              />
            </div>
            {success && <p className="settings-success">✅ {success}</p>}
            {error   && <p className="settings-error">❌ {error}</p>}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>

        {/* Appearance */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Globe size={20} />
            <h2 className="hd-heading">Appearance</h2>
          </div>
          <div className="settings-row">
            <div>
              <p className="settings-row-label">Theme</p>
              <p className="settings-row-sub">Switch between dark and light mode</p>
            </div>
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Lock size={20} />
            <h2 className="hd-heading">Account</h2>
          </div>
          <div className="settings-actions">
            <button className="btn btn-secondary" onClick={handleLogout} id="settings-logout">
              <LogOut size={16} /> Log Out
            </button>
            <button
              className="btn btn-danger"
              onClick={() => alert('To delete your account, email us at 23322147012@deshbhagatuniversity.in')}
              id="settings-delete"
            >
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
