import { Link } from 'react-router-dom'
import {
  Code2, Users, Brain, MessageCircle, Star, ArrowRight,
  Sparkles, Layers, CalendarCheck, Github, Linkedin, Mail,
  CheckCircle2, Zap, Shield
} from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'
import './LandingPage.css'

export default function LandingPage() {
  const revealRef = useScrollReveal({ threshold: 0.08, staggerDelay: 100 })

  const features = [
    {
      icon: Brain,
      bg: 'rgba(108,99,255,0.12)',
      color: '#9d97ff',
      title: 'AI-Powered Matching',
      desc: 'Neural networks & fuzzy logic score compatibility across skills, tech stack, and developer role to find your ideal teammate.',
      highlights: ['Skill-based scoring', 'Tech stack alignment', 'Role complementarity'],
    },
    {
      icon: Layers,
      bg: 'rgba(79,70,229,0.12)',
      color: '#818cf8',
      title: 'Tech Stack Alignment',
      desc: 'Find developers who share your language and framework ecosystem — or complement yours. Build faster, together.',
      highlights: ['Language matching', '30+ frameworks', 'Smart suggestions'],
    },
    {
      icon: Users,
      bg: 'rgba(255,77,141,0.10)',
      color: '#ff7aad',
      title: 'Role-Based Matching',
      desc: 'Frontend needs a backend? ML engineer looking for DevOps? DevMatch finds the exact role your team is missing.',
      highlights: ['9 developer roles', 'Team gap analysis', 'Experience levels'],
    },
    {
      icon: MessageCircle,
      bg: 'rgba(108,99,255,0.12)',
      color: '#9d97ff',
      title: 'Real-time Chat',
      desc: 'Connect instantly with your matched developers. Align on ideas, split responsibilities, and start building.',
      highlights: ['Instant messaging', 'AI assistant', 'Conversation history'],
    },
    {
      icon: CalendarCheck,
      bg: 'rgba(6,182,212,0.10)',
      color: '#67e8f9',
      title: 'Team Sync Scheduler',
      desc: 'Schedule pre-hackathon planning sessions. Set agenda, divide tasks, and arrive at the hackathon ready to build.',
      highlights: ['Session scheduling', 'Calendar view', 'Meeting notes'],
    },
    {
      icon: Star,
      bg: 'rgba(16,185,129,0.10)',
      color: '#34d399',
      title: 'Adaptive AI',
      desc: 'Rate your matches to continuously train the neural network — the platform gets smarter with every hackathon.',
      highlights: ['Feedback loop', 'Self-improving', 'Personalized'],
    },
  ]

  const stats = [
    { value: '500+', label: 'Developers Joined' },
    { value: '120+', label: 'Teams Formed' },
    { value: '30+',  label: 'Tech Stacks' },
    { value: '94%',  label: 'Match Satisfaction' },
  ]

  const howSteps = [
    { n: '01', icon: '👤', title: 'Build Your Profile',  desc: 'Add your tech stack, skills, role, and project interests. The more you share, the smarter your matches.' },
    { n: '02', icon: '🧠', title: 'Get AI Matches',      desc: 'Our fuzzy logic + neural network engine scores compatibility and surfaces your best teammates instantly.' },
    { n: '03', icon: '💬', title: 'Chat & Align',        desc: 'Message your match, schedule a sync session, split tasks, and arrive at the hackathon ready to build.' },
    { n: '04', icon: '🚀', title: 'Ship & Win',          desc: 'Start with a team that complements your skills. DevMatch teams are built to ship — and to win.' },
  ]

  const testimonials = [
    {
      quote: '"We went from strangers to a winning team in 48 hours. The AI match score was uncannily accurate."',
      name: 'Priya S.', role: 'Full Stack Developer', initial: 'P',
      color: 'var(--gradient-primary)',
    },
    {
      quote: '"Found a DevOps partner who knew exactly the tools I was using. DevMatch saved us days of searching."',
      name: 'Rahul M.', role: 'Backend Engineer', initial: 'R',
      color: 'var(--gradient-cool)',
    },
    {
      quote: '"The scheduler feature helped us plan our entire hackathon strategy before day one. Game changer."',
      name: 'Aisha K.', role: 'ML Engineer', initial: 'A',
      color: 'var(--gradient-warm)',
    },
  ]

  const creators = [
    { name: 'Aditya',      github: 'adi4sure',               role: 'Frontend & Design' },
    { name: 'Sakib Ahmad', github: 'MohammadSakibAhmad0874', role: 'Backend & AI' },
  ]

  const scrollTo = (e, id) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Featured mockup profiles
  const mockProfiles = [
    { initial: 'R', name: 'Rahul Mehta',   role: 'Backend · FastAPI', skills: ['Python', 'Docker'], score: 94 },
    { initial: 'P', name: 'Priya Shah',    role: 'Frontend · React',  skills: ['React', 'TailwindCSS'], score: 91 },
    { initial: 'A', name: 'Arjun Kumar',   role: 'ML · TensorFlow',   skills: ['PyTorch', 'CUDA'],  score: 88 },
  ]

  const techStack = [
    'React', 'FastAPI', 'Python', 'TensorFlow', 'Next.js', 'PostgreSQL',
    'Docker', 'Node.js', 'Rust', 'Go', 'Kubernetes', 'MongoDB',
    'Flutter', 'Svelte', 'GraphQL', 'Redis',
    // Duplicated for infinite scroll
    'React', 'FastAPI', 'Python', 'TensorFlow', 'Next.js', 'PostgreSQL',
    'Docker', 'Node.js', 'Rust', 'Go', 'Kubernetes', 'MongoDB',
    'Flutter', 'Svelte', 'GraphQL', 'Redis',
  ]

  return (
    <div className="landing-page" ref={revealRef}>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="hero-section" id="hero">
        <div className="hero-inner">

          {/* Left — Copy */}
          <div className="hero-content">
            <div className="hero-badge animate-fade-in-up">
              <span className="hero-badge-dot" />
              <Sparkles size={12} />
              AI-powered hackathon team formation
            </div>

            <h1 className="hero-heading animate-fade-in-up animate-delay-100">
              Find Your Team,{' '}
              <span className="gradient-text">Build Something</span>{' '}
              Incredible
            </h1>

            <p className="hero-subtext animate-fade-in-up animate-delay-200">
              DevMatch uses advanced AI — neural networks &amp; fuzzy logic — to match
              hackathon developers by skills, tech stack, and role. Spend less time
              finding teammates, more time building.
            </p>

            <div className="hero-cta-row animate-fade-in-up animate-delay-300">
              <Link to="/register" className="btn btn-primary btn-xl" id="hero-cta">
                Find My Team <ArrowRight size={20} />
              </Link>
              <a
                href="#features"
                className="btn btn-secondary btn-xl"
                id="hero-explore"
                onClick={e => scrollTo(e, 'features')}
              >
                Explore Features
              </a>
            </div>

            <div className="hero-social-proof animate-fade-in-up animate-delay-400">
              {stats.map((s, i) => (
                <div key={i} className="hero-proof-stat">
                  <span className="hero-proof-num">{s.value}</span>
                  <span className="hero-proof-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating Mockup */}
          <div className="hero-visual">
            <div className="hero-device-mockup">
              <div className="hero-mockup-topbar">
                <div className="hero-topbar-dot" />
                <div className="hero-topbar-dot" />
                <div className="hero-topbar-dot" />
                <div className="hero-topbar-bar" />
              </div>
              <div className="hero-mockup-content">
                {mockProfiles.map((p, i) => (
                  <div key={i} className="hero-profile-card">
                    <div className="avatar avatar-sm" style={{ background: ['var(--gradient-primary)', 'var(--gradient-cool)', 'var(--gradient-warm)'][i] }}>
                      {p.initial}
                    </div>
                    <div className="hero-profile-info">
                      <span className="hero-profile-name">{p.name}</span>
                      <span className="hero-profile-role">{p.role}</span>
                      <div className="hero-profile-skills">
                        {p.skills.map(s => <span key={s} className="hero-skill-chip">{s}</span>)}
                      </div>
                    </div>
                    <span className="match-score"><Sparkles size={10} /> {p.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating labels */}
            <div className="hero-floating hero-float-match">
              <Sparkles size={13} /> 94% match found!
            </div>
            <div className="hero-floating hero-float-chat">
              <MessageCircle size={13} /> Chat started &rarr;
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TECH STRIP ══════════════════════ */}
      <div className="tech-section">
        <div className="tech-logos-container">
          <div className="tech-logos-track">
            {techStack.map((t, i) => (
              <div key={i} className="tech-logo-item">
                <Code2 size={14} /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section className="features-section" id="features">
        <div className="features-header" data-scroll-reveal>
          <div className="section-eyebrow"><Zap size={12} /> Features</div>
          <h2 className="section-title">Why <span className="gradient-text">DevMatch?</span></h2>
          <p className="section-subtitle">
            AI-driven tools designed to form the strongest possible hackathon teams in minutes.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className={`feature-card glass-card ${i === 0 ? 'feature-card-lg' : ''}`} data-scroll-reveal>
              <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="tags-container" style={{ marginTop: 'var(--space-md)' }}>
                {f.highlights.map(h => (
                  <span key={h} className="tag tag-primary">
                    <CheckCircle2 size={11} /> {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section className="how-section" id="how-it-works">
        <div className="page-container">
          <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
            <div data-scroll-reveal>
              <div className="section-eyebrow"><Shield size={12} /> How It Works</div>
              <h2 className="section-title">From Profile to <span className="gradient-text">Perfect Match</span></h2>
              <p className="section-subtitle">Four simple steps to your ideal hackathon team.</p>
            </div>

            <div className="how-grid">
              {howSteps.map((step, i) => (
                <div key={i} className="how-card glass-card" data-scroll-reveal>
                  <div className="how-step-number">{step.n}</div>
                  <div className="how-icon-wrap" style={{ background: 'rgba(108,99,255,0.1)', fontSize: '1.4rem' }}>
                    {step.icon}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section className="testimonials-section">
        <div className="page-container">
          <div style={{ textAlign: 'center' }} data-scroll-reveal>
            <div className="section-eyebrow"><Star size={12} /> Testimonials</div>
            <h2 className="section-title">Loved by <span className="gradient-text">Developers</span></h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card glass-card" data-scroll-reveal>
                <div className="testimonial-quote-icon">"</div>
                <p className="testimonial-text">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="avatar" style={{ background: t.color, flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section className="cta-section" id="cta">
        <div className="cta-card" data-scroll-reveal>
          <div className="section-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
            <Sparkles size={12} /> Ready to Ship?
          </div>
          <h2 className="cta-heading">
            Build Your Dream Team <span className="gradient-text">Today</span>
          </h2>
          <p className="cta-sub">
            Join hundreds of developers using DevMatch to form winning hackathon teams.
            Your perfect teammate is already here.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-xl" id="cta-register">
              Get Started Free <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-xl">Sign In</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="landing-footer" id="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Code2 size={18} />
            DevMatch
          </div>

          <div className="footer-links">
            <a href="#features" onClick={e => scrollTo(e, 'features')}>Features</a>
            <a href="#how-it-works" onClick={e => scrollTo(e, 'how-it-works')}>How It Works</a>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            {creators.map(c => (
              <a key={c.github} href={`https://github.com/${c.github}`}
                target="_blank" rel="noopener noreferrer"
                className="nav-icon-btn" title={c.name}>
                <Github size={17} />
              </a>
            ))}
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              className="nav-icon-btn" title="LinkedIn">
              <Linkedin size={17} />
            </a>
            <a href="mailto:23322147012@deshbhagatuniversity.in"
              className="nav-icon-btn" title="Email">
              <Mail size={17} />
            </a>
          </div>
        </div>

        <p className="footer-copy">
          © 2026 DevMatch · AI-powered hackathon team formation · Built by Team Zero-Gravity
          &nbsp;·&nbsp; Desh Bhagat University
        </p>
      </footer>
    </div>
  )
}
