import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Play, Shield, CheckCircle, AlertTriangle, Zap, Clock } from 'lucide-react'
import api from '../../lib/api.js'
import toast from 'react-hot-toast'

const strengthColors = ['var(--clr-red)', 'var(--clr-red)', 'var(--clr-orange)', 'var(--clr-yellow)', 'var(--clr-green)', 'var(--clr-green)']
const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']

export default function BruteForceLab() {
  const [password, setPassword] = useState('')
  const [attackType, setAttackType] = useState('dictionary')
  const [speed, setSpeed] = useState('medium')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [attemptIdx, setAttemptIdx] = useState(0)

  const run = async () => {
    if (!password.trim()) return toast.error('Enter a target password to analyze')
    setLoading(true)
    setAnimating(false)
    setAttemptIdx(0)
    try {
      const { data } = await api.post('/simulations/brute-force', { targetPassword: password, attackType, speed })
      setResult(data)
      // Animate attempts
      setAnimating(true)
      let i = 0
      const interval = setInterval(() => {
        i++
        setAttemptIdx(i)
        if (i >= (data.attemptTimeline?.length || 0)) clearInterval(interval)
      }, 350)
    } catch {
      toast.error('Simulation failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const strengthScore = result?.passwordAnalysis?.strengthScore || 0
  const strengthIndex = Math.min(Math.ceil(strengthScore / 20), 5)

  return (
    <div>
      <div className="glass-card p-xl mb-lg">
        <div className="flex items-center gap-md mb-md">
          <div className="feature-icon" style={{ background: 'rgba(0,245,255,0.1)', color: 'var(--clr-cyan)', borderColor: 'rgba(0,245,255,0.2)' }}>
            <Lock size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 2 }}>Brute Force Attack Laboratory</h2>
            <div className="flex items-center gap-sm">
              <span className="badge badge-cyan">OWASP #7</span>
              <span className="badge badge-yellow">CVSS 7.5</span>
              <span className="badge badge-green">Safe Sandbox</span>
            </div>
          </div>
        </div>
        <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>
          Brute force attacks systematically try passwords until the correct one is found.
          Enter any password to analyze its strength, estimated crack time, and see a simulated
          dictionary attack timeline with lockout mechanisms.
        </p>
      </div>

      <div className="sim-layout">
        {/* LEFT */}
        <div>
          {/* Attack type */}
          <div className="glass-card p-lg mb-lg">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Attack Type</p>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              {['dictionary', 'bruteforce', 'hybrid'].map(t => (
                <button key={t} id={`bf-type-${t}`} onClick={() => setAttackType(t)}
                  className={attackType === t ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.78rem' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div className="glass-card p-lg mb-lg">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Attack Speed</p>
            <div className="flex gap-sm">
              {[
                { id: 'slow', label: 'Slow', sub: '10/sec' },
                { id: 'medium', label: 'Medium', sub: '1K/sec' },
                { id: 'fast', label: 'Fast', sub: '1M/sec' },
              ].map(s => (
                <button key={s.id} id={`bf-speed-${s.id}`} onClick={() => setSpeed(s.id)}
                  className={speed === s.id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  style={{ flex: 1, flexDirection: 'column', gap: 2, fontSize: '0.75rem' }}>
                  <span>{s.label}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{s.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Password input */}
          <div className="glass-card p-lg">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Target Password</p>
            <input id="bf-password" type="text" className="cyber-input" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="e.g. password123 or P@ssw0rd!#42" />
            <p className="text-xs text-muted mt-sm">Try weak (123456), medium (Password1), or strong (xK#9mP2$qR!) passwords</p>

            {/* Live strength bar */}
            {password && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '1rem' }}>
                <div className="flex items-center justify-between mb-sm">
                  <span className="text-xs text-muted">Strength Preview</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: strengthColors[Math.min(Math.ceil(password.length / 4), 5)] }}>
                    {password.length < 6 ? 'Very Weak' : password.length < 8 ? 'Weak' : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 'Strong' : 'Fair'}
                  </span>
                </div>
                <div className="progress-bar">
                  <motion.div className="progress-fill"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(password.length * 6, 100)}%` }}
                    style={{ background: strengthColors[Math.min(Math.ceil(password.length / 4), 5)] }}
                  />
                </div>
              </motion.div>
            )}

            <motion.button whileTap={{ scale: 0.97 }} onClick={run} disabled={loading}
              className="btn btn-primary w-full mt-md" id="bf-run-btn">
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Play size={16} /></motion.div>
                : <><Zap size={16} /> Analyze & Simulate</>}
            </motion.button>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="res" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Strength score */}
                <div className="glass-card p-lg">
                  <div className="flex items-center justify-between mb-md">
                    <p className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password Strength Score</p>
                    <span style={{ fontFamily: 'var(--font-hud)', color: strengthColors[strengthIndex], fontSize: '1.5rem', fontWeight: 800 }}>
                      {strengthScore}<span style={{ fontSize: '0.8rem' }}>/100</span>
                    </span>
                  </div>
                  <div className="progress-bar mb-md">
                    <motion.div className="progress-fill" initial={{ width: '0%' }}
                      animate={{ width: `${strengthScore}%` }}
                      style={{ background: strengthColors[strengthIndex] }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <div className="grid-2" style={{ gap: '0.5rem' }}>
                    {[
                      { label: 'Lowercase', ok: result.passwordAnalysis.hasLowercase },
                      { label: 'Uppercase', ok: result.passwordAnalysis.hasUppercase },
                      { label: 'Numbers',   ok: result.passwordAnalysis.hasNumbers },
                      { label: 'Symbols',   ok: result.passwordAnalysis.hasSpecialChars },
                    ].map(c => (
                      <div key={c.label} className="flex items-center gap-sm">
                        {c.ok ? <CheckCircle size={12} color="var(--clr-green)" /> : <AlertTriangle size={12} color="var(--clr-red)" />}
                        <span className="text-xs" style={{ color: c.ok ? 'var(--clr-green)' : 'var(--clr-red)' }}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                  {result.passwordAnalysis.foundInCommonList && (
                    <div className="flex items-center gap-sm mt-md" style={{ background: 'rgba(255,59,59,0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      <AlertTriangle size={13} color="var(--clr-red)" />
                      <span className="text-xs" style={{ color: 'var(--clr-red)' }}>Found in common password list! Change immediately.</span>
                    </div>
                  )}
                </div>

                {/* Crack time */}
                <div className="glass-card p-lg">
                  <div className="flex items-center gap-sm mb-md">
                    <Clock size={16} color="var(--clr-cyan)" />
                    <p className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estimated Crack Time</p>
                  </div>
                  <div className="grid-2" style={{ gap: '0.75rem' }}>
                    <div className="glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <p className="text-xs text-muted mb-sm">Average Case</p>
                      <p style={{ fontFamily: 'var(--font-hud)', fontSize: '0.9rem', color: 'var(--clr-cyan)' }}>
                        {result.crackEstimate.averageCase}
                      </p>
                    </div>
                    <div className="glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <p className="text-xs text-muted mb-sm">Worst Case</p>
                      <p style={{ fontFamily: 'var(--font-hud)', fontSize: '0.9rem', color: 'var(--clr-yellow)' }}>
                        {result.crackEstimate.worstCase}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted mt-md">
                    Attack speed: <span style={{ color: 'var(--clr-cyan)', fontFamily: 'var(--font-mono)' }}>{result.crackEstimate.attackSpeed}</span>
                  </p>
                </div>

                {/* Attempt timeline */}
                <div className="glass-card p-lg">
                  <p className="text-xs text-muted mb-md" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Simulated Attack Timeline
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 200, overflowY: 'auto' }}>
                    {result.attemptTimeline.slice(0, attemptIdx).map((attempt, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-md"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--clr-text-3)', minWidth: 24 }}>#{attempt.attempt}</span>
                        <span style={{ color: attempt.success ? 'var(--clr-red)' : 'var(--clr-text-2)', flex: 1 }}>
                          {attempt.password}
                        </span>
                        {attempt.success
                          ? <span style={{ color: 'var(--clr-red)', fontSize: '0.65rem', fontWeight: 700 }}>✓ FOUND</span>
                          : <span style={{ color: 'var(--clr-text-3)', fontSize: '0.65rem' }}>✗ FAIL</span>}
                      </motion.div>
                    ))}
                  </div>
                  {/* Lockout */}
                  {result.lockoutSimulation.triggered && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                      className="mt-md" style={{ background: 'rgba(255,136,0,0.1)', border: '1px solid rgba(255,136,0,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                      <div className="flex items-center gap-sm">
                        <AlertTriangle size={13} color="var(--clr-orange)" />
                        <span className="text-xs" style={{ color: 'var(--clr-orange)' }}>
                          🔒 Account locked after {result.lockoutSimulation.maxAttempts} failed attempts — {result.lockoutSimulation.lockoutDuration} lockout
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Prevention */}
                <div className="glass-card p-lg" style={{ borderColor: 'rgba(0,255,136,0.2)' }}>
                  <div className="flex items-center gap-sm mb-md">
                    <Shield size={16} color="var(--clr-green)" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-green)' }}>Defense Techniques</span>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {result.prevention.methods.map(m => (
                      <li key={m} className="flex items-center gap-sm">
                        <CheckCircle size={11} color="var(--clr-green)" style={{ flexShrink: 0 }} />
                        <span className="text-xs text-muted">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card scan-line"
                style={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <Lock size={48} color="var(--clr-text-3)" />
                <p className="text-muted text-sm">Enter a password to run the analysis</p>
                <div className="terminal-cursor" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
