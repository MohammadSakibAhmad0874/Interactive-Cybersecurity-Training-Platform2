import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import { Compass, Heart, MessageCircle, MapPin, RefreshCw, Sparkles, Code2, Layers } from 'lucide-react'
import FeedbackModal from '../components/FeedbackModal'
import { matches as matchesApi } from '../services/api'
import useScrollReveal from '../hooks/useScrollReveal'
import './DiscoverPage.css'

const ROLE_BADGE = {
  frontend:     { label: 'Frontend',     color: '#61DAFB' },
  backend:      { label: 'Backend',      color: '#339933' },
  full_stack:   { label: 'Full Stack',   color: '#646CFF' },
  ml_ai:        { label: 'ML / AI',      color: '#FF6B6B' },
  devops:       { label: 'DevOps',       color: '#FFA500' },
  design:       { label: 'Design',       color: '#FF69B4' },
  mobile:       { label: 'Mobile',       color: '#00BCD4' },
  data_science: { label: 'Data Science', color: '#9C27B0' },
  security:     { label: 'Security',     color: '#F44336' },
}

const EXP_BADGE = {
  beginner:     '🌱',
  intermediate: '⚡',
  advanced:     '🚀',
  expert:       '🚀',
}

export default function DiscoverPage() {
  const { token } = useContext(AuthContext)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedbackUser, setFeedbackUser] = useState(null)
  const revealRef = useScrollReveal({ threshold: 0.05, staggerDelay: 80 })

  const fetchMatches = () => {
    setLoading(true)
    matchesApi.getMatches(20)
      .then(data => { setMatches(data.matches || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchMatches() }, [token])

  return (
    <div className="page-container discover-page" ref={revealRef}>
      <div className="section-header">
        <div className="discover-header">
          <div>
            <h1><Sparkles size={28} /> Discover Teammates</h1>
            <p>AI-powered developer matches ranked by team compatibility</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchMatches} id="refresh-matches">
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="discover-loading">
          <div className="loading-spinner"></div>
          <p>Finding your perfect teammates...</p>
        </div>
      ) : matches.length > 0 ? (
        <div className="card-grid">
          {matches.map((m, i) => {
            const roleMeta = ROLE_BADGE[m.role] || { label: m.role || 'Dev', color: '#888' }
            const expIcon  = EXP_BADGE[m.experienceLevel] || '⚡'
            return (
              <div key={m.id || i} className="match-card glass-card" data-scroll-reveal style={{ animationDelay: `${i * 100}ms` }}>
                <div className="match-card-header">
                  <div className="avatar avatar-lg">{m.name?.charAt(0)}</div>
                  <div className="match-score">
                    <Sparkles size={14} /> {m.matchScore || 85}%
                  </div>
                </div>

                <div className="match-card-body">
                  <h3>{m.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    {m.role && (
                      <span className="tag" style={{ background: `${roleMeta.color}22`, color: roleMeta.color, border: `1px solid ${roleMeta.color}44` }}>
                        {roleMeta.label}
                      </span>
                    )}
                    {m.experienceLevel && (
                      <span className="tag">{expIcon} {m.experienceLevel}</span>
                    )}
                    {m.country && (
                      <span className="match-location"><MapPin size={13} /> {m.country}</span>
                    )}
                  </div>
                  {m.bio && <p className="match-bio">{m.bio}</p>}

                  <div className="match-section">
                    <span className="match-section-label"><Code2 size={13} /> Skills</span>
                    <div className="tags-container">
                      {(m.skills || []).slice(0, 4).map(s => (
                        <span key={s} className="tag tag-primary">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="match-section">
                    <span className="match-section-label"><Layers size={13} /> Tech Stack</span>
                    <div className="tags-container">
                      {(m.techStack || []).slice(0, 4).map(t => (
                        <span key={t} className="tag tag-accent">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="match-section">
                    <span className="match-section-label">Project Interests</span>
                    <div className="tags-container">
                      {(m.projectInterests || []).slice(0, 3).map(p => (
                        <span key={p} className="tag tag-success">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="match-card-actions">
                  <Link to={`/chat/${m.id}`} className="btn btn-primary btn-sm">
                    <MessageCircle size={16} /> Chat
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => setFeedbackUser(m)}>
                    <Heart size={16} /> Rate Match
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Compass size={64} />
          <h3>No matches found yet</h3>
          <p>Complete your profile to get better teammate matches!</p>
          <Link to="/profile" className="btn btn-primary">Update Profile</Link>
        </div>
      )}

      {feedbackUser && (
        <FeedbackModal
          user={feedbackUser}
          onClose={() => setFeedbackUser(null)}
          token={token}
        />
      )}
    </div>
  )
}
