/**
 * Analytics Dashboard
 * Charts, statistics, simulation history, and PDF report generation.
 * Uses Chart.js via react-chartjs-2. Falls back to a skeleton state while loading.
 */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  BarChart3, Download, FileText, TrendingUp, Shield,
  Database, Code, Lock, Zap, Activity, RefreshCw,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../lib/api.js'
import { useAuthStore } from '../store/index.js'
import toast from 'react-hot-toast'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler
)

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#8b949e', font: { family: 'Inter', size: 11 } } },
    tooltip: {
      backgroundColor: 'rgba(7,10,18,0.95)',
      borderColor: 'rgba(0,245,255,0.2)',
      borderWidth: 1,
      titleColor: '#f0f6fc',
      bodyColor: '#8b949e',
      cornerRadius: 8,
    },
  },
  scales: {
    x: { ticks: { color: '#484f58', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#484f58', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
}

const DOUGHNUT_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#8b949e', font: { family: 'Inter', size: 11 }, padding: 16, boxWidth: 12 },
    },
    tooltip: CHART_DEFAULTS.plugins.tooltip,
  },
}

function StatCard({ label, value, icon: Icon, color, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-lg"
    >
      <div className="flex items-center gap-sm mb-sm">
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-sm)',
          background: `${color}18`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-2)', fontWeight: 500 }}>{label}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-hud)', fontSize: '2.2rem', color, lineHeight: 1, marginBottom: 4 }}>
        {value ?? '–'}
      </p>
      {subtitle && <p style={{ fontSize: '0.72rem', color: 'var(--clr-text-3)' }}>{subtitle}</p>}
    </motion.div>
  )
}

