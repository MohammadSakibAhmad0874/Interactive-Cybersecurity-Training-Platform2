import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import {
  Users, MessageCircle, CalendarCheck, Star,
  TrendingUp, Globe, ArrowRight, Sparkles,
  Compass, UserCircle, Clock, Zap, Activity,
  CheckCircle2, Code2
} from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'
import { matches as matchesApi, meetups as meetupsApi } from '../services/api'
import './Dashboard.css'

const ACTIVITY_FEED = [
  { icon: CheckCircle2, color: '#22c55e', text: 'Profile 100% complete',        time: 'Just now' },
  { icon: Sparkles,     color: '#6C63FF', text: 'AI found 3 new matches',        time: '2m ago' },
  { icon: MessageCircle,color: '#FF4D4D', text: 'New message from a teammate',   time: '15m ago' },
  { icon: CalendarCheck,color: '#f59e0b', text: 'Meetup scheduled for tomorrow', time: '1h ago' },
  { icon: TrendingUp,   color: '#06b6d4', text: 'Match score improved to 94%',   time: '3h ago' },
]

const QUICK_ACTIONS = [
  { to: '/discover', icon: Compass,       label: 'Discover',       desc: 'Find teammates',   color: '#6C63FF' },
  { to: '/chat',     icon: MessageCircle, label: 'Chat',           desc: 'Message matches',  color: '#FF4D4D' },
  { to: '/meetups',  icon: CalendarCheck, label: 'Schedule',       desc: 'Plan a meetup',    color: '#f59e0b' },
  { to: '/profile',  icon: UserCircle,    label: 'Edit Profile',   desc: 'Update your info', color: '#22c55e' },
]

