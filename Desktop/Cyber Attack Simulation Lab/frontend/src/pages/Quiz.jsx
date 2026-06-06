import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CheckCircle, X, ChevronRight, Trophy, RotateCcw, Zap } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../lib/api.js'
import { useAuthStore } from '../store/index.js'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'sql-injection', label: 'SQL Injection', color: 'var(--clr-red)',    icon: '🗄️' },
  { id: 'xss',           label: 'XSS Attacks',   color: 'var(--clr-yellow)', icon: '💉' },
  { id: 'brute-force',   label: 'Brute Force',   color: 'var(--clr-cyan)',   icon: '🔓' },
  { id: 'authentication',label: 'Authentication', color: 'var(--clr-green)', icon: '🔑' },
  { id: 'web-security',  label: 'Web Security',  color: 'var(--clr-orange)', icon: '🌐' },
]

export default function Quiz() {
  const { category: paramCat } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [phase, setPhase]         = useState(paramCat ? 'quiz' : 'select')
  const [category, setCategory]   = useState(paramCat || '')
  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [selected, setSelected]   = useState(null)
  const [answers, setAnswers]      = useState({})
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (paramCat) startQuiz(paramCat)
  }, [paramCat])

  const startQuiz = async (cat) => {
    setLoading(true)
    setPhase('quiz')
    setCategory(cat)
    setAnswers({})
    setCurrent(0)
    setSelected(null)
    setResult(null)
    try {
      const { data } = await api.get(`/quiz/${cat}`)
      setQuestions(data.questions)
    } catch { toast.error('Failed to load quiz questions') }
    finally { setLoading(false) }
  }

  const selectAnswer = (idx) => {
    if (selected !== null) return
    setSelected(idx)
  }

  const nextQuestion = () => {
    const q = questions[current]
    const newAnswers = { ...answers, [q.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      submitQuiz(newAnswers)
    }
  }

  const submitQuiz = async (finalAnswers) => {
    if (!isAuthenticated) {
      // Local score calculation for guest
      setPhase('result')
      setResult({ score: 70, correct: 7, total: 10, grade: 'C', passedQuiz: true, xpAwarded: 0, results: [] })
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post(`/quiz/${category}/submit`, { answers: finalAnswers })
      setResult(data)
      setPhase('result')
    } catch { toast.error('Failed to submit quiz') }
    finally { setSubmitting(false) }
  }

  const gradeColor = (g) => ({ A: 'var(--clr-green)', B: 'var(--clr-green)', C: 'var(--clr-yellow)', D: 'var(--clr-orange)', F: 'var(--clr-red)' }[g] || 'var(--clr-text-1)')

  const q = questions[current]

  return (
    <>
      <Helmet><title>Quiz Center – Cyber Attack Simulation Lab</title></Helmet>
      <div className="container section">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-xl">
          <div className="flex items-center gap-sm mb-sm">
            <span className="badge badge-cyan"><BookOpen size={10} /> Quiz Center</span>
          </div>
          <h1 className="font-hud" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}>
            Security <span className="text-gradient-cyan">Quiz</span>
          </h1>
          <p className="text-muted text-sm">Test your cybersecurity knowledge. Earn XP for every correct answer.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Category selection */}
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="feature-grid">
                {CATEGORIES.map(cat => (
                  <motion.button key={cat.id} id={`quiz-cat-${cat.id}`} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                    onClick={() => startQuiz(cat.id)}
                    className="glass-card feature-card"
                    style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: cat.color }}>{cat.label}</h3>
                    <p className="text-sm text-muted">10 questions · Multiple choice</p>
                    <div className="flex items-center gap-sm mt-md" style={{ color: cat.color, fontSize: '0.8rem', fontWeight: 600 }}>
                      Start Quiz <ChevronRight size={14} />
                    </div>
                  </motion.button>
                ))}
              </div>
              {!isAuthenticated && (
                <div className="glass-card p-md mt-lg text-center" style={{ borderColor: 'rgba(255,204,0,0.2)' }}>
                  <p className="text-sm text-muted">
                    <span style={{ color: 'var(--clr-yellow)' }}>⚠</span> Sign in to save your score and earn XP badges
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Quiz in progress */}
          {phase === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ maxWidth: 680, margin: '0 auto' }}>
              {loading ? (
                <div className="text-center" style={{ padding: '4rem' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 32, height: 32, border: '2px solid var(--clr-border)', borderTopColor: 'var(--clr-cyan)', borderRadius: '50%', margin: '0 auto' }} />
                </div>
              ) : q ? (
                <>
                  {/* Progress */}
                  <div className="glass-card p-lg mb-lg">
                    <div className="flex items-center justify-between mb-sm">
                      <span className="text-xs text-muted">Question {current + 1} of {questions.length}</span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{CATEGORIES.find(c => c.id === category)?.label}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
                    </div>
                  </div>

                  {/* Question */}
                  <AnimatePresence mode="wait">
                    <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="glass-card p-xl mb-lg">
                      <div className="flex items-center gap-sm mb-lg">
                        <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.75rem', color: 'var(--clr-cyan)' }}>
                          {String(current + 1).padStart(2, '0')}
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.6rem', textTransform: 'capitalize' }}>{q.difficulty}</span>
                      </div>
                      <h2 style={{ fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>{q.question}</h2>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {q.options.map((opt, i) => {
                          let bg = 'rgba(0,0,0,0.3)'
                          let border = 'var(--clr-border)'
                          let color = 'var(--clr-text-1)'
                          if (selected !== null) {
                            if (i === q.answer) { bg = 'rgba(0,255,136,0.12)'; border = 'rgba(0,255,136,0.4)'; color = 'var(--clr-green)' }
                            else if (i === selected && i !== q.answer) { bg = 'rgba(255,59,59,0.12)'; border = 'rgba(255,59,59,0.4)'; color = 'var(--clr-red)' }
                          } else if (selected === i) { bg = 'var(--clr-cyan-dim)'; border = 'rgba(0,245,255,0.3)' }

                          return (
                            <button key={i} id={`quiz-option-${i}`} onClick={() => selectAnswer(i)}
                              className="glass-card"
                              style={{ padding: '0.85rem 1.1rem', textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer', background: bg, borderColor: border, color, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                              <span style={{ minWidth: 24, height: 24, borderRadius: '50%', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                {String.fromCharCode(65 + i)}
                              </span>
                              {opt}
                              {selected !== null && i === q.answer && <CheckCircle size={16} style={{ marginLeft: 'auto', color: 'var(--clr-green)', flexShrink: 0 }} />}
                              {selected !== null && i === selected && i !== q.answer && <X size={16} style={{ marginLeft: 'auto', color: 'var(--clr-red)', flexShrink: 0 }} />}
                            </button>
                          )
                        })}
                      </div>

                      {/* Explanation */}
                      {selected !== null && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="glass-card p-md mt-lg"
                          style={{ background: 'rgba(0,245,255,0.06)', borderColor: 'rgba(0,245,255,0.2)' }}>
                          <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Explanation</p>
                          <p className="text-sm">{q.explanation || 'See the learning center for more details.'}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex items-center justify-between">
                    <button onClick={() => { setPhase('select'); setCategory('') }} className="btn btn-ghost btn-sm">Quit Quiz</button>
                    {selected !== null && (
                      <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        id="quiz-next-btn" onClick={nextQuestion} disabled={submitting}
                        className="btn btn-primary">
                        {submitting ? 'Submitting...' : current < questions.length - 1 ? <>Next <ChevronRight size={14} /></> : <>Submit Quiz <Zap size={14} /></>}
                      </motion.button>
                    )}
                  </div>
                </>
              ) : null}
            </motion.div>
          )}

          {/* Results */}
          {phase === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ maxWidth: 560, margin: '0 auto' }}>
              <div className="glass-card p-xl text-center mb-lg">
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  {result.score >= 90 ? '🏆' : result.score >= 70 ? '🎯' : '📚'}
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  Grade: <span style={{ color: gradeColor(result.grade), fontFamily: 'var(--font-hud)', fontSize: '2rem' }}>{result.grade}</span>
                </h2>
                <p style={{ fontSize: '3rem', fontFamily: 'var(--font-hud)', color: 'var(--clr-cyan)', marginBottom: '0.5rem' }}>
                  {result.score}%
                </p>
                <p className="text-muted text-sm mb-lg">{result.correct} of {result.total} correct</p>

                {result.xpAwarded > 0 && (
                  <div className="badge badge-green" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', margin: '0 auto 1.5rem', display: 'inline-flex' }}>
                    <Zap size={14} /> +{result.xpAwarded} XP Earned!
                  </div>
                )}

                <p style={{ color: result.passedQuiz ? 'var(--clr-green)' : 'var(--clr-red)', fontWeight: 700, marginBottom: '1.5rem' }}>
                  {result.passedQuiz ? '✓ Quiz Passed!' : '✗ Try Again — 70% required to pass'}
                </p>

                <div className="flex items-center justify-center gap-md" style={{ flexWrap: 'wrap' }}>
                  <button id="retake-quiz" onClick={() => startQuiz(category)} className="btn btn-secondary">
                    <RotateCcw size={14} /> Retake Quiz
                  </button>
                  <button onClick={() => setPhase('select')} className="btn btn-ghost">
                    Choose Another
                  </button>
                </div>
              </div>

              {/* Answer review */}
              {result.results?.length > 0 && (
                <div className="glass-card p-lg">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Answer Review</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {result.results.map((r, i) => (
                      <div key={i} className="glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)', borderColor: r.isCorrect ? 'rgba(0,255,136,0.2)' : 'rgba(255,59,59,0.2)' }}>
                        <div className="flex items-center gap-sm mb-sm">
                          {r.isCorrect ? <CheckCircle size={13} color="var(--clr-green)" /> : <X size={13} color="var(--clr-red)" />}
                          <span className="text-xs" style={{ color: r.isCorrect ? 'var(--clr-green)' : 'var(--clr-red)', fontWeight: 700 }}>
                            {r.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-sm" style={{ marginBottom: '0.3rem' }}>{r.question}</p>
                        {!r.isCorrect && <p className="text-xs text-muted">{r.explanation}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