export default function Analytics() {
  const { user } = useAuthStore()
  const [stats, setStats]     = useState(null)
  const [history, setHistory] = useState(null)
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('overview')
  const reportRef             = useRef(null)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const fetches = [
      api.get('/analytics/public'),
      api.get('/simulations/history'),
    ]
    if (isAdmin) fetches.push(api.get('/admin/analytics?days=30'), api.get('/admin/stats'))

    Promise.all(fetches).then(([pub, hist, adm, admStats]) => {
      setStats(pub.data)
      setHistory(hist.data)
      if (adm) setAdminData({ ...adm.data, ...(admStats?.data || {}) })
    }).catch(() => {
      toast.error('Could not load some analytics data')
    }).finally(() => setLoading(false))
  }, [isAdmin])

  // ── PDF / Print report ─────────────────────────────────────────────────────
  const printReport = () => {
    window.print()
  }

  // ── JSON export ────────────────────────────────────────────────────────────
  const exportJSON = () => {
    const payload = {
      exported:  new Date().toISOString(),
      user:      user?.username,
      stats,
      history:   history?.simulations,
      adminData,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `casl-analytics-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Analytics exported!')
  }

  // ── Chart data ─────────────────────────────────────────────────────────────
  const simsByType = (() => {
    if (!history?.simulations?.length) return null
    const counts = { 'sql-injection': 0, xss: 0, 'brute-force': 0 }
    history.simulations.forEach(s => { if (counts[s.simulation_type] !== undefined) counts[s.simulation_type]++ })
    return {
      labels: ['SQL Injection', 'XSS', 'Brute Force'],
      datasets: [{
        label: 'Simulations Run',
        data: Object.values(counts),
        backgroundColor: ['rgba(255,59,59,0.6)', 'rgba(255,204,0,0.6)', 'rgba(0,245,255,0.6)'],
        borderColor: ['#ff3b3b', '#ffcc00', '#00f5ff'],
        borderWidth: 1,
        borderRadius: 6,
      }],
    }
  })()

  const dailyChart = (() => {
    if (!adminData?.daily?.length) return null
    const days = adminData.daily.slice(-14)
    return {
      labels: days.map(d => new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'All Events',
          data: days.map(d => d.total),
          borderColor: '#00f5ff',
          backgroundColor: 'rgba(0,245,255,0.07)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#00f5ff',
        },
        {
          label: 'Simulations',
          data: days.map(d => d.simulations),
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0,255,136,0.05)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#00ff88',
        },
      ],
    }
  })()

  const eventsDoughnut = (() => {
    if (!adminData?.events?.length) return null
    const topEvents = adminData.events.slice(0, 6)
    const PALETTE   = ['#00f5ff', '#00ff88', '#ff3b3b', '#ffcc00', '#ff8800', '#8b949e']
    return {
      labels: topEvents.map(e => e.event_type.replace(/_/g, ' ')),
      datasets: [{
        data: topEvents.map(e => e.count),
        backgroundColor: PALETTE.map(c => c + '80'),
        borderColor: PALETTE,
        borderWidth: 1,
      }],
    }
  })()

  const preventionRate = (() => {
    if (!history?.simulations?.length) return null
    const prevented = history.simulations.filter(s => s.prevented).length
    const total     = history.simulations.length
    return total > 0 ? Math.round((prevented / total) * 100) : 100
  })()

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="container section">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-lg" style={{ height: 100 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: 12, borderRadius: 6, marginBottom: 12, width: '60%' }} />
            <div style={{ background: 'rgba(255,255,255,0.08)', height: 32, borderRadius: 6, width: '40%' }} />
          </div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview',  label: 'Overview',    icon: BarChart3 },
    { id: 'history',   label: 'Sim History', icon: Activity },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin View', icon: Shield }] : []),
  ]

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard – Cyber Attack Simulation Lab</title>
        <meta name="description" content="Track your simulation history, learning progress, and security metrics." />
      </Helmet>

      {/* Print-only header */}
      <div className="print-only" style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Cyber Attack Simulation Lab</h1>
        <p style={{ color: '#555' }}>Analytics Report — Generated {new Date().toLocaleString()}</p>
        <p style={{ color: '#555' }}>User: {user?.username} ({user?.role})</p>
        <hr style={{ margin: '1rem 0', borderColor: '#ddd' }} />
      </div>

      <div ref={reportRef} className="container section no-print-padding">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-xl">
          <div className="flex items-center gap-sm mb-md">
            <span className="badge badge-cyan"><BarChart3 size={10} /> Analytics</span>
            {isAdmin && <span className="badge badge-green">Admin View</span>}
          </div>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="font-hud" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.3rem' }}>
                Security <span className="text-gradient-cyan">Analytics</span>
              </h1>
              <p className="text-muted text-sm">Your simulation history, learning progress, and platform metrics.</p>
            </div>
            <div className="flex gap-sm no-print">
              <button onClick={exportJSON} className="btn btn-secondary btn-sm">
                <Download size={13} /> Export JSON
              </button>
              <button onClick={printReport} className="btn btn-ghost btn-sm">
                <FileText size={13} /> Print / PDF
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-sm mb-xl no-print" style={{ flexWrap: 'wrap' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} id={`analytics-tab-${id}`}
              onClick={() => setTab(id)}
              className={tab === id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ─────────────────────────────────────── */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard label="Total Simulations" value={stats?.totalSimulations ?? 0}     icon={Activity}  color="var(--clr-cyan)"   subtitle="All time" />
              <StatCard label="Threat Categories" value={stats?.threatCategories ?? 3}      icon={Shield}    color="var(--clr-green)"  subtitle="SQL · XSS · Brute Force" />
              <StatCard label="Learning Modules"  value={stats?.totalLessons ?? 0}           icon={TrendingUp}color="var(--clr-yellow)" subtitle="Active lessons" />
              <StatCard label="Prevention Rate"   value={preventionRate != null ? `${preventionRate}%` : 'N/A'} icon={Shield} color="var(--clr-green)" subtitle="Attacks prevented" />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Simulations by type */}
              <div className="glass-card p-lg">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>Simulations by Type</h3>
                {simsByType ? (
                  <div style={{ height: 200 }}>
                    <Bar data={simsByType} options={{ ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } } }} />
                  </div>
                ) : (
                  <div className="text-center p-xl text-muted" style={{ fontSize: '0.85rem' }}>
                    Run some simulations to see data here.
                  </div>
                )}
              </div>

              {/* Attack type distribution doughnut */}
              <div className="glass-card p-lg">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>Attack Type Distribution</h3>
                {simsByType ? (
                  <div style={{ height: 200 }}>
                    <Doughnut
                      data={{
                        labels: simsByType.labels,
                        datasets: [{
                          data: simsByType.datasets[0].data,
                          backgroundColor: ['rgba(255,59,59,0.7)', 'rgba(255,204,0,0.7)', 'rgba(0,245,255,0.7)'],
                          borderColor: ['#ff3b3b', '#ffcc00', '#00f5ff'],
                          borderWidth: 1,
                        }],
                      }}
                      options={DOUGHNUT_OPTS}
                    />
                  </div>
                ) : (
                  <div className="text-center p-xl text-muted" style={{ fontSize: '0.85rem' }}>
                    No simulation data yet.
                  </div>
                )}
              </div>
            </div>

            {/* Security score card */}
            <div className="glass-card p-xl" style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.04) 0%, rgba(0,255,136,0.04) 100%)',
              borderColor: 'rgba(0,245,255,0.15)',
            }}>
              <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-2)', marginBottom: 4 }}>Security Knowledge Score</p>
                  <p style={{ fontFamily: 'var(--font-hud)', fontSize: '3rem', color: 'var(--clr-cyan)', lineHeight: 1 }}>
                    {user?.score ?? 0} <span style={{ fontSize: '1.2rem' }}>XP</span>
                  </p>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-2)', marginBottom: 8 }}>How to earn more XP:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { label: 'Complete a lesson', xp: '+50 XP', color: 'var(--clr-green)' },
                      { label: 'Pass a quiz',        xp: '+10 XP/correct', color: 'var(--clr-cyan)' },
                      { label: 'Perfect quiz score', xp: '🎯 Badge', color: 'var(--clr-yellow)' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between"
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem', borderRadius: 6, background: 'rgba(255,255,255,0.04)' }}>
                        <span style={{ color: 'var(--clr-text-1)' }}>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 700 }}>{item.xp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Simulation History tab ─────────────────────────── */}
        {tab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-lg">
              <div className="flex items-center justify-between mb-lg">
                <h3 style={{ fontSize: '0.95rem' }}>Recent Simulations</h3>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {history?.simulations?.length ?? 0} total
                </span>
              </div>

              {history?.simulations?.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--clr-border)' }}>
                        {['Type', 'Mode/Payload', 'Prevented', 'Date'].map(h => (
                          <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--clr-text-3)', fontWeight: 600, fontSize: '0.75rem' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.simulations.slice(0, 30).map((s, i) => {
                        let payload = '–'
                        try {
                          const p = JSON.parse(s.payload || '{}')
                          payload = p.mode || p.attackType || p.password?.slice(0, 20) || '–'
                        } catch {}
                        const typeColor = {
                          'sql-injection': 'var(--clr-red)',
                          'xss': 'var(--clr-yellow)',
                          'brute-force': 'var(--clr-cyan)',
                        }[s.simulation_type] || 'var(--clr-text-2)'

                        return (
                          <tr key={s.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              <span className="badge" style={{
                                background: `${typeColor}18`, color: typeColor,
                                borderColor: `${typeColor}25`, fontSize: '0.65rem',
                              }}>
                                {s.simulation_type}
                              </span>
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--clr-text-2)' }}>
                              {String(payload).slice(0, 30)}
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              {s.prevented
                                ? <span style={{ color: 'var(--clr-green)', fontSize: '0.75rem', fontWeight: 700 }}>✓ Yes</span>
                                : <span style={{ color: 'var(--clr-red)',   fontSize: '0.75rem', fontWeight: 700 }}>✗ No</span>
                              }
                            </td>
                            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--clr-text-3)', fontSize: '0.75rem' }}>
                              {new Date(s.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-xl">
                  <Activity size={40} style={{ margin: '0 auto 1rem', color: 'var(--clr-text-3)' }} />
                  <p className="text-muted text-sm">No simulations yet.</p>
                  <a href="/simulator" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                    Try the Simulator →
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Admin tab ─────────────────────────────────────── */}
        {tab === 'admin' && isAdmin && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {/* Admin stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <StatCard label="Total Users"       value={adminData?.users}       icon={Shield}    color="var(--clr-cyan)"   />
              <StatCard label="Students"          value={adminData?.students}    icon={Zap}       color="var(--clr-green)"  />
              <StatCard label="Total Simulations" value={adminData?.simulations} icon={Activity}  color="var(--clr-yellow)" />
              <StatCard label="Completions"       value={adminData?.completions} icon={TrendingUp} color="var(--clr-orange)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Daily activity line chart */}
              <div className="glass-card p-lg">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>Daily Activity (30 days)</h3>
                {dailyChart ? (
                  <div style={{ height: 220 }}>
                    <Line data={dailyChart} options={CHART_DEFAULTS} />
                  </div>
                ) : (
                  <p className="text-muted text-sm text-center p-xl">No activity data yet.</p>
                )}
              </div>

              {/* Event type doughnut */}
              <div className="glass-card p-lg">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>Event Breakdown</h3>
                {eventsDoughnut ? (
                  <div style={{ height: 220 }}>
                    <Doughnut data={eventsDoughnut} options={DOUGHNUT_OPTS} />
                  </div>
                ) : (
                  <p className="text-muted text-sm text-center p-xl">No event data yet.</p>
                )}
              </div>
            </div>

            {/* Recent events table */}
            {adminData?.recentActivity?.length > 0 && (
              <div className="glass-card p-lg mt-lg">
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Recent Event Types (7 days)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {adminData.recentActivity.map(evt => (
                    <div key={evt.event_type} className="flex items-center justify-between glass-card p-md"
                      style={{ background: 'rgba(0,0,0,0.3)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--clr-text-1)' }}>{evt.event_type.replace(/_/g, ' ')}</span>
                      <span style={{ fontFamily: 'var(--font-hud)', color: 'var(--clr-cyan)', fontSize: '1rem' }}>
                        {evt.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}
