import { motion, AnimatePresence } from 'framer-motion'
import { Shield } from 'lucide-react'

const statuses = [
  'Initializing secure environment...',
  'Loading threat databases...',
  'Configuring sandboxed simulations...',
  'Starting Cyber Attack Simulation Lab...',
]

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
      >
        {/* Shield logo */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            border: '2px solid var(--clr-cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(0,245,255,0.3), inset 0 0 20px rgba(0,245,255,0.05)',
          }}
        >
          <Shield size={32} color="var(--clr-cyan)" />
        </motion.div>

        <div className="loading-logo font-hud">
          CYBER ATTACK SIMULATION LAB
        </div>

        {/* Loading bar */}
        <div className="loading-bar-wrap">
          <div className="loading-bar-fill" />
        </div>

        {/* Status text cycling */}
        <motion.p
          key={0}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="loading-status"
        >
          {statuses[0]}
        </motion.p>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--clr-cyan)', display: 'block' }}
            />
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--clr-text-3)', letterSpacing: '0.1em' }}>
          FOR EDUCATIONAL PURPOSES ONLY
        </p>
      </motion.div>
    </div>
  )
}
