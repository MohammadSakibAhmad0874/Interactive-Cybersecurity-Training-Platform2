import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, AlertTriangle, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

const attacks = [
  {
    id: 'sql-injection', title: 'SQL Injection', severity: 'Critical', cvss: '9.8',
    icon: '🗄️', color: 'var(--clr-red)',
    explanation: 'SQL injection occurs when user-supplied input is embedded directly into database queries without sanitization, allowing attackers to manipulate query logic.',
    symptoms: ['Unusual database errors in app responses', 'Missing or tampered records', 'Authentication bypass — logging in without credentials', 'Slow queries or timeouts from injected sleep commands'],
    prevention: [
      'Use parameterized queries and prepared statements',
      'Implement input validation and type checking',
      'Apply least-privilege database permissions',
      'Deploy a Web Application Firewall (WAF)',
      'Use ORM frameworks with built-in parameterization',
      'Enable database activity monitoring and alerting',
    ],
    secureCoding: `// ❌ VULNERABLE — never do this
const query = "SELECT * FROM users WHERE name = '" + username + "'";

// ✅ SECURE — parameterized query
const query = "SELECT * FROM users WHERE name = ?";
db.execute(query, [username]);

// ✅ SECURE — using an ORM
const user = await User.findOne({ where: { name: username } });`,
    example: 'In 2009, a SQL injection attack against Heartland Payment Systems exposed 130 million credit card numbers, making it one of the largest data breaches in history.',
    owasp: 'https://owasp.org/www-community/attacks/SQL_Injection',
  },
  {
    id: 'xss', title: 'Cross-Site Scripting (XSS)', severity: 'High', cvss: '8.8',
    icon: '💉', color: 'var(--clr-yellow)',
    explanation: 'XSS attacks inject malicious client-side scripts into web pages viewed by other users. The browser executes these scripts in the context of the vulnerable site.',
    symptoms: ['Unexpected JavaScript alerts or popups', 'Cookie or session theft', 'Phishing overlays on legitimate pages', 'Unauthorized actions performed on behalf of users'],
    prevention: [
      'Encode all user-supplied output (HTML entity encoding)',
      'Implement Content Security Policy (CSP) headers',
      'Use modern frameworks with auto-escaping (React, Vue, Angular)',
      'Set HTTPOnly and Secure flags on cookies',
      'Validate and sanitize all user input server-side',
      'Use Subresource Integrity (SRI) for external scripts',
    ],
    secureCoding: `// ❌ VULNERABLE — innerHTML executes scripts
element.innerHTML = userInput;

// ✅ SECURE — textContent is always safe
element.textContent = userInput;

// ✅ SECURE — React auto-escapes by default
return <div>{userInput}</div>;

// ✅ SECURE CSP header
Content-Security-Policy: default-src 'self'; script-src 'self'`,
    example: 'The British Airways 2018 breach used a stored XSS attack to skim payment data from 380,000 booking forms, costing the company £20 million in fines.',
    owasp: 'https://owasp.org/www-community/attacks/xss/',
  },
  {
    id: 'brute-force', title: 'Brute Force Attacks', severity: 'Medium', cvss: '7.5',
    icon: '🔓', color: 'var(--clr-cyan)',
    explanation: 'Brute force attacks systematically try all possible password combinations until the correct one is found. Modern variants include dictionary attacks and credential stuffing.',
    symptoms: ['High volume of failed login attempts', 'Account lockouts across multiple users', 'Logins from unusual geographic locations', 'Automated login patterns without human timing'],
    prevention: [
      'Implement account lockout after 5–10 failed attempts',
      'Add exponential back-off delays between attempts',
      'Require CAPTCHA after suspicious activity',
      'Enable Multi-Factor Authentication (MFA)',
      'Monitor and alert on unusual login patterns with SIEM',
      'Enforce strong password policies (12+ chars, complexity)',
    ],
    secureCoding: `// ✅ Express.js rate limiting
const rateLimit = require('express-rate-limit');
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 5,                    // 5 attempts per window
  message: 'Too many attempts, try again later'
}));

// ✅ bcrypt with high cost factor
const hashed = await bcrypt.hash(password, 12);`,
    example: 'The 2012 LinkedIn breach exposed 117 million password hashes stored with weak MD5, later brute-forced and published. Password reuse enabled credential stuffing on other sites.',
    owasp: 'https://owasp.org/www-community/attacks/Brute_force_attack',
  },
]

