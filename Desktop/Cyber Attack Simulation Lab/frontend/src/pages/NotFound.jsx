import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, Shield, Terminal } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 – Page Not Found – Cyber Attack Simulation Lab</title></Helmet>
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glitch 404 */}
            <div style={{
              fontFamily: 'var(--font-hud)',
              fontSize: 'clamp(5rem, 15vw, 10rem)',
              fontWeight: 900,
              color: 'var(--clr-cyan)',
              lineHeight: 1,
              textShadow: '0 0 40px rgba(0,245,255,0.4), 3px 3px 0 rgba(255,59,59,0.3), -3px -3px 0 rgba(0,255,136,0.2)',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}>
              404
            </div>
            <p className="font-mono" style={{ color: 'var(--clr-red)', fontSize: '0.85rem', marginBottom: '2rem', letterSpacing: '0.08em' }}>
              ACCESS DENIED — ROUTE NOT FOUND
            </p>

            {/* Terminal message */}
            <div className="terminal" style={{ maxWidth: 480, margin: '0 auto 2.5rem', textAlign: 'left' }}>
              <div className="terminal-header">
                <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
                <span className="terminal-title">system error</span>
              </div>
              <div className="terminal-body">
                <div className="terminal-line"><span className="prompt">$</span> <span className="cmd">navigate --path="{window.location.pathname}"</span></div>
                <div className="terminal-line mt-sm"><span className="error">Error: Route not found in routing table</span></div>
                <div className="terminal-line"><span className="warn">Warning: Attempting fallback to home...</span></div>
                <div className="terminal-line"><span className="output">Recommendation: Return to safe zone</span></div>
                <div className="terminal-line"><div className="terminal-cursor" /></div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-md" style={{ flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-primary btn-lg" id="go-home-btn">
                <Home size={16} /> Return Home
              </Link>
              <Link to="/simulator" className="btn btn-secondary btn-lg">
                <Shield size={16} /> Try a Simulation
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
