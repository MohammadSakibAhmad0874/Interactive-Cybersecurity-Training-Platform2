/**
 * SecurityChecklist — Interactive Security Checklist with scoring
 * Organized by category with progress tracking and export
 * Purely client-side — persisted in localStorage
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, ChevronDown, ChevronRight, Shield, Download, RotateCcw } from 'lucide-react'

const CHECKLIST = [
  {
    id: 'auth',
    label: 'Authentication & Access Control',
    color: 'var(--clr-cyan)',
    items: [
      { id: 'a1', text: 'Enforce strong password policy (min 12 chars, complexity)', severity: 'critical' },
      { id: 'a2', text: 'Implement Multi-Factor Authentication (MFA)', severity: 'critical' },
      { id: 'a3', text: 'Use bcrypt / Argon2 for password hashing (never MD5 / SHA-1)', severity: 'critical' },
      { id: 'a4', text: 'Implement account lockout after 5 failed attempts', severity: 'high' },
      { id: 'a5', text: 'Use short-lived JWT tokens (max 7 days) with refresh rotation', severity: 'high' },
      { id: 'a6', text: 'Revoke all sessions on password change', severity: 'medium' },
    ],
  },
  {
    id: 'injection',
    label: 'Injection Prevention',
    color: 'var(--clr-red)',
    items: [
      { id: 'i1', text: 'Use parameterized queries / prepared statements everywhere', severity: 'critical' },
      { id: 'i2', text: 'Validate and sanitize all user input on the server', severity: 'critical' },
      { id: 'i3', text: 'Apply allowlist input validation (not blocklist)', severity: 'high' },
      { id: 'i4', text: 'Deploy a Web Application Firewall (WAF)', severity: 'high' },
      { id: 'i5', text: 'Use ORM frameworks that prevent raw SQL construction', severity: 'medium' },
      { id: 'i6', text: 'Enable database activity monitoring and alerting', severity: 'medium' },
    ],
  },
  {
    id: 'xss',
    label: 'XSS Defense',
    color: 'var(--clr-yellow)',
    items: [
      { id: 'x1', text: 'Implement Content Security Policy (CSP) headers', severity: 'critical' },
      { id: 'x2', text: 'HTML-encode all user-supplied output by default', severity: 'critical' },
      { id: 'x3', text: 'Use modern frameworks (React, Vue) with auto-escaping', severity: 'high' },
      { id: 'x4', text: 'Set HTTPOnly and Secure flags on all cookies', severity: 'high' },
      { id: 'x5', text: 'Implement X-XSS-Protection and X-Content-Type-Options headers', severity: 'medium' },
      { id: 'x6', text: 'Use Subresource Integrity (SRI) for third-party scripts', severity: 'low' },
    ],
  },
  {
    id: 'transport',
    label: 'Transport Security',
    color: 'var(--clr-green)',
    items: [
      { id: 't1', text: 'Enforce HTTPS everywhere — redirect all HTTP to HTTPS', severity: 'critical' },
      { id: 't2', text: 'Implement HTTP Strict Transport Security (HSTS)', severity: 'critical' },
      { id: 't3', text: 'Use TLS 1.2+ only — disable TLS 1.0/1.1', severity: 'high' },
      { id: 't4', text: 'Configure secure cipher suites and disable weak algorithms', severity: 'high' },
      { id: 't5', text: 'Validate all SSL/TLS certificates (no self-signed in prod)', severity: 'medium' },
    ],
  },
  {
    id: 'infra',
    label: 'Infrastructure & Configuration',
    color: 'var(--clr-orange)',
    items: [
      { id: 'n1', text: 'Apply principle of least privilege to all service accounts', severity: 'critical' },
      { id: 'n2', text: 'Remove all default credentials and sample files', severity: 'critical' },
      { id: 'n3', text: 'Keep all dependencies updated — scan for known CVEs weekly', severity: 'high' },
      { id: 'n4', text: 'Implement rate limiting on all public-facing endpoints', severity: 'high' },
      { id: 'n5', text: 'Enable comprehensive logging and alerting (SIEM)', severity: 'medium' },
      { id: 'n6', text: 'Conduct regular penetration testing (annually)', severity: 'medium' },
    ],
  },
]

const SEVERITY_COLORS = {
  critical: 'var(--clr-red)',
  high:     'var(--clr-orange)',
  medium:   'var(--clr-yellow)',
  low:      'var(--clr-green)',
}

const STORAGE_KEY = 'casl_security_checklist'

function loadChecked() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) }
  catch { return new Set() }
}

function saveChecked(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

export default function SecurityChecklist() {
  const [checked, setChecked] = useState(loadChecked)
  const [expanded, setExpanded] = useState({ auth: true })

  const allItems = CHECKLIST.flatMap(c => c.items)
  const total = allItems.length
  const done  = allItems.filter(item => checked.has(item.id)).length
  const pct   = Math.round((done / total) * 100)

  const scoreLabel = pct >= 90 ? 'Excellent' : pct >= 70 ? 'Good' : pct >= 50 ? 'Fair' : 'Needs Work'
  const scoreColor = pct >= 90 ? 'var(--clr-green)' : pct >= 70 ? 'var(--clr-cyan)' : pct >= 50 ? 'var(--clr-yellow)' : 'var(--clr-red)'

  const toggle = (id) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveChecked(next)
      return next
    })
  }

  const resetAll = () => { setChecked(new Set()); saveChecked(new Set()) }

  const exportReport = () => {
    const lines = [
      'CYBER ATTACK SIMULATION LAB — SECURITY CHECKLIST REPORT',
      `Generated: ${new Date().toLocaleString()}`,
      `Overall Score: ${pct}% (${done}/${total}) — ${scoreLabel}`,
      '',
      ...CHECKLIST.map(cat => {
        const catDone = cat.items.filter(i => checked.has(i.id)).length
        return [
          `\n[${cat.label}] — ${catDone}/${cat.items.length} completed`,
          ...cat.items.map(i => `  [${checked.has(i.id) ? 'x' : ' '}] [${i.severity.toUpperCase()}] ${i.text}`)
        ].join('\n')
      }),
    ].join('\n')

    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security-checklist-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Score header */}
      <div className="glass-card p-xl mb-lg" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 200, height: 200,
          background: `radial-gradient(circle, ${scoreColor}10 0%, transparent 70%)`,
          borderRadius: '50%', transform: 'translate(40%, -40%)',
        }} />
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="flex items-center gap-sm mb-sm">
              <Shield size={16} style={{ color: 'var(--clr-cyan)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-2)', fontWeight: 600, letterSpacing: '0.05em' }}>
                SECURITY SCORE
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{
                fontFamily: 'var(--font-hud)', fontSize: '3.5rem', fontWeight: 900,
                color: scoreColor, lineHeight: 1,
                textShadow: `0 0 20px ${scoreColor}60`,
              }}>
                {pct}%
              </span>
              <span style={{ color: scoreColor, fontWeight: 700 }}>{scoreLabel}</span>
            </div>
            <p className="text-sm text-muted mt-sm">{done} of {total} controls implemented</p>
          </div>

          <div style={{ minWidth: 180 }}>
            <div className="progress-bar" style={{ height: 12, marginBottom: '1rem' }}>
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}aa)` }}
              />
            </div>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              <button onClick={exportReport} className="btn btn-secondary btn-sm">
                <Download size={12} /> Export
              </button>
              <button onClick={resetAll} className="btn btn-ghost btn-sm">
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Severity legend */}
        <div className="flex gap-md mt-lg" style={{ flexWrap: 'wrap' }}>
          {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
            <div key={sev} className="flex items-center gap-xs">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-2)', textTransform: 'capitalize' }}>{sev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {CHECKLIST.map(cat => {
          const catDone  = cat.items.filter(i => checked.has(i.id)).length
          const catPct   = Math.round((catDone / cat.items.length) * 100)
          const isOpen   = !!expanded[cat.id]

          return (
            <div key={cat.id} className="glass-card" style={{ overflow: 'hidden' }}>
              {/* Category header */}
              <button
                onClick={() => setExpanded(e => ({ ...e, [cat.id]: !isOpen }))}
                style={{
                  width: '100%', padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
                aria-expanded={isOpen}
                id={`checklist-cat-${cat.id}`}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: `${cat.color}18`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <Shield size={16} style={{ color: cat.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{cat.label}</span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-hud)', color: cat.color }}>
                      {catDone}/{cat.items.length}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 4, marginTop: 6 }}>
                    <div className="progress-fill" style={{
                      width: `${catPct}%`,
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                    }} />
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: 'var(--clr-text-3)', flexShrink: 0 }}
                >
                  <ChevronRight size={16} />
                </motion.div>
              </button>

              {/* Items */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ borderTop: '1px solid var(--clr-border)', padding: '0.5rem 0' }}>
                      {cat.items.map((item, idx) => {
                        const isDone = checked.has(item.id)
                        return (
                          <motion.button
                            key={item.id}
                            id={`check-${item.id}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => toggle(item.id)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'flex-start',
                              gap: '0.75rem', padding: '0.7rem 1.25rem',
                              background: isDone ? `${cat.color}06` : 'none',
                              border: 'none', cursor: 'pointer', textAlign: 'left',
                              transition: 'background 0.2s',
                            }}
                          >
                            <div style={{ flexShrink: 0, marginTop: 2 }}>
                              {isDone
                                ? <CheckCircle size={16} style={{ color: cat.color }} />
                                : <Circle size={16} style={{ color: 'var(--clr-text-3)' }} />
                              }
                            </div>
                            <span style={{
                              fontSize: '0.85rem', lineHeight: 1.5, flex: 1,
                              color: isDone ? 'var(--clr-text-2)' : 'var(--clr-text-1)',
                              textDecoration: isDone ? 'line-through' : 'none',
                              textDecorationColor: 'var(--clr-text-3)',
                            }}>
                              {item.text}
                            </span>
                            <span style={{
                              fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
                              color: SEVERITY_COLORS[item.severity],
                              textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3,
                            }}>
                              {item.severity}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
