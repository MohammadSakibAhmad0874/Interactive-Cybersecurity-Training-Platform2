import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Target, BookOpen, Lock, Code, Database, Users, Zap, Github, Mail, Globe, CheckCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }

const techStack = [
  { layer: 'Frontend', items: ['React.js + Vite', 'Framer Motion', 'Chart.js', 'Zustand', 'React Router v6', 'Lucide Icons'] },
  { layer: 'Backend',  items: ['Node.js 20', 'Express.js', 'JWT Auth', 'Express-Validator', 'Morgan Logger', 'Helmet.js'] },
  { layer: 'Database', items: ['SQLite (better-sqlite3)', 'WAL Mode', 'Foreign Keys', 'Prepared Statements', 'Seed Data', 'Migrations'] },
  { layer: 'DevOps',   items: ['Docker', 'Docker Compose', 'Multi-stage Builds', 'Health Checks', 'Nginx Reverse Proxy', 'Environment Configs'] },
]

const securityPrinciples = [
  { icon: Shield, title: 'No Real Attacks', desc: 'All simulations are educational demonstrations. No actual malicious payloads are generated or executed.' },
  { icon: Lock,   title: 'Sandboxed Environment', desc: 'Every simulation runs in an isolated context with no access to real databases or external systems.' },
  { icon: Target, title: 'Input Sanitization', desc: 'All user inputs are validated, sanitized, and parameterized before any processing.' },
  { icon: Users,  title: 'Role-Based Access', desc: 'JWT authentication with strict role enforcement separates student and admin capabilities.' },
]

const roadmap = [
  { phase: 'v1.0', label: 'Current', items: ['SQL Injection Lab', 'XSS Lab', 'Brute Force Lab', 'Learning Center', 'Quiz System', 'Analytics Dashboard'] },
  { phase: 'v1.1', label: 'Q3 2025', items: ['CSRF Attack Lab', 'Directory Traversal Lab', 'API Security Module', 'Capture The Flag (CTF) Mode'] },
  { phase: 'v2.0', label: 'Q4 2025', items: ['AI-Powered Threat Analysis', 'Team/Group Learning', 'Enterprise SSO Integration', 'PDF Certificate Generation'] },
]

