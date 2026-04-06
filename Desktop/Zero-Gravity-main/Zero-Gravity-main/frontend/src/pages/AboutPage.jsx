import { Link } from 'react-router-dom'
import { Code2, Brain, Users, Zap, Globe, Github, Linkedin, ArrowRight } from 'lucide-react'
import './StaticPages.css'

export default function AboutPage() {
  const team = [
    {
      name: 'Aditya',
      github: 'adi4sure',
      role: 'Frontend & UI/UX',
      initial: 'A',
      color: 'var(--primary)',
      desc: 'Crafted the design system, user experience, and frontend architecture.'
    },
    {
      name: 'Mohammad Sakib Ahmad',
      github: 'MohammadSakibAhmad0874',
      role: 'Backend & AI Systems',
      initial: 'S',
      color: 'var(--accent)',
      desc: 'Built the AI matching engine using fuzzy logic, neural networks, and the RESTful API.'
    }
  ]

  return (
    <div className="static-page">
      <div className="static-hero">
        <div className="static-badge">
          <Code2 size={14} /> Team Zero-Gravity
        </div>
        <h1 className="hd-heading">About DevMatch</h1>
        <p className="static-lead">
          We built DevMatch to solve a real problem: finding the right hackathon teammates is hard,
          slow, and often random. We said — let AI do it better.
        </p>
      </div>

      <div className="static-content page-container">
        {/* Mission */}
        <div className="about-section hd-card">
          <div className="about-icon" style={{ background: 'var(--gradient-primary)' }}>
            <Brain size={28} />
          </div>
          <div>
            <h2 className="hd-heading">Our Mission</h2>
            <p>
              DevMatch exists to remove friction from hackathon team formation. By using
              fuzzy logic and neural networks to score developer compatibility, we help you
              find teammates who complement your skills, share your tech stack, and match
              your working style — in minutes, not days.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="about-section hd-card">
          <div className="about-icon" style={{ background: 'var(--gradient-cool)' }}>
            <Zap size={28} />
          </div>
          <div>
            <h2 className="hd-heading">The Technology</h2>
            <p>
              Our matching engine runs a multi-factor scoring model using <strong>Fuzzy Logic</strong> for
              skill-gap analysis and a <strong>Neural Network</strong> for learning from user feedback.
              Every rating you submit makes future matches smarter.
            </p>
            <div className="tech-tags">
              {['React', 'Node.js', 'Fuzzy Logic', 'Neural Networks', 'JWT Auth', 'REST API'].map(t => (
                <span key={t} className="tag tag-primary">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="about-team-section">
          <h2 className="hd-heading section-title">Meet the Team</h2>
          <div className="team-grid">
            {team.map(member => (
              <div key={member.github} className="team-card hd-card">
                <div className="team-avatar" style={{ background: member.color }}>
                  {member.initial}
                </div>
                <h3 className="hd-heading">{member.name}</h3>
                <span className="team-role">{member.role}</span>
                <p>{member.desc}</p>
                <div className="team-links">
                  <a
                    href={`https://github.com/${member.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Github size={14} /> {member.github}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="static-cta hd-card">
          <Globe size={40} style={{ color: 'var(--primary-light)', marginBottom: '1rem' }} />
          <h2 className="hd-heading">Built at Desh Bhagat University</h2>
          <p>Hackathon project — Team Zero-Gravity · 2026</p>
          <Link to="/register" className="btn btn-hd btn-lg">
            Join DevMatch <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
