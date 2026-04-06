import { useContext, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext, ThemeContext } from '../App'
import {
  Code2, Menu, X, LogOut, User, MessageCircle,
  Calendar, Compass, LayoutDashboard, Sun, Moon,
  Github, Linkedin, Settings
} from 'lucide-react'
import { auth as authApi } from '../services/api'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Scroll-based glass enhancement
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/')
  }

  const scrollToSection = (e, sectionId) => {
    e.preventDefault()
    setMobileOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }

  const navLinks = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/discover',  label: 'Discover',  icon: Compass },
    { path: '/chat',      label: 'Chat',      icon: MessageCircle },
    { path: '/meetups',   label: 'Meetups',   icon: Calendar },
    { path: '/profile',   label: 'Profile',   icon: User },
  ] : []

  const landingLinks = [
    { id: 'features',    label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'cta',         label: 'Get Started' },
  ]

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Brand */}
          <Link to="/" className="navbar-brand" id="nav-brand">
            <div className="brand-icon">
              <Code2 size={20} />
            </div>
            <span className="brand-text">DevMatch</span>
          </Link>

          {/* Center nav links */}
          <div className={`navbar-links ${mobileOpen ? 'open' : ''}`} id="navbar-links">
            {user
              ? navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-link ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <link.icon size={17} />
                    <span>{link.label}</span>
                  </Link>
                ))
              : landingLinks.map(link => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className="nav-link"
                    onClick={e => scrollToSection(e, link.id)}
                  >
                    {link.label}
                  </a>
                ))
            }

            {/* Mobile-only extras */}
            <div className="mobile-extras">
              <a href="https://github.com/adi4sure" target="_blank" rel="noopener noreferrer" className="nav-link">
                <Github size={17} /> adi4sure
              </a>
              <a href="https://github.com/MohammadSakibAhmad0874" target="_blank" rel="noopener noreferrer" className="nav-link">
                <Github size={17} /> MohammadSakibAhmad0874
              </a>
            </div>
          </div>

          {/* Right actions */}
          <div className="navbar-actions">
            {/* GitHub links (desktop) */}
            <div className="nav-social desktop-only">
              <a
                href="https://github.com/adi4sure"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-icon-btn"
                title="GitHub: adi4sure"
                id="nav-github-1"
              >
                <Github size={18} />
              </a>
              <a
                href="https://github.com/MohammadSakibAhmad0874"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-icon-btn"
                title="GitHub: MohammadSakibAhmad0874"
                id="nav-github-2"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-icon-btn"
                title="LinkedIn"
                id="nav-linkedin"
              >
                <Linkedin size={18} />
              </a>
            </div>

            {/* Theme toggle */}
            <button
              className="nav-icon-btn theme-toggle"
              onClick={toggleTheme}
              title="Toggle theme"
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <div className="nav-user desktop-only">
                  <div className="avatar avatar-sm">{user.name?.charAt(0).toUpperCase()}</div>
                  <span className="nav-user-name">{user.name?.split(' ')[0]}</span>
                </div>
                <Link to="/settings" className="nav-icon-btn desktop-only" title="Settings" id="nav-settings">
                  <Settings size={18} />
                </Link>
                <button className="nav-icon-btn" onClick={handleLogout} id="logout-btn" title="Logout">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-ghost btn-sm desktop-only" id="login-nav-btn">Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="register-nav-btn">Get Started</Link>
              </>
            )}

            {/* Hamburger */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen(prev => !prev)}
              id="hamburger-btn"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}
