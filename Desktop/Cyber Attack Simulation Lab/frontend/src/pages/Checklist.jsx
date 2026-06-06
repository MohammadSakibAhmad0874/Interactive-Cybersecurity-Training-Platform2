/**
 * Security Checklist Page
 * Interactive checklist with 29 controls, scoring, and export
 */
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Shield, ClipboardList, AlertTriangle, Info } from 'lucide-react'
import SecurityChecklist from '../components/SecurityChecklist.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export default function Checklist() {
  return (
    <>
      <Helmet>
        <title>Security Checklist – Cyber Attack Simulation Lab</title>
        <meta
          name="description"
          content="Interactive cybersecurity checklist covering authentication, injection prevention, XSS defense, transport security, and infrastructure hardening."
        />
      </Helmet>

      <div className="container section">
        {/* Header */}
        <motion.div
          initial="hidden" animate="show" variants={fadeUp}
          className="mb-xl"
        >
          <div className="flex items-center gap-sm mb-md">
            <span className="badge badge-green">
              <ClipboardList size={10} /> Interactive Checklist
            </span>
            <span className="badge badge-cyan">29 Controls</span>
          </div>
          <h1
            className="font-hud"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', marginBottom: '0.5rem' }}
          >
            Security <span className="text-gradient-green">Checklist</span>
          </h1>
          <p className="text-muted" style={{ maxWidth: 580 }}>
            Audit your application against industry-standard security controls.
            Track progress, identify gaps, and export a report for your team or professor.
          </p>
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-md mb-xl"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            borderColor: 'rgba(0,245,255,0.2)',
            background: 'rgba(0,245,255,0.04)',
          }}
        >
          <Info size={16} style={{ color: 'var(--clr-cyan)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--clr-cyan)' }}>How it works:</strong> Check each item
            as you implement it in your application. Your progress is saved automatically in the
            browser. Use <strong>Export</strong> to download a text report for submission.
            Controls are colour-coded by severity: <span style={{ color: 'var(--clr-red)' }}>Critical</span> →{' '}
            <span style={{ color: 'var(--clr-orange)' }}>High</span> →{' '}
            <span style={{ color: 'var(--clr-yellow)' }}>Medium</span> →{' '}
            <span style={{ color: 'var(--clr-green)' }}>Low</span>.
          </p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-md mb-xl"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            borderColor: 'rgba(255,204,0,0.2)',
            background: 'rgba(255,204,0,0.04)',
          }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--clr-yellow)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--clr-text-2)' }}>
            This checklist is an <strong style={{ color: 'var(--clr-text-1)' }}>educational guide</strong> based
            on OWASP Top 10 and industry best practices. It does not constitute a formal security audit.
            For production systems, consult a qualified security professional.
          </p>
        </motion.div>

        {/* The checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SecurityChecklist />
        </motion.div>

        {/* OWASP reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-lg mt-xl text-center"
          style={{ borderColor: 'rgba(0,255,136,0.15)' }}
        >
          <Shield size={24} style={{ color: 'var(--clr-green)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>Based on Industry Standards</h3>
          <p className="text-sm text-muted">
            Controls derived from{' '}
            <a
              href="https://owasp.org/www-project-top-ten/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--clr-cyan)' }}
            >
              OWASP Top 10
            </a>
            {', '}
            <a
              href="https://www.nist.gov/cyberframework"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--clr-cyan)' }}
            >
              NIST Cybersecurity Framework
            </a>
            {', and '}
            <a
              href="https://www.sans.org/top25-software-errors/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--clr-cyan)' }}
            >
              SANS Top 25
            </a>.
          </p>
        </motion.div>
      </div>
    </>
  )
}
