import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, BookOpen, CheckCircle, ChevronRight } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../lib/api.js'
import { useAuthStore } from '../store/index.js'
import toast from 'react-hot-toast'

const diffColor = { beginner: 'var(--clr-green)', intermediate: 'var(--clr-yellow)', advanced: 'var(--clr-red)' }

export default function LessonDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [lesson, setLesson] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    api.get(`/lessons/${slug}`).then(r => {
      setLesson(r.data.lesson)
      setUserProgress(r.data.userProgress)
    }).catch(() => navigate('/learning')).finally(() => setLoading(false))
  }, [slug])

  const markComplete = async () => {
    if (!isAuthenticated) { toast.error('Sign in to track progress'); return }
    setCompleting(true)
    try {
      await api.post(`/lessons/${lesson.id}/progress`, { progress: 100, completed: true, timeSpent: lesson.duration * 60 })
      setUserProgress({ completed: 1, progress: 100 })
      toast.success('Lesson completed! +50 XP 🎯')
    } catch { toast.error('Failed to save progress') } finally { setCompleting(false) }
  }

  const updateProgress = async (sectionIdx) => {
    if (!isAuthenticated) return
    const pct = Math.round(((sectionIdx + 1) / (lesson?.content?.sections?.length || 1)) * 100)
    try { await api.post(`/lessons/${lesson.id}/progress`, { progress: pct, completed: false }) } catch {}
  }

  if (loading) return (
    <div className="container section text-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 32, height: 32, border: '2px solid var(--clr-border)', borderTopColor: 'var(--clr-cyan)', borderRadius: '50%', margin: '0 auto' }} />
    </div>
  )

  if (!lesson) return null

  const sections = lesson.content?.sections || []
  const section = sections[currentSection]
  const isCompleted = userProgress?.completed

  return (
    <>
      <Helmet><title>{lesson.title} – Cyber Attack Simulation Lab</title></Helmet>
      <div className="container section">
        {/* Back button */}
        <button onClick={() => navigate('/learning')} className="btn btn-ghost btn-sm mb-xl">
          <ArrowLeft size={14} /> Back to Learning Center
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-lg" style={{ position: 'sticky', top: 80 }}>
            <div className="flex items-center gap-sm mb-lg">
              <BookOpen size={16} color="var(--clr-cyan)" />
              <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sections</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {sections.map((s, i) => (
                <button key={i} id={`section-${i}`} onClick={() => { setCurrentSection(i); updateProgress(i) }}
                  className="btn btn-ghost btn-sm"
                  style={{
                    justifyContent: 'flex-start', textAlign: 'left', fontSize: '0.8rem',
                    background: i === currentSection ? 'var(--clr-cyan-dim)' : 'transparent',
                    borderColor: i === currentSection ? 'rgba(0,245,255,0.3)' : 'transparent',
                    color: i === currentSection ? 'var(--clr-cyan)' : 'var(--clr-text-2)',
                  }}>
                  <span style={{ minWidth: 18, fontSize: '0.7rem', opacity: 0.6 }}>{i + 1}.</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.heading}</span>
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-lg">
              <div className="flex items-center justify-between mb-sm">
                <span className="text-xs text-muted">Progress</span>
                <span className="text-xs" style={{ color: 'var(--clr-cyan)' }}>
                  {userProgress?.progress || Math.round(((currentSection + 1) / sections.length) * 100)}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${userProgress?.progress || Math.round(((currentSection + 1) / sections.length) * 100)}%` }} />
              </div>
            </div>

            {/* Complete button */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={markComplete} disabled={completing || isCompleted}
              className={`btn w-full mt-lg ${isCompleted ? 'btn-ghost' : 'btn-primary'}`}
              id="complete-lesson-btn" style={{ fontSize: '0.82rem' }}>
              {isCompleted ? <><CheckCircle size={14} /> Completed!</> : completing ? 'Saving...' : 'Mark Complete'}
            </motion.button>
          </motion.div>

          {/* Main content */}
          <div>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-xl mb-lg">
              <div className="flex items-center gap-sm mb-md">
                <span className="badge" style={{ background: `${diffColor[lesson.difficulty]}18`, color: diffColor[lesson.difficulty], borderColor: `${diffColor[lesson.difficulty]}25`, fontSize: '0.65rem' }}>
                  {lesson.difficulty}
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{lesson.category}</span>
                {isCompleted && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}><CheckCircle size={9} /> Completed</span>}
              </div>
              <h1 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', marginBottom: '0.75rem' }}>{lesson.title}</h1>
              <p className="text-muted text-sm" style={{ lineHeight: 1.7, marginBottom: '1rem' }}>{lesson.summary}</p>
              <div className="flex items-center gap-md text-xs text-muted">
                <span className="flex items-center gap-sm"><Clock size={12} /> {lesson.duration} min read</span>
                <span className="flex items-center gap-sm"><BookOpen size={12} /> {sections.length} sections</span>
              </div>
            </motion.div>

            {/* Section content */}
            <motion.div key={currentSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card p-xl mb-lg">
              <div className="flex items-center gap-sm mb-lg">
                <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.75rem', color: 'var(--clr-cyan)', letterSpacing: '0.1em' }}>
                  {String(currentSection + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--clr-text-0)' }}>{section?.heading}</h2>
              <p style={{ color: 'var(--clr-text-1)', lineHeight: 1.8, fontSize: '0.95rem' }}>{section?.body}</p>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0} className="btn btn-ghost">
                <ArrowLeft size={14} /> Previous
              </button>
              {currentSection < sections.length - 1 ? (
                <button onClick={() => { const next = currentSection + 1; setCurrentSection(next); updateProgress(next) }}
                  className="btn btn-primary" id="next-section-btn">
                  Next Section <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={markComplete} disabled={completing || isCompleted}
                  className={`btn ${isCompleted ? 'btn-ghost' : 'btn-primary'}`} id="finish-lesson-btn">
                  {isCompleted ? <><CheckCircle size={14} /> Done!</> : 'Complete Lesson'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