export default function About() {
  return (
    <>
      <Helmet>
        <title>About – Cyber Attack Simulation Lab</title>
        <meta name="description" content="Learn about the Cyber Attack Simulation Lab platform, its educational mission, technology stack, and security principles." />
      </Helmet>

      <div className="container section">
        {/* Hero */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="text-center mb-xl" style={{ maxWidth: 700, margin: '0 auto 3rem' }}>
          <motion.div variants={fadeUp}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--clr-cyan-dim)', border: '1px solid rgba(0,245,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 40px rgba(0,245,255,0.15)' }}>
              <Shield size={36} color="var(--clr-cyan)" />
            </div>
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-hud" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: '1rem' }}>
            About <span className="text-gradient-cyan">Cyber Attack Simulation Lab</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            A production-quality, educational cybersecurity training platform that teaches real attack techniques
            through completely safe, sandboxed simulations — built to impress and educate.
          </motion.p>
        </motion.div>

        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card p-xl mb-xl" style={{ borderColor: 'rgba(0,245,255,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'start' }}>
            <Target size={40} color="var(--clr-cyan)" style={{ marginTop: 4 }} />
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Our Mission</h2>
              <p className="text-muted" style={{ lineHeight: 1.8, marginBottom: '1rem' }}>
                Cybersecurity education should be hands-on, accessible, and risk-free. This platform bridges the gap between
                theory and practice by providing interactive simulations of the most critical web vulnerabilities identified
                by OWASP — without ever putting real systems at risk.
              </p>
              <p className="text-muted" style={{ lineHeight: 1.8 }}>
                Every simulation is carefully engineered to demonstrate exactly how attacks work at a conceptual level,
                accompanied by detection strategies and secure coding patterns that developers can apply immediately in production.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security principles */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="mb-xl">
          <motion.h2 variants={fadeUp} style={{ fontSize: '1.3rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span className="text-gradient-green">Security by Design</span>
          </motion.h2>
          <div className="feature-grid">
            {securityPrinciples.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp} className="glass-card feature-card">
                <div className="feature-icon mb-md" style={{ background: 'var(--clr-green-dim)', borderColor: 'rgba(0,255,136,0.15)', color: 'var(--clr-green)' }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</h3>
                <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech stack */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-xl">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Technology <span className="text-gradient-cyan">Stack</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {techStack.map(({ layer, items }) => (
              <div key={layer} className="glass-card p-lg">
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-cyan)', marginBottom: '1rem' }}>
                  {layer}
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-sm">
                      <CheckCircle size={11} color="var(--clr-green)" style={{ flexShrink: 0 }} />
                      <span className="text-sm text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Architecture */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card p-xl mb-xl">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>System Architecture</h2>
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
              <span className="terminal-title">Project Structure</span>
            </div>
            <div className="terminal-body" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 2 }}>
              {`cyber-attack-simulation-lab/
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level page components
│   │   ├── store/       # Zustand state management
│   │   └── lib/         # API client, utilities
│   └── Dockerfile
│
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Database initialization
│   │   ├── middleware/  # Auth, error handling
│   │   └── routes/      # API route handlers
│   └── Dockerfile
│
├── docs/              # Documentation & diagrams
└── docker-compose.yml # One-command deployment`}
            </div>
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-xl">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Development <span className="text-gradient-cyan">Roadmap</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {roadmap.map(({ phase, label, items }, i) => (
              <div key={phase} className="glass-card p-lg" style={{ borderColor: i === 0 ? 'rgba(0,255,136,0.3)' : 'var(--clr-border)' }}>
                <div className="flex items-center justify-between mb-md">
                  <span style={{ fontFamily: 'var(--font-hud)', color: i === 0 ? 'var(--clr-green)' : 'var(--clr-cyan)', fontSize: '1.1rem' }}>{phase}</span>
                  <span className={`badge ${i === 0 ? 'badge-green' : 'badge-cyan'}`} style={{ fontSize: '0.6rem' }}>{label}</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-sm">
                      {i === 0
                        ? <CheckCircle size={11} color="var(--clr-green)" style={{ flexShrink: 0 }} />
                        : <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--clr-text-3)', flexShrink: 0 }} />
                      }
                      <span className="text-sm text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* OWASP compliance */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card p-xl mb-xl" style={{ background: 'rgba(0,245,255,0.03)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>OWASP Coverage</h2>
          <p className="text-muted text-sm mb-lg" style={{ lineHeight: 1.7 }}>
            This platform covers the most critical vulnerabilities from the OWASP Top 10 Web Application Security Risks list.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {['A01: Broken Access Control', 'A02: Cryptographic Failures', 'A03: Injection (SQLi)', 'A07: Identification Failures (Brute Force)', 'A03: XSS (Injection)', 'A05: Security Misconfiguration'].map(item => (
              <span key={item} className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{item}</span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card p-xl text-center" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,245,255,0.05), transparent)' }}>
          <Zap size={40} color="var(--clr-cyan)" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 0 12px var(--clr-cyan))' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Ready to Start Learning?</h2>
          <p className="text-muted text-sm mb-xl">Explore all modules — no prior experience required.</p>
          <div className="flex items-center justify-center gap-md" style={{ flexWrap: 'wrap' }}>
            <Link to="/simulator" className="btn btn-primary btn-lg"><Shield size={16} /> Launch Simulator</Link>
            <Link to="/learning"  className="btn btn-secondary btn-lg"><BookOpen size={16} /> Start Learning</Link>
            <Link to="/quiz"      className="btn btn-ghost btn-lg"><Target size={16} /> Take a Quiz</Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}
