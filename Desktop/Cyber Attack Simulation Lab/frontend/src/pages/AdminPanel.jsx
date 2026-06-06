import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Database, BarChart3, BookOpen, Trash2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import api from '../lib/api.js'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#8b949e', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#8b949e', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats]         = useState(null)
  const [users, setUsers]         = useState([])
  const [sims, setSims]           = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [lessons, setLessons]     = useState([])
  const [loading, setLoading]     = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, simsRes, analyticsRes, lessonsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/simulations?limit=20'),
        api.get('/admin/analytics'),
        api.get('/lessons'),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data.users)
      setSims(simsRes.data.simulations)
      setAnalytics(analyticsRes.data)
      setLessons(lessonsRes.data.lessons)
    } catch { toast.error('Failed to load admin data') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const deleteUser = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(u => u.filter(u => u.id !== id))
      toast.success('User deleted')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete user') }
  }

  const toggleLesson = async (id) => {
    try {
      await api.patch(`/admin/lessons/${id}/toggle`)
      setLessons(ls => ls.map(l => l.id === id ? { ...l, is_active: l.is_active ? 0 : 1 } : l))
      toast.success('Lesson updated')
    } catch { toast.error('Failed to toggle lesson') }
  }

  const tabs = [
    { id: 'overview',   label: 'Overview',   icon: BarChart3 },
    { id: 'users',      label: 'Users',      icon: Users },
    { id: 'sims',       label: 'Simulations',icon: Shield },
    { id: 'lessons',    label: 'Lessons',    icon: BookOpen },
    { id: 'analytics',  label: 'Analytics',  icon: Database },
  ]

  const activityChart = {
    labels: analytics?.daily.slice(-14).map(d => d.date.slice(5)) || [],
    datasets: [
      { label: 'Simulations', data: analytics?.daily.slice(-14).map(d => d.simulations) || [], backgroundColor: 'rgba(0,245,255,0.6)', borderRadius: 4 },
      { label: 'Lessons',     data: analytics?.daily.slice(-14).map(d => d.lessons_completed) || [], backgroundColor: 'rgba(0,255,136,0.6)', borderRadius: 4 },
      { label: 'Registrations', data: analytics?.daily.slice(-14).map(d => d.registrations) || [], backgroundColor: 'rgba(255,204,0,0.6)', borderRadius: 4 },
    ],
  }

  if (loading) return (
    <div className="container section text-center" style={{ padding: '6rem' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 32, height: 32, border: '2px solid var(--clr-border)', borderTopColor: 'var(--clr-cyan)', borderRadius: '50%', margin: '0 auto 1rem' }} />
      <p className="text-muted font-mono text-sm">Loading admin panel...</p>
    </div>
  )

  return (
    <>
      <Helmet><title>Admin Panel – Cyber Attack Simulation Lab</title></Helmet>
      <div className="container section">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-xl" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="flex items-center gap-sm mb-sm">
              <span className="badge badge-red"><Shield size={10} /> Admin Access</span>
            </div>
            <h1 className="font-hud" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
              Admin <span className="text-gradient-cyan">Control Panel</span>
            </h1>
          </div>
          <button onClick={loadData} className="btn btn-ghost btn-sm" id="admin-refresh">
            <RefreshCw size={14} /> Refresh
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-sm mb-xl" style={{ flexWrap: 'wrap' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} id={`admin-tab-${id}`} onClick={() => setActiveTab(id)}
              className={activeTab === id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Users',     value: stats?.users,       color: 'var(--clr-cyan)' },
                { label: 'Students',        value: stats?.students,    color: 'var(--clr-green)' },
                { label: 'Simulations Run', value: stats?.simulations, color: 'var(--clr-yellow)' },
                { label: 'Active Lessons',  value: stats?.lessons,     color: 'var(--clr-orange)' },
                { label: 'Completions',     value: stats?.completions, color: 'var(--clr-red)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card p-lg">
                  <p className="text-xs text-muted mb-sm">{label}</p>
                  <p style={{ fontFamily: 'var(--font-hud)', fontSize: '1.8rem', color, lineHeight: 1 }}>{value ?? 0}</p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="glass-card p-lg">
              <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Recent Activity (7 days)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {stats?.recentActivity?.map(a => (
                  <div key={a.event_type} className="flex items-center justify-between glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{a.event_type}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--clr-cyan)', fontSize: '0.85rem' }}>{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-lg">
            <div className="flex items-center justify-between mb-lg">
              <h3 style={{ fontSize: '0.9rem' }}>All Users ({users.length})</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--clr-border)' }}>
                    {['Username', 'Email', 'Role', 'Score', 'Joined', 'Last Login', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--clr-text-3)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{u.username}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--clr-text-2)' }}>{u.email}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-cyan'}`} style={{ fontSize: '0.6rem' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--clr-cyan)' }}>{u.score}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--clr-text-3)', fontSize: '0.75rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--clr-text-3)', fontSize: '0.75rem' }}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        {u.role !== 'admin' && (
                          <button id={`delete-user-${u.id}`} onClick={() => deleteUser(u.id, u.username)}
                            className="btn btn-ghost btn-sm" style={{ padding: '0.3rem', color: 'var(--clr-red)' }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Simulations */}
        {activeTab === 'sims' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-lg">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Simulation History ({sims.length} recent)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--clr-border)' }}>
                    {['Type', 'User', 'Prevented', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--clr-text-3)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sims.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{s.simulation_type}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--clr-text-2)' }}>{s.username || 'Anonymous'}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        {s.prevented ? <span style={{ color: 'var(--clr-green)', fontSize: '0.75rem' }}>✓ Yes</span>
                          : <span style={{ color: 'var(--clr-red)', fontSize: '0.75rem' }}>✗ No</span>}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--clr-text-3)', fontSize: '0.75rem' }}>{new Date(s.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Lessons */}
        {activeTab === 'lessons' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-lg">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Manage Lessons</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {lessons.map(l => (
                <div key={l.id} className="flex items-center justify-between glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center gap-md">
                    <span className={`badge ${l.is_active ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.6rem' }}>{l.is_active ? 'Active' : 'Hidden'}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{l.title}</span>
                    <span className="text-xs text-muted">{l.category} · {l.difficulty}</span>
                  </div>
                  <button id={`toggle-lesson-${l.id}`} onClick={() => toggleLesson(l.id)} className="btn btn-ghost btn-sm">
                    {l.is_active ? <ToggleRight size={18} color="var(--clr-green)" /> : <ToggleLeft size={18} color="var(--clr-text-3)" />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-lg mb-lg">
              <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Daily Activity (Last 14 days)</h3>
              <div className="chart-container">
                <Bar data={activityChart} options={{ ...chartOpts, plugins: { legend: { labels: { color: '#8b949e' } } } }} />
              </div>
            </div>
            <div className="glass-card p-lg">
              <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>All Event Types</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {analytics?.events.map(e => {
                  const total = analytics.events.reduce((s, ev) => s + ev.count, 0)
                  const pct = total > 0 ? Math.round((e.count / total) * 100) : 0
                  return (
                    <div key={e.event_type} className="flex items-center gap-md glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.6rem', minWidth: 140 }}>{e.event_type}</span>
                      <div className="progress-bar" style={{ flex: 1, height: 4 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--clr-cyan)', minWidth: 40, textAlign: 'right' }}>{e.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