const severityColor = { Critical: 'var(--clr-red)', High: 'var(--clr-orange)', Medium: 'var(--clr-yellow)' }

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function Prevention() {
  return (
    <>
      <Helmet>
        <title>Prevention Guide – Cyber Attack Simulation Lab</title>
        <meta name="description" content="Comprehensive cybersecurity prevention guide covering SQL Injection, XSS, Brute Force with secure coding examples and industry case studies." />
      </Helmet>

      <div className="container section">
        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="mb-xl">
          <motion.div variants={fadeUp} className="flex items-center gap-sm mb-md">
            <span className="badge badge-green"><Shield size={10} /> Prevention Guide</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-hud" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', marginBottom: '0.5rem' }}>
            Security <span className="text-gradient-green">Prevention Guide</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-muted">
            Industry-standard defenses, secure coding patterns, and real-world case studies for every attack vector.
          </motion.p>
        </motion.div>

        {/* Attacks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {attacks.map((attack, i) => (
            <motion.div key={attack.id} id={`prevention-${attack.id}`}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}>
              <div className="glass-card p-xl" style={{ borderColor: `${attack.color}20` }}>
                {/* Title */}
                <div className="flex items-center justify-between mb-xl" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="flex items-center gap-md">
                    <span style={{ fontSize: '2rem' }}>{attack.icon}</span>
                    <div>
                      <h2 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: attack.color }}>{attack.title}</h2>
                      <div className="flex items-center gap-sm mt-sm">
                        <span className="badge" style={{ background: `${severityColor[attack.severity]}18`, color: severityColor[attack.severity], borderColor: `${severityColor[attack.severity]}25`, fontSize: '0.65rem' }}>
                          {attack.severity}
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>CVSS {attack.cvss}</span>
                        <a href={attack.owasp} target="_blank" rel="noopener noreferrer"
                          className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>
                          OWASP <ExternalLink size={8} />
                        </a>
                      </div>
                    </div>
                  </div>
                  <Link to={`/simulator/${attack.id}`} className="btn btn-secondary btn-sm">
                    Try Simulation <ChevronRight size={13} />
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {/* Explanation */}
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-text-2)', marginBottom: '0.75rem' }}>
                      How It Works
                    </h3>
                    <p className="text-sm text-muted" style={{ lineHeight: 1.7 }}>{attack.explanation}</p>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-red)', marginBottom: '0.75rem' }}>
                      <AlertTriangle size={12} style={{ display: 'inline', marginRight: 4 }} /> Warning Signs
                    </h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {attack.symptoms.map(s => (
                        <li key={s} className="flex items-center gap-sm">
                          <span style={{ color: 'var(--clr-red)', fontSize: '0.7rem' }}>●</span>
                          <span className="text-sm text-muted">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention */}
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-green)', marginBottom: '0.75rem' }}>
                      <Shield size={12} style={{ display: 'inline', marginRight: 4 }} /> Prevention
                    </h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {attack.prevention.map(p => (
                        <li key={p} className="flex items-center gap-sm">
                          <CheckCircle size={11} color="var(--clr-green)" style={{ flexShrink: 0 }} />
                          <span className="text-sm text-muted">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Secure coding */}
                <div className="mt-xl">
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-text-2)', marginBottom: '0.75rem' }}>
                    Secure Coding Pattern
                  </h3>
                  <div className="code-block">
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--clr-text-1)', fontSize: '0.8rem', lineHeight: 1.7 }}>
                      {attack.secureCoding}
                    </pre>
                  </div>
                </div>

                {/* Real example */}
                <div className="mt-lg glass-card p-md" style={{ background: 'rgba(0,0,0,0.3)', borderColor: `${attack.color}18` }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: attack.color, marginBottom: '0.4rem' }}>
                    📰 Real-World Case Study
                  </p>
                  <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>{attack.example}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security checklist */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card p-xl mt-xl">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            <span className="text-gradient-green">Security Checklist</span> for Every Web Project
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
            {[
              'Use HTTPS everywhere with HSTS',
              'Parameterize all database queries',
              'Encode all user output (XSS prevention)',
              'Implement CSP security headers',
              'Add rate limiting to auth endpoints',
              'Enable MFA for all user accounts',
              'Hash passwords with bcrypt / Argon2',
              'Apply principle of least privilege',
              'Log and monitor all auth events',
              'Keep all dependencies updated',
              'Run regular penetration tests',
              'Implement proper CORS policies',
            ].map(item => (
              <div key={item} className="flex items-center gap-sm">
                <CheckCircle size={13} color="var(--clr-green)" style={{ flexShrink: 0 }} />
                <span className="text-sm text-muted">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}
