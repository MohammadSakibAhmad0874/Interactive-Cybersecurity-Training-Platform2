import { Link } from 'react-router-dom'
import { Shield, Github, ExternalLink } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  const links = {
    Platform: [
      { label: 'Home', to: '/' },
      { label: 'Attack Simulator', to: '/simulator' },
      { label: 'Learning Center', to: '/learning' },
      { label: 'Prevention Guide', to: '/prevention' },
    ],
    Resources: [
      { label: 'Analytics',          to: '/analytics' },
      { label: 'Quiz Center',        to: '/quiz' },
      { label: 'Security Checklist', to: '/checklist' },
      { label: 'About',              to: '/about' },
      { label: 'OWASP Top 10', href: 'https://owasp.org/www-project-top-ten/' },
    ],
    Legal: [
      { label: 'Educational Use Only', to: '/' },
      { label: 'Safe Simulations', to: '/about' },
    ],
  }

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="grid-4" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem' }}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-sm mb-md">
              <Shield size={20} color="var(--clr-cyan)" style={{ filter: 'drop-shadow(0 0 6px var(--clr-cyan))' }} />
              <span className="font-hud" style={{ color: 'var(--clr-cyan)', fontSize: '0.9rem' }}>
                Cyber Attack Simulation Lab
              </span>
            </div>
            <p className="text-muted text-sm" style={{ lineHeight: 1.7, maxWidth: 280 }}>
              A safe, sandboxed cybersecurity education platform for learning about common web vulnerabilities
              through interactive simulations.
            </p>
            <div className="flex items-center gap-sm mt-md">
              <span className="badge badge-green">Educational Only</span>
              <span className="badge badge-cyan">No Real Attacks</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-text-2)', marginBottom: '1rem' }}>
                {title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map(item => (
                  <li key={item.label}>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-muted"
                        style={{ transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onMouseEnter={e => e.target.style.color = 'var(--clr-cyan)'}
                        onMouseLeave={e => e.target.style.color = ''}
                      >
                        {item.label} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <Link to={item.to} className="text-sm text-muted"
                        style={{ transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = 'var(--clr-cyan)'}
                        onMouseLeave={e => e.target.style.color = ''}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="neon-divider" />

        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <p className="text-xs text-muted font-mono">
            © {year} Cyber Attack Simulation Lab — For Educational Purposes Only
          </p>
          <p className="text-xs text-muted">
            Built with React + Node.js + SQLite
          </p>
          <div className="flex items-center gap-sm">
            <span className="badge badge-red" style={{ fontSize: '0.6rem' }}>⚠ No Real Attacks</span>
            <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>✓ Safe Sandbox</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
