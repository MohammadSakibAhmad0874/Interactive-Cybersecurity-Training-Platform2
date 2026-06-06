import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Search, Filter, ChevronRight, CheckCircle, Clock, BarChart3 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../lib/api.js'

const CATEGORIES = ['all', 'sql-injection', 'xss', 'brute-force', 'authentication', 'web-security']
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced']

const diffColor = { beginner: 'var(--clr-green)', intermediate: 'var(--clr-yellow)', advanced: 'var(--clr-red)' }
const catLabel = {
  'sql-injection': 'SQL Injection', 'xss': 'XSS', 'brute-force': 'Brute Force',
  'authentication': 'Authentication', 'web-security': 'Web Security',
}

export default function LearningCenter() {
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (difficulty !== 'all') params.set('difficulty', difficulty)
    if (search) params.set('search', search)

    api.get(`/lessons?${params}`).then(r => setLessons(r.data.lessons)).finally(() => setLoading(false))
    api.get('/lessons/progress/summary').then(r => setProgress(r.data)).catch(() => {})
  }, [category, difficulty, search])

  return (
    <>
      <Helmet><title>Learning Center – Cyber Attack Simulation Lab</title></Helmet>
      <div className="container section">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-xl">
          <div className="flex items-center gap-sm mb-md">
            <span className="badge badge-cyan"><BookOpen size={10} /> Learning Center</span>
          </div>
          <h1 className="font-hud" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', marginBottom: '0.5rem' }}>
            Learning <span className="text-gradient-cyan">Center</span>
          </h1>
          <p className="text-muted">Master cybersecurity concepts through structured, hands-on lessons.</p>
        </motion.div>

        {/* Progress summary */}
        {progress && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-lg mb-xl">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <p className="text-xs text-muted mb-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Progress</p>
                <div style={{ fontFamily: 'var(--font-hud)', fontSize: '1.8rem', color: 'var(--clr-cyan)' }}>
                  {progress.completionPercentage}%
                </div>
                <div className="progress-bar mt-sm">
                  <motion.div className="progress-fill" initial={{ width: '0%' }} animate={{ width: `${progress.completionPercentage}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted mb-sm">Completed</p>
                <p style={{ fontFamily: 'var(--font-hud)', fontSize: '1.5rem', color: 'var(--clr-green)' }}>{progress.completedLessons}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted mb-sm">Total Lessons</p>
                <p style={{ fontFamily: 'var(--font-hud)', fontSize: '1.5rem', color: 'var(--clr-text-1)' }}>{progress.totalLessons}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted mb-sm">In Progress</p>
                <p style={{ fontFamily: 'var(--font-hud)', fontSize: '1.5rem', color: 'var(--clr-yellow)' }}>{progress.inProgressLessons}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="glass-card p-lg mb-xl">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '2', minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-3)' }} />
              <input id="lesson-search" className="cyber-input" value={search}
                onChange={e => setSearch(e.target.value)} placeholder="Search lessons..."
                style={{ paddingLeft: 36 }} />
            </div>

            {/* Category */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} id={`cat-${c}`} onClick={() => setCategory(c)}
                  className={c === category ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  style={{ fontSize: '0.75rem' }}>
                  {c === 'all' ? 'All' : catLabel[c]}
                </button>
              ))}
            </div>

            {/* Difficulty */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {DIFFICULTIES.map(d => (
                <button key={d} id={`diff-${d}`} onClick={() => setDifficulty(d)}
                  className={d === difficulty ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson grid */}
        {loading ? (
          <div className="text-center" style={{ padding: '4rem' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 32, height: 32, border: '2px solid var(--clr-border)', borderTopColor: 'var(--clr-cyan)', borderRadius: '50%', margin: '0 auto' }} />
          </div>
        ) : (
          <motion.div initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            className="feature-grid">
            {lessons.map(lesson => {
              const completed = lesson.userProgress?.completed
              const progress = lesson.userProgress?.progress || 0
              return (
                <motion.div key={lesson.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <Link to={`/learning/${lesson.slug}`} style={{ display: 'block' }}>
                    <div className="glass-card feature-card" style={{ position: 'relative' }}>
                      {completed && (
                        <div style={{ position: 'absolute', top: 12, right: 12 }}>
                          <CheckCircle size={16} color="var(--clr-green)" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-md">
                        <span className="badge" style={{ background: `${diffColor[lesson.difficulty]}18`, color: diffColor[lesson.difficulty], borderColor: `${diffColor[lesson.difficulty]}25`, fontSize: '0.65rem' }}>
                          {lesson.difficulty}
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>{catLabel[lesson.category] || lesson.category}</span>
                      </div>
                      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', paddingRight: completed ? 20 : 0 }}>{lesson.title}</h3>
                      <p className="text-xs text-muted" style={{ lineHeight: 1.6, marginBottom: '1rem' }}>{lesson.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-sm text-xs text-muted">
                          <Clock size={11} /> {lesson.duration} min
                        </div>
                        <div className="flex items-center gap-sm text-xs" style={{ color: 'var(--clr-cyan)' }}>
                          Start <ChevronRight size={12} />
                        </div>
                      </div>
                      {progress > 0 && (
                        <div className="progress-bar mt-sm">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
            {lessons.length === 0 && (
              <div className="text-center text-muted" style={{ gridColumn: '1/-1', padding: '3rem' }}>
                No lessons found. Try adjusting your filters.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}
