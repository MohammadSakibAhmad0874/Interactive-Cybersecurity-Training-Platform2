import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../App'
import { Calendar, Clock, Plus, Video, X } from 'lucide-react'
import { meetups as meetupsApi, matches as matchesApi } from '../services/api'
import './MeetupPage.css'

export default function MeetupPage() {
  const { token } = useContext(AuthContext)
  const [meetups, setMeetups] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [contacts, setContacts] = useState([])
  const [form, setForm] = useState({ partnerId: '', title: '', date: '', time: '', duration: '30', notes: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      meetupsApi.list(),
      matchesApi.getMatches(50)
    ]).then(([meetData, matchData]) => {
      setMeetups(meetData.meetups || [])
      setContacts(matchData.matches || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await meetupsApi.create(form)
      if (data.meetup) {
        setMeetups(prev => [...prev, data.meetup])
        setShowForm(false)
        setForm({ partnerId: '', title: '', date: '', time: '', duration: '30', notes: '' })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (date) => {
    const meetDate = new Date(date)
    const now = new Date()
    if (meetDate < now) return 'past'
    const diff = meetDate - now
    if (diff < 86400000) return 'soon'
    return 'upcoming'
  }

  return (
    <div className="page-container meetup-page">
      <div className="section-header">
        <div className="meetup-header">
          <div>
            <h1><Calendar size={28} /> Team Sync</h1>
            <p>Schedule planning sessions with your matched teammates</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} id="new-meetup-btn">
            <Plus size={18} />
            New Meetup
          </button>
        </div>
      </div>

      {loading ? (
        <div className="discover-loading">
          <div className="loading-spinner"></div>
          <p>Loading meetups...</p>
        </div>
      ) : meetups.length > 0 ? (
        <div className="meetup-list">
          {meetups.map((m, i) => {
            const status = getStatusColor(m.date)
            return (
              <div key={m.id || i} className={`meetup-card glass-card animate-fade-in-up meetup-${status}`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="meetup-card-left">
                  <div className="meetup-date-badge">
                    <span className="meetup-month">{new Date(m.date).toLocaleDateString('en', { month: 'short' })}</span>
                    <span className="meetup-day">{new Date(m.date).getDate()}</span>
                  </div>
                </div>
                <div className="meetup-card-body">
                  <h3>{m.title || 'Team Sync Session'}</h3>
                  <div className="meetup-meta">
                    <span><Clock size={14} /> {m.time || '10:00'} · {m.duration || 30} min</span>
                    <span><Video size={14} /> Virtual</span>
                  </div>
                  {m.notes && <p className="meetup-notes">{m.notes}</p>}
                </div>
                <div className={`meetup-status-badge status-${status}`}>
                  {status === 'soon' ? 'Today' : status === 'past' ? 'Completed' : 'Upcoming'}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No sessions scheduled</h3>
          <p>Schedule a team sync with your matched teammates before the hackathon</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Schedule One</button>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Meetup</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="meetup-form">
              <div className="form-group">
                <label className="form-label">Partner</label>
                <select className="form-input" value={form.partnerId} onChange={e => setForm({ ...form, partnerId: e.target.value })} required>
                  <option value="">Select a match</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.country}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Session Title</label>
                <input type="text" className="form-input" placeholder="e.g. Pre-hack Planning, Idea Alignment" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Time</label>
                  <input type="time" className="form-input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <select className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-input" placeholder="e.g. Project idea, tech stack decision, task split..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Schedule Meetup</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
