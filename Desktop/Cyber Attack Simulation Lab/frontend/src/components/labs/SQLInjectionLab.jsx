import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, AlertTriangle, Shield, Eye, EyeOff, Play, CheckCircle, XCircle, Info } from 'lucide-react'
import api from '../../lib/api.js'
import toast from 'react-hot-toast'

export default function SQLInjectionLab() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('vulnerable')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const quickPayloads = [
    { label: "Classic Auth Bypass", value: "' OR '1'='1", pw: "' OR '1'='1" },
    { label: "Comment Bypass",      value: "admin'--",     pw: "anything" },
    { label: "UNION Extract",       value: "' UNION SELECT 1,2,3--", pw: "x" },
    { label: "Safe Input",          value: "john_doe",     pw: "SecurePass123!" },
  ]

  const run = async () => {
    if (!username || !password) return toast.error('Enter username and password')
    setLoading(true)
    try {
      const { data } = await api.post('/simulations/sql-injection', { username, password, mode })
      setResult(data)
    } catch {
      toast.error('Simulation failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const riskColor = {
    CRITICAL: 'var(--clr-red)',
    HIGH: 'var(--clr-orange)',
    MEDIUM: 'var(--clr-yellow)',
    SAFE: 'var(--clr-green)',
  }

  return (
    <div>
      {/* Intro */}
      <div className="glass-card p-xl mb-lg">
        <div className="flex items-center gap-md mb-md">
          <div className="feature-icon" style={{ background: 'rgba(255,59,59,0.12)', color: 'var(--clr-red)', borderColor: 'rgba(255,59,59,0.2)' }}>
            <Database size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 2 }}>SQL Injection Laboratory</h2>
            <div className="flex items-center gap-sm">
              <span className="badge badge-red">OWASP #1</span>
              <span className="badge badge-cyan">CVSS 9.8</span>
              <span className="badge badge-green">Safe Sandbox</span>
            </div>
          </div>
        </div>
        <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>
          SQL Injection occurs when user-supplied input is concatenated directly into a SQL query without sanitization.
          Try the quick payloads below to see how a vulnerable login form can be bypassed, then switch to <strong>Secure Mode</strong> to
          see how parameterized queries prevent the attack.
        </p>
      </div>

      <div className="sim-layout">
        {/* LEFT: Input panel */}
        <div>
          {/* Mode toggle */}
          <div className="glass-card p-lg mb-lg">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Simulation Mode
            </p>
            <div className="flex gap-sm">
              {['vulnerable', 'secure'].map(m => (
                <button
                  key={m}
                  id={`mode-${m}`}
                  onClick={() => { setMode(m); setResult(null) }}
                  className={m === mode ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  style={{ flex: 1, textTransform: 'capitalize' }}
                >
                  {m === 'vulnerable' ? <><AlertTriangle size={13} /> Vulnerable</> : <><Shield size={13} /> Secure</>}
                </button>
              ))}
            </div>
            {mode === 'vulnerable' && (
              <p className="text-xs" style={{ color: 'var(--clr-red)', marginTop: '0.5rem' }}>
                ⚠ Vulnerable mode — showing what would happen WITHOUT defenses
              </p>
            )}
            {mode === 'secure' && (
              <p className="text-xs" style={{ color: 'var(--clr-green)', marginTop: '0.5rem' }}>
                ✓ Secure mode — parameterized queries active
              </p>
            )}
          </div>

          {/* Quick payloads */}
          <div className="glass-card p-lg mb-lg">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Quick Payloads
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quickPayloads.map(p => (
                <button
                  key={p.label}
                  id={`payload-${p.label.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => { setUsername(p.value); setPassword(p.pw); setResult(null) }}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                >
                  <span style={{ color: 'var(--clr-text-3)' }}>{p.label}:</span>
                  <span style={{ color: 'var(--clr-cyan)' }}>{p.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Login form (vulnerable/secure) */}
          <div className="glass-card p-lg">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {mode === 'vulnerable' ? '⚠ Vulnerable Login Form' : '✓ Secure Login Form'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>Username / Payload</label>
                <input
                  id="sqli-username"
                  className="cyber-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                />
              </div>
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>Password</label>
                <input
                  id="sqli-password"
                  className="cyber-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="e.g. password123"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={run}
                disabled={loading}
                className="btn btn-primary w-full"
                id="sqli-run-btn"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Play size={16} />
                  </motion.div>
                ) : <><Play size={16} /> Run Simulation</>}
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT: Results panel */}
        <div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Risk level */}
                <div className="glass-card p-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Risk Level</p>
                    <span className={`risk-label risk-${result.inputAnalysis.riskLevel.toLowerCase()}`}>
                      ● {result.inputAnalysis.riskLevel}
                    </span>
                  </div>
                  <div className="mt-md">
                    {result.inputAnalysis.detectedPatterns.length > 0 ? (
                      result.inputAnalysis.detectedPatterns.map(p => (
                        <div key={p} className="flex items-center gap-sm mt-sm">
                          <AlertTriangle size={13} color="var(--clr-red)" />
                          <span className="text-xs" style={{ color: 'var(--clr-red)' }}>{p}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-sm mt-sm">
                        <CheckCircle size={13} color="var(--clr-green)" />
                        <span className="text-xs" style={{ color: 'var(--clr-green)' }}>No injection patterns detected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Query visualization */}
                <div className="glass-card p-lg">
                  <p className="text-xs text-muted mb-md" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Generated Queries</p>
                  <p className="text-xs text-muted mb-sm">Vulnerable query:</p>
                  <div className="code-block" style={{ fontSize: '0.75rem', marginBottom: '0.75rem', color: result.inputAnalysis.isInjectionDetected ? 'var(--clr-red)' : 'var(--clr-text-1)' }}>
                    {result.queries.vulnerable}
                  </div>
                  <p className="text-xs text-muted mb-sm">Secure parameterized query:</p>
                  <div className="code-block" style={{ fontSize: '0.75rem', color: 'var(--clr-green)' }}>
                    {result.queries.secure}
                  </div>
                </div>

                {/* Simulation result */}
                <div className="glass-card p-lg" style={{
                  borderColor: result.result.bypassedAuth ? 'rgba(255,59,59,0.3)' : 'rgba(0,255,136,0.3)',
                }}>
                  <div className="flex items-center gap-sm mb-sm">
                    {result.result.bypassedAuth
                      ? <XCircle size={18} color="var(--clr-red)" />
                      : <CheckCircle size={18} color="var(--clr-green)" />
                    }
                    <span style={{ fontWeight: 700, color: result.result.bypassedAuth ? 'var(--clr-red)' : 'var(--clr-green)' }}>
                      {result.result.bypassedAuth ? 'Authentication BYPASSED' : 'Authentication Protected'}
                    </span>
                  </div>
                  <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>{result.result.explanation}</p>
                  {result.result.simulatedData?.length > 0 && (
                    <div className="code-block mt-md" style={{ fontSize: '0.72rem' }}>
                      <span className="comment">// Simulated data leak (educational only):</span>
                      <br />
                      {JSON.stringify(result.result.simulatedData, null, 2)}
                    </div>
                  )}
                </div>

                {/* Prevention */}
                <div className="glass-card p-lg" style={{ borderColor: 'rgba(0,255,136,0.2)' }}>
                  <div className="flex items-center gap-sm mb-md">
                    <Shield size={16} color="var(--clr-green)" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-green)' }}>Prevention Techniques</span>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {result.prevention.methods.map(m => (
                      <li key={m} className="flex items-center gap-sm">
                        <CheckCircle size={11} color="var(--clr-green)" style={{ flexShrink: 0 }} />
                        <span className="text-xs text-muted">{m}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-md">
                    <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>Severity: {result.prevention.severity}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card scan-line"
                style={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
              >
                <Database size={48} color="var(--clr-text-3)" />
                <p className="text-muted text-sm">Enter credentials and run the simulation</p>
                <p className="text-xs text-muted font-mono">Awaiting input...</p>
                <div className="terminal-cursor" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
