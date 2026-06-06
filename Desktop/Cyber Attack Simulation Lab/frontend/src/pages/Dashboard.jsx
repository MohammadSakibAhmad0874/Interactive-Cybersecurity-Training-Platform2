import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Trophy, BookOpen, Zap, Settings, Shield, LogOut, CheckCircle, Clock, BarChart3 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../lib/api.js'
import { useAuthStore } from '../store/index.js'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users/profile'),
      api.get('/lessons/progress/summary'),
    ]).then(([profileRes, progressRes]) => {
      setProfile(profileRes.data)
      setBio(profileRes.data.user.bio || '')
      setProgress(progressRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleSaveBio = async () => {
    try {
      const { data } = await api.put('/users/profile', { bio })
      updateUser({ bio: data.user.bio })
      setEditMode(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
  }

  const handleLogout = () => { logout(); navigate('/') }

  if (loading) return (
    <div className="container section text-center" style={{ padding: '6rem' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 32, height: 32, border: '2px solid var(--clr-border)', borderTopColor: 'var(--clr-cyan)', borderRadius: '50%', margin: '0 auto' }} />
    </div>
  )

  const { user: u, achievements, quizAttempts, recentSimulations } = profile || {}
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'progress', label: 'Progress', icon: BookOpen },
    { id: 'achievements', label: 'Badges', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      <Helmet><title>Dashboard – Cyber Attack Simulation Lab</title></Helmet>
      <div className="container section">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-xl mb-lg">
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="flex items-center gap-lg">
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--clr-cyan), var(--clr-green))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800, color: '#000',
              }}>
                {u?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{u?.username}</h1>
                <p className="text-muted text-sm">{u?.email}</p>
                <div className="flex items-center gap-sm mt-sm">
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>{u?.role}</span>
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                    <Trophy size={9} /> {u?.score} XP
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-sm">
              {u?.role === 'admin' && <Link to="/admin" className="btn btn-secondary btn-sm"><Shield size={14} /> Admin</Link>}
              <button onClick={handleLogout} className="btn btn-ghost btn-sm"><LogOut size={14} /> Sign Out</button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-sm mb-lg" style={{ flexWrap: 'wrap' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} id={`tab-${id}`} onClick={() => setActiveTab(id)}
              className={activeTab === id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'XP Score', value: u?.score, color: 'var(--clr-cyan)', icon: Zap },
                { label: 'Lessons Done', value: progress?.completedLessons, color: 'var(--clr-green)', icon: BookOpen },
                { label: 'Simulations', value: recentSimulations?.length, color: 'var(--clr-yellow)', icon: Shield },
                { label: 'Badges Earned', value: achievements?.length, color: 'var(--clr-orange)', icon: Trophy },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="glass-card p-lg">
                  <div className="flex items-center gap-sm mb-sm">
                    <Icon size={14} style={{ color }} />
                    <span className="text-xs text-muted">{label}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-hud)', fontSize: '1.8rem', color, lineHeight: 1 }}>{value ?? 0}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {progress && (
              <div className="glass-card p-lg mb-lg">
                <div className="flex items-center justify-between mb-md">
                  <h3 style={{ fontSize: '0.95rem' }}>Learning Progress</h3>
                  <span style={{ color: 'var(--clr-cyan)', fontFamily: 'var(--font-hud)', fontSize: '1.1rem' }}>{progress.completionPercentage}%</span>
                </div>
                <div className="progress-bar" style={{ height: 10 }}>
                  <motion.div className="progress-fill" initial={{ width: '0%' }} animate={{ width: `${progress.completionPercentage}%` }} transition={{ duration: 1.2 }} style={{ height: '100%' }} />
                </div>
                <p className="text-xs text-muted mt-sm">{progress.completedLessons} of {progress.totalLessons} lessons completed</p>
              </div>
            )}

            {/* Recent simulations */}
            <div className="glass-card p-lg">
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Recent Simulations</h3>
              {recentSimulations?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recentSimulations.map(s => (
                    <div key={s.id} className="flex items-center justify-between glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <div className="flex items-center gap-md">
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{s.simulation_type}</span>
                        <span className="text-xs text-muted">{new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                      {s.prevented ? <CheckCircle size={14} color="var(--clr-green)" /> : <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>Bypassed</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm text-center" style={{ padding: '2rem' }}>
                  No simulations yet. <Link to="/simulator" style={{ color: 'var(--clr-cyan)' }}>Try one now →</Link>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Achievements tab */}
        {activeTab === 'achievements' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="feature-grid">
              {achievements?.length > 0 ? achievements.map(a => (
                <div key={a.badge_id} className="glass-card p-lg text-center" style={{ borderColor: 'rgba(0,255,136,0.2)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{a.badge_name.split(' ')[0]}</div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{a.badge_name.slice(a.badge_name.indexOf(' ') + 1)}</h3>
                  <p className="text-xs text-muted">Earned {new Date(a.earned_at).toLocaleDateString()}</p>
                </div>
              )) : (
                <div className="text-center text-muted" style={{ gridColumn: '1/-1', padding: '4rem' }}>
                  <Trophy size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                  <p>No badges yet. Complete lessons and quizzes to earn them!</p>
                  <Link to="/learning" className="btn btn-primary btn-sm mt-lg">Start Learning</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-xl" style={{ maxWidth: 480 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Profile Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>Username</label>
                <input className="cyber-input" value={u?.username} disabled style={{ opacity: 0.6 }} />
              </div>
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>Email</label>
                <input className="cyber-input" value={u?.email} disabled style={{ opacity: 0.6 }} />
              </div>
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>Bio</label>
                <textarea id="profile-bio" className="cyber-input" rows={3} value={bio}
                  onChange={e => setBio(e.target.value)} placeholder="Tell others about yourself..." />
              </div>
              <button id="save-profile" onClick={handleSaveBio} className="btn btn-primary btn-sm">
                Save Changes
              </button>
              <div className="neon-divider" />
              <p className="text-xs text-muted">
                Member since: <span style={{ color: 'var(--clr-text-1)' }}>{new Date(u?.created_at).toLocaleDateString()}</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Progress tab */}
        {activeTab === 'progress' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-lg mb-lg">
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Category Progress</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {progress?.categoryProgress?.map(c => (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-sm">
                      <span className="text-sm">{c.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-xs text-muted">{c.completed_count}/{c.total}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: c.total > 0 ? `${(c.completed_count / c.total) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-lg">
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Quiz History</h3>
              {quizAttempts?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {quizAttempts.map(q => (
                    <div key={q.id} className="flex items-center justify-between glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <div className="flex items-center gap-md">
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{q.category}</span>
                        <span className="text-xs text-muted">{new Date(q.completed_at).toLocaleDateString()}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-hud)', color: q.score >= 70 ? 'var(--clr-green)' : 'var(--clr-red)', fontSize: '1rem' }}>
                        {q.score}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-sm text-center" style={{ padding: '2rem' }}>
                  No quizzes attempted. <Link to="/quiz" style={{ color: 'var(--clr-cyan)' }}>Take a quiz →</Link>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
