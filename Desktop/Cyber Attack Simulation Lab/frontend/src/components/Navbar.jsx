import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sun, Moon, LogIn, UserPlus, LayoutDashboard, LogOut, Settings, Menu, X } from 'lucide-react'
import { useAuthStore, useThemeStore } from '../store/index.js'
import toast from 'react-hot-toast'
import NotificationCenter from './NotificationCenter.jsx'

const navItems = [
  { label: 'Home',             to: '/' },
  { label: 'Attack Simulator', to: '/simulator' },
  { label: 'Learning Center',  to: '/learning' },
  { label: 'Prevention Guide', to: '/prevention' },
  { label: 'Checklist',        to: '/checklist' },
  { label: 'Analytics',        to: '/analytics' },
  { label: 'About',            to: '/about' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo" aria-label="Cyber Attack Simulation Lab home">
            <Shield size={22} style={{ filter: 'drop-shadow(0 0 6px var(--clr-cyan))' }} />
            <span className="font-hud" style={{ fontSize: '0.9rem' }}>CASL</span>
            <span className="badge badge-green" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>EDU</span>
          </Link>

          {/* Desktop nav links */}
          <ul className="nav-links" role="list">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            {/* Notification bell */}
            <NotificationCenter />

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="btn btn-ghost btn-sm">
                    <Settings size={14} /> Admin
                  </Link>
                )}
                <Link to="/dashboard" className="btn btn-ghost btn-sm">
                  <LayoutDashboard size={14} />
                  <span className="text-sm">{user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  <LogIn size={14} /> Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={14} /> Register
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mobile-menu open"
            style={{ overflow: 'hidden' }}
          >
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="neon-divider" />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                {user?.role === 'admin' && <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                <button onClick={handleLogout} className="nav-link" style={{ textAlign: 'left', width: '100%' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
