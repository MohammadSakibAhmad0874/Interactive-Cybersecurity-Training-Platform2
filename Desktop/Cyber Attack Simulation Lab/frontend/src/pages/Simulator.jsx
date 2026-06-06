import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Code, Lock, AlertTriangle, Shield, ChevronRight, Play, RotateCcw } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import SQLInjectionLab from '../components/labs/SQLInjectionLab.jsx'
import XSSLab from '../components/labs/XSSLab.jsx'
import BruteForceLab from '../components/labs/BruteForceLab.jsx'

const labs = [
  {
    id: 'sql-injection',
    label: 'SQL Injection',
    icon: Database,
    color: 'var(--clr-red)',
    badge: 'CRITICAL',
    desc: 'Explore how injection attacks bypass authentication and extract sensitive data from databases.',
    cvss: '9.8',
  },
  {
    id: 'xss',
    label: 'Cross-Site Scripting',
    icon: Code,
    color: 'var(--clr-yellow)',
    badge: 'HIGH',
    desc: 'Learn how malicious scripts are injected into web pages viewed by other users.',
    cvss: '8.8',
  },
  {
    id: 'brute-force',
    label: 'Brute Force',
    icon: Lock,
    color: 'var(--clr-cyan)',
    badge: 'MEDIUM',
    desc: 'Simulate systematic password attacks and understand lockout and rate-limiting defenses.',
    cvss: '7.5',
  },
]

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

export default function Simulator() {
  const { type } = useParams()
  const [activeTab, setActiveTab] = useState(type || 'sql-injection')

  const activeLab = labs.find(l => l.id === activeTab)

  return (
    <>
      <Helmet>
        <title>Attack Simulator – Cyber Attack Simulation Lab</title>
        <meta name="description" content="Safe, sandboxed simulations of SQL Injection, XSS, and Brute Force attacks for cybersecurity education." />
      </Helmet>

      <div className="container section">
        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={fadeIn} className="mb-xl">
          <div className="flex items-center gap-sm mb-md">
            <span className="badge badge-red">
              <AlertTriangle size={10} /> Educational Sandbox Only
            </span>
            <span className="badge badge-green">No Real Attacks Executed</span>
          </div>
          <h1 className="font-hud" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', marginBottom: '0.5rem' }}>
            Attack <span className="text-gradient-cyan">Simulator</span>
          </h1>
          <p className="text-muted">
            Interact with safe, fully sandboxed simulations. All results are educational demonstrations only.
          </p>
        </motion.div>

        {/* Lab selector tabs */}
        <div className="flex items-center gap-md mb-xl" style={{ flexWrap: 'wrap' }}>
          {labs.map(lab => {
            const Icon = lab.icon
            const isActive = activeTab === lab.id
            return (
              <motion.button
                key={lab.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(lab.id)}
                id={`lab-tab-${lab.id}`}
                className={`glass-card`}
                style={{
                  padding: '1rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  cursor: 'pointer', flex: '1', minWidth: 180,
                  borderColor: isActive ? lab.color : undefined,
                  boxShadow: isActive ? `0 0 20px ${lab.color}25` : undefined,
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${lab.color}18`, color: lab.color,
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{lab.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-3)' }}>CVSS {lab.cvss}</div>
                </div>
                <span className="badge" style={{
                  marginLeft: 'auto', background: `${lab.color}18`,
                  color: lab.color, borderColor: `${lab.color}25`, fontSize: '0.6rem'
                }}>
                  {lab.badge}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Lab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'sql-injection' && <SQLInjectionLab />}
            {activeTab === 'xss'           && <XSSLab />}
            {activeTab === 'brute-force'   && <BruteForceLab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