export default function Dashboard() {
  const { user, token } = useContext(AuthContext)
  const [matchList, setMatchList] = useState([])
  const [stats, setStats] = useState({ totalMatches: 0, chats: 0, meetups: 0, feedbacks: 0 })
  const [loading, setLoading] = useState(true)
  const revealRef = useScrollReveal({ threshold: 0.08, staggerDelay: 80 })

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      matchesApi.getMatches(10).catch(() => ({ matches: [] })),
      meetupsApi.getMeetups().catch(() => ({ meetups: [] })),
    ]).then(([matchData, meetupData]) => {
      const allMatches = matchData.matches || []
      setMatchList(allMatches.slice(0, 5))
      setStats({
        totalMatches: allMatches.length,
        chats: allMatches.length,
        meetups: (meetupData.meetups || []).length,
        feedbacks: 0,
      })
      setLoading(false)
    })
  }, [token])

  const statCards = [
    { icon: Users,         label: 'Matches',      value: stats.totalMatches, color: '#6C63FF', bg: 'rgba(108,99,255,0.12)' },
    { icon: MessageCircle, label: 'Conversations', value: stats.chats,        color: '#FF4D4D', bg: 'rgba(255,77,77,0.12)' },
    { icon: CalendarCheck, label: 'Meetups',       value: stats.meetups,      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { icon: Star,          label: 'Feedback',      value: stats.feedbacks,    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  ]

  const firstName = user?.name?.split(' ')[0] || 'Developer'

  return (
    <div className="dashboard-page" ref={revealRef}>

      {/* ── Welcome Header ── */}
      <div className="dash-welcome animate-fade-in-up">
        <div className="dash-welcome-left">
          <div className="dash-greeting-badge">
            <Zap size={14} />
            <span>Dashboard</span>
          </div>
          <h1 className="dash-welcome-heading">
            Welcome back, <span className="gradient-text">{firstName}!</span> 👋
          </h1>
          <p className="dash-welcome-sub">Here's your hackathon team overview for today.</p>
        </div>
        <div className="dash-welcome-right">
          <Link to="/discover" className="btn btn-primary" id="find-matches-btn">
            <Sparkles size={17} />
            Find Matches
          </Link>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="dash-stats-grid" data-scroll-reveal>
        {statCards.map((s, i) => (
          <div key={i} className="dash-stat-card glass-card" data-scroll-reveal>
            {loading ? (
              <div className="skeleton" style={{ height: 64 }} />
            ) : (
              <>
                <div className="dash-stat-icon" style={{ background: s.bg, color: s.color }}>
                  <s.icon size={22} />
                </div>
                <div className="dash-stat-info">
                  <span className="dash-stat-value">{s.value}</span>
                  <span className="dash-stat-label">{s.label}</span>
                </div>
                <div className="dash-stat-trend" style={{ color: s.color }}>
                  <TrendingUp size={14} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Middle: Matches + Activity ── */}
      <div className="dash-middle-grid">

        {/* Recent Matches */}
        <div className="dash-section glass-premium" data-scroll-reveal="left">
          <div className="dash-section-header">
            <div className="dash-section-title">
              <div className="dash-section-dot" style={{ background: 'var(--gradient-primary)' }} />
              <h2>Recent Matches</h2>
            </div>
            <Link to="/discover" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="dash-match-list">
              {[1,2,3].map(i => (
                <div key={i} className="dash-match-skeleton skeleton" />
              ))}
            </div>
          ) : matchList.length > 0 ? (
            <div className="dash-match-list">
              {matchList.map((m, i) => (
                <Link key={i} to={`/chat/${m.id}`} className="dash-match-item" id={`match-item-${i}`}>
                  <div className="avatar avatar-sm" style={{ background: `hsl(${(i * 60 + 240) % 360}, 70%, 60%)` }}>
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="dash-match-info">
                    <span className="dash-match-name">{m.name}</span>
                    <span className="dash-match-detail">
                      {m.country}{m.skills?.[0] ? ` · ${m.skills[0]}` : ''}
                    </span>
                  </div>
                  <div className="dash-match-right">
                    <span className="match-score">
                      <Sparkles size={11} /> {m.matchScore || 85}%
                    </span>
                    <ArrowRight size={14} className="dash-match-arrow" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dash-empty-state">
              <div className="dash-empty-icon">
                <Globe size={32} />
              </div>
              <p>No matches yet — start discovering!</p>
              <Link to="/discover" className="btn btn-primary btn-sm" id="discover-from-empty">
                Discover Devs
              </Link>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="dash-section glass-premium" data-scroll-reveal="right">
          <div className="dash-section-header">
            <div className="dash-section-title">
              <div className="dash-section-dot" style={{ background: 'var(--gradient-warm)' }} />
              <h2>Activity Feed</h2>
            </div>
            <span className="dash-live-badge">
              <span className="dash-live-dot" />
              Live
            </span>
          </div>

          <div className="dash-activity-list">
            {ACTIVITY_FEED.map((item, i) => (
              <div key={i} className="dash-activity-item" data-scroll-reveal>
                <div className="dash-activity-icon" style={{ background: `${item.color}18`, color: item.color }}>
                  <item.icon size={15} />
                </div>
                <div className="dash-activity-info">
                  <span className="dash-activity-text">{item.text}</span>
                  <span className="dash-activity-time">
                    <Clock size={11} /> {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Profile mini card */}
          <div className="dash-profile-mini">
            <div className="avatar avatar-lg" style={{ background: 'var(--gradient-primary)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="dash-profile-mini-name">{user?.name}</p>
              <p className="dash-profile-mini-role">
                {user?.role ? user.role.replace(/_/g, ' ') : 'Developer'}
              </p>
              <div className="tags-container" style={{ marginTop: '0.4rem' }}>
                {(user?.skills || []).slice(0, 2).map(s => (
                  <span key={s} className="tag tag-primary">{s}</span>
                ))}
                {(user?.techStack || []).slice(0, 1).map(t => (
                  <span key={t} className="tag tag-pink">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="dash-actions-section" data-scroll-reveal>
        <div className="dash-section-header" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="dash-section-title">
            <div className="dash-section-dot" style={{ background: 'var(--gradient-cool)' }} />
            <h2>Quick Actions</h2>
          </div>
        </div>
        <div className="dash-actions-grid">
          {QUICK_ACTIONS.map((action, i) => (
            <Link key={i} to={action.to} className="dash-action-card glass-card" id={`quick-action-${i}`}>
              <div className="dash-action-icon" style={{ background: `${action.color}18`, color: action.color }}>
                <action.icon size={24} />
              </div>
              <div className="dash-action-info">
                <span className="dash-action-label">{action.label}</span>
                <span className="dash-action-desc">{action.desc}</span>
              </div>
              <ArrowRight size={16} className="dash-action-arrow" style={{ color: action.color }} />
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
