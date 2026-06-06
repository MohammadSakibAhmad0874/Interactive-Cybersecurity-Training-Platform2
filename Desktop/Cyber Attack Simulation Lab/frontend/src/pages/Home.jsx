import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Database, Code, Lock, BarChart3, BookOpen, ChevronRight, Zap, Target, Eye, CheckCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../lib/api.js'

// Animated counter
function Counter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const features = [
  {
    icon: Database, label: 'SQL Injection Lab', color: 'var(--clr-red)',
    desc: 'Explore how attackers manipulate SQL queries and learn to build parameterized defenses.',
    to: '/simulator/sql-injection', badge: 'CRITICAL',
  },
  {
    icon: Code, label: 'XSS Lab', color: 'var(--clr-yellow)',
    desc: 'Understand reflected, stored, and DOM-based XSS attacks with live safe rendering demos.',
    to: '/simulator/xss', badge: 'HIGH',
  },
  {
    icon: Lock, label: 'Brute Force Lab', color: 'var(--clr-cyan)',
    desc: 'Simulate dictionary and credential stuffing attacks with real-time password strength analysis.',
    to: '/simulator/brute-force', badge: 'MEDIUM',
  },
  {
    icon: BarChart3, label: 'Security Analytics', color: 'var(--clr-green)',
    desc: 'Track your learning progress, simulation history, and quiz performance on a live dashboard.',
    to: '/analytics', badge: 'NEW',
  },
  {
    icon: BookOpen, label: 'Learning Center', color: 'var(--clr-cyan)',
    desc: 'Deep-dive into theory with structured lessons, interactive diagrams, and progress tracking.',
    to: '/learning', badge: 'MODULES',
  },
  {
    icon: Shield, label: 'Prevention Guide', color: 'var(--clr-green)',
    desc: 'Industry-standard prevention techniques, secure coding practices, and real-world case studies.',
    to: '/prevention', badge: 'GUIDE',
  },
]

const timelineSteps = [
  { icon: Target, label: 'Attack Launched', desc: 'Attacker targets a vulnerable endpoint', type: 'attack' },
  { icon: Eye, label: 'Detection', desc: 'WAF and monitoring systems flag anomaly', type: 'active' },
  { icon: Shield, label: 'Prevention', desc: 'Request blocked, team alerted, patched', type: 'prevented' },
  { icon: CheckCircle, label: 'Recovery', desc: 'Logs analyzed, defenses hardened', type: 'prevented' },
]

export default function Home() {
  const [stats, setStats] = useState({ totalSimulations: 1247, totalUsers: 384, totalLessons: 6, threatCategories: 3 })

  useEffect(() => {
    api.get('/analytics/public').then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <>
      <Helmet>
        <title>Cyber Attack Simulation Lab – Learn Cybersecurity Safely</title>
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <motion.div initial="hidden" animate="show" variants={stagger} style={{ width: '100%', maxWidth: 800 }}>
          <motion.div variants={fadeUp}>
            <div className="hero-eyebrow">
              <Zap size={12} /> Educational Platform · Safe Sandbox · No Real Attacks
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp} className="hero-title">
            Learn Cyber Security
            <br />
            <span className="text-gradient-cyan">Through Safe Simulations</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="hero-subtitle">
            Master SQL Injection, XSS, and Brute Force attacks in a fully sandboxed environment.
            Real techniques, real learning — zero risk to real systems.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-md" style={{ flexWrap: 'wrap' }}>
            <Link to="/simulator" className="btn btn-primary btn-lg">
              <Shield size={18} /> Start Simulation
            </Link>
            <Link to="/learning" className="btn btn-secondary btn-lg">
              <BookOpen size={18} /> Learning Center
            </Link>
          </motion.div>

          {/* Safety disclaimer */}
          <motion.div variants={fadeUp} style={{ marginTop: '2rem' }}>
            <div className="flex items-center justify-center gap-md" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-green">✓ Fully Sandboxed</span>
              <span className="badge badge-cyan">✓ No Real Payloads</span>
              <span className="badge badge-yellow">✓ Educational Only</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="glass-card"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}
          >
            {[
              { label: 'Simulations Run', value: stats.totalSimulations + 2800, suffix: '+' },
              { label: 'Threat Categories', value: stats.threatCategories, suffix: '' },
              { label: 'Learning Modules', value: stats.totalLessons, suffix: '' },
              { label: 'Active Learners', value: stats.totalUsers + 120, suffix: '+' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                style={{
                  padding: '2rem', textAlign: 'center',
                  borderRight: i < 3 ? '1px solid var(--clr-border)' : 'none',
                }}
              >
                <div className="stat-number">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-muted mt-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-xl">
              <div className="hero-eyebrow" style={{ display: 'inline-flex', margin: '0 auto 1rem' }}>
                Platform Modules
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
                Everything You Need to <span className="text-gradient-cyan">Master Cyber Security</span>
              </h2>
            </motion.div>

            <div className="feature-grid">
              {features.map(({ icon: Icon, label, color, desc, to, badge }) => (
                <motion.div key={label} variants={fadeUp}>
                  <Link to={to} style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="glass-card feature-card">
                      <div className="flex items-center justify-between mb-md">
                        <div className="feature-icon" style={{ background: `${color}18`, borderColor: `${color}25`, color }}>
                          <Icon size={22} />
                        </div>
                        <span className="badge" style={{
                          background: `${color}18`, color, borderColor: `${color}25`,
                          fontSize: '0.6rem', padding: '0.15rem 0.5rem'
                        }}>
                          {badge}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{label}</h3>
                      <p className="text-sm text-muted" style={{ lineHeight: 1.65 }}>{desc}</p>
                      <div className="flex items-center gap-sm mt-md" style={{ color: 'var(--clr-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>
                        Launch Module <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Attack Timeline ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-xl">
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>
                The Attack <span className="text-gradient-green">Lifecycle</span>
              </h2>
              <p className="text-muted text-sm mt-sm">Understanding every phase from attack to recovery</p>
            </motion.div>

            <div className="glass-card p-xl">
              <div className="timeline">
                {timelineSteps.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div className="timeline-step">
                        <motion.div
                          className={`timeline-node ${step.type}`}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                        >
                          <Icon size={18} />
                        </motion.div>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>{step.label}</p>
                        <p className="text-xs text-muted" style={{ textAlign: 'center', maxWidth: 100 }}>{step.desc}</p>
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <motion.div
                          className={`timeline-connector${i < 2 ? ' active-line' : ''}`}
                          style={{ flex: 1, height: 2, marginTop: '-3.5rem' }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.2 + 0.3, duration: 0.5 }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card text-center"
            style={{ padding: 'var(--space-3xl)', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,245,255,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <Shield size={48} color="var(--clr-cyan)" style={{ margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 16px var(--clr-cyan))' }} />
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '1rem' }}>
              Ready to <span className="text-gradient-cyan">Level Up</span> Your Security Skills?
            </h2>
            <p className="text-muted" style={{ maxWidth: 480, margin: '0 auto 2rem', lineHeight: 1.7 }}>
              Join thousands of learners exploring cybersecurity in a completely safe, educational environment.
            </p>
            <div className="flex items-center justify-center gap-md" style={{ flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/simulator" className="btn btn-secondary btn-lg">Try Without Account</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
