/**
 * NotificationCenter — Slide-in notification panel
 * Displays recent security events, quiz completions, lesson achievements
 * Listens to a custom 'app:notify' event dispatched by any module
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCircle, AlertTriangle, Zap, Info, Trophy } from 'lucide-react'

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  info:    Info,
  xp:      Zap,
  badge:   Trophy,
}

const COLORS = {
  success: 'var(--clr-green)',
  warning: 'var(--clr-yellow)',
  info:    'var(--clr-cyan)',
  xp:      'var(--clr-cyan)',
  badge:   'var(--clr-yellow)',
}

let _idCounter = 0
const genId = () => ++_idCounter

// Utility: dispatch a notification from anywhere in the app
export function notify(message, type = 'info', duration = 5000) {
  window.dispatchEvent(new CustomEvent('app:notify', {
    detail: { id: genId(), message, type, duration }
  }))
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  // Seed some initial notifications on mount
  useEffect(() => {
    const seeds = [
      { id: genId(), message: 'Welcome to Cyber Attack Simulation Lab!', type: 'info' },
      { id: genId(), message: 'SQL Injection lab is available — no real attacks executed.', type: 'warning' },
      { id: genId(), message: 'Complete 3 lessons to earn the "On a Roll" badge.', type: 'badge' },
    ]
    setNotifications(seeds)
    setUnread(seeds.length)
  }, [])

  const addNotification = useCallback((e) => {
    const n = e.detail
    setNotifications(prev => [n, ...prev].slice(0, 20))
    setUnread(c => c + 1)

    // Auto-dismiss after duration
    if (n.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(x => x.id !== n.id))
      }, n.duration)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('app:notify', addNotification)
    return () => window.removeEventListener('app:notify', addNotification)
  }, [addNotification])

  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id))
  const clearAll = () => { setNotifications([]); setUnread(0) }

  const handleOpen = () => { setOpen(o => !o); setUnread(0) }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
        id="notification-bell"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
        className="btn btn-ghost btn-sm"
        style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', position: 'relative' }}
      >
        <Bell size={16} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--clr-red)', color: '#fff',
                borderRadius: '50%', width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 800, lineHeight: 1,
              }}
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 199 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: 340, maxHeight: 480,
                zIndex: 200, display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-md"
                style={{ borderBottom: '1px solid var(--clr-border)' }}>
                <div className="flex items-center gap-sm">
                  <Bell size={14} style={{ color: 'var(--clr-cyan)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notifications</span>
                  {notifications.length > 0 && (
                    <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>
                      {notifications.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAll}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                  disabled={notifications.length === 0}
                >
                  Clear all
                </button>
              </div>

              {/* Notifications list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <AnimatePresence initial={false}>
                  {notifications.length === 0 ? (
                    <div className="text-center p-xl" style={{ color: 'var(--clr-text-3)' }}>
                      <Bell size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                      <p style={{ fontSize: '0.8rem' }}>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const Icon = ICONS[n.type] || Info
                      const color = COLORS[n.type] || 'var(--clr-text-1)'
                      return (
                        <motion.div
                          key={n.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          style={{
                            padding: '0.85rem 1rem',
                            borderBottom: '1px solid var(--clr-border)',
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                          }}
                        >
                          <Icon size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
                          <p style={{ fontSize: '0.8rem', lineHeight: 1.5, flex: 1 }}>{n.message}</p>
                          <button
                            onClick={() => dismiss(n.id)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--clr-text-3)', flexShrink: 0, padding: 2,
                            }}
                            aria-label="Dismiss notification"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
