import { Shield, Eye, Database, Lock, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import './StaticPages.css'

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: 'What We Collect',
      body: `We collect only what's necessary: your name, email, role, tech stack, and skills that you voluntarily provide. We do not collect payment information, sell data, or run third-party advertising trackers.`
    },
    {
      icon: Eye,
      title: 'How We Use It',
      body: `Your profile data is used exclusively to power the AI matching engine. Match scores are computed locally on our server and are never shared with third parties.`
    },
    {
      icon: Shield,
      title: 'Data Security',
      body: `Passwords are hashed with bcrypt. Auth tokens are JWT-signed and expire automatically. All API routes are protected with authorization middleware. We use HTTPS for all connections.`
    },
    {
      icon: Lock,
      title: 'Your Rights',
      body: `You can update or delete your profile data at any time from the Profile page. To request full account deletion, contact us at 23322147012@deshbhagatuniversity.in and we'll process it within 48 hours.`
    }
  ]

  return (
    <div className="static-page">
      <div className="static-hero">
        <div className="static-badge">
          <Shield size={14} /> Privacy First
        </div>
        <h1 className="hd-heading">Privacy Policy</h1>
        <p className="static-lead">
          We built DevMatch to help developers, not to exploit their data. Here's exactly what we collect and why.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Last updated: April 2026 · Team Zero-Gravity
        </p>
      </div>

      <div className="static-content page-container">
        <div className="privacy-sections">
          {sections.map(s => (
            <div key={s.title} className="privacy-item glass-card">
              <div className="privacy-icon">
                <s.icon size={22} />
              </div>
              <div>
                <h2 className="hd-heading">{s.title}</h2>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="static-cta glass-card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Questions about your data? Reach us at{' '}
            <a href="mailto:23322147012@deshbhagatuniversity.in" style={{ color: 'var(--primary-light)' }}>
              23322147012@deshbhagatuniversity.in
            </a>
          </p>
          <Link to="/" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
