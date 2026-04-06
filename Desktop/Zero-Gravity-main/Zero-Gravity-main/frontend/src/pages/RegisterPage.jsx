import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { UserPlus, Eye, EyeOff, X } from 'lucide-react'
import { auth as authApi } from '../services/api'
import './AuthPages.css'

const SKILLS_OPTIONS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express',
  'Python', 'Django', 'FastAPI', 'Flask', 'Java', 'Spring Boot',
  'Go', 'Rust', 'TypeScript', 'GraphQL', 'PostgreSQL', 'MongoDB',
  'Redis', 'Docker', 'Kubernetes', 'AWS', 'Firebase', 'TensorFlow',
  'PyTorch', 'Scikit-learn', 'Flutter', 'React Native', 'Figma'
]

const TECH_STACK_OPTIONS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++',
  'Swift', 'Kotlin', 'Dart', 'Ruby', 'PHP', 'Scala', 'R', 'MATLAB',
  'HTML/CSS', 'SQL', 'Bash/Shell', 'Solidity', 'Assembly'
]

const PROJECT_INTERESTS_OPTIONS = [
  'Web App', 'Mobile App', 'AI / ML', 'Open Source',
  'DevTools', 'FinTech', 'HealthTech', 'EdTech', 'GameDev',
  'Blockchain / Web3', 'IoT', 'AR / VR', 'Cybersecurity',
  'Social Impact', 'ClimaTech', 'SaaS', 'API / Backend'
]

const ROLE_OPTIONS = [
  'Frontend', 'Backend', 'Full Stack', 'ML / AI', 'DevOps', 'Design', 'Mobile', 'Data Science', 'Security'
]

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: '🌱 Beginner (0–1 yr)' },
  { value: 'intermediate', label: '⚡ Intermediate (1–3 yrs)' },
  { value: 'advanced', label: '🚀 Advanced (3+ yrs)' },
]

// SVG Google icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

const GOOGLE_ACCOUNTS = [
  { name: 'Alex Johnson', email: 'alex.johnson@gmail.com', avatar: 'AJ' },
  { name: 'Priya Sharma', email: 'priya.dev@gmail.com', avatar: 'PS' },
  { name: 'Marcus Chen', email: 'marcus.chen@gmail.com', avatar: 'MC' },
]

export default function RegisterPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showGooglePicker, setShowGooglePicker] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    country: '', timezone: '',
    bio: '',
    skills: [],
    techStack: [],
    projectInterests: [],
    role: '',
    experienceLevel: 'beginner'
  })

  const toggleItem = (field, item) => {
    const list = form[field]
    setForm({
      ...form,
      [field]: list.includes(item)
        ? list.filter(x => x !== item)
        : [...list, item]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authApi.register(form)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async (account) => {
    setGoogleLoading(true)
    setShowGooglePicker(false)
    setError('')
    try {
      const data = await authApi.googleAuth(account)
      login(data.token, data.user)
      navigate(data.isNew ? '/profile' : '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container register-container animate-fade-in-up">
        <div className="auth-header">
          <div className="auth-icon">
            <UserPlus size={24} />
          </div>
          <h1>Join DevMatch</h1>
          <p>Build your dev profile and find teammates</p>
        </div>

        {/* Google OAuth Button (on Step 1 only) */}
        {step === 1 && (
          <>
            <button
              className="btn-google"
              onClick={() => setShowGooglePicker(true)}
              disabled={googleLoading}
              id="google-signup-btn"
            >
              <GoogleIcon />
              {googleLoading ? 'Creating account...' : 'Sign up with Google'}
            </button>

            <div className="auth-divider">
              <span>or register with email</span>
            </div>
          </>
        )}

        <div className="step-indicators">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>
              {s}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {step === 1 && (
            <div className="form-step animate-fade-in">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  id="register-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  id="register-email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                    id="register-password"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. India, USA, Germany"
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  required
                  id="register-country"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Your Role</label>
                <select
                  className="form-input"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  required
                  id="register-role"
                >
                  <option value="">Select your primary role</option>
                  {ROLE_OPTIONS.map(r => (
                    <option key={r} value={r.toLowerCase().replace(' / ', '_').replace(' ', '_')}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  className="form-input"
                  value={form.experienceLevel}
                  onChange={e => setForm({ ...form, experienceLevel: e.target.value })}
                  required
                  id="register-experience"
                >
                  {EXPERIENCE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <button type="button" className="btn btn-primary btn-lg auth-submit" onClick={() => setStep(2)} id="register-next-1">
                Next — Skills & Tech Stack
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step animate-fade-in">
              <div className="form-group">
                <label className="form-label">Your Skills / Frameworks</label>
                <div className="chips-picker">
                  {SKILLS_OPTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`tag ${form.skills.includes(s) ? 'tag-primary' : ''}`}
                      onClick={() => toggleItem('skills', s)}
                    >
                      {s}
                      {form.skills.includes(s) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tech Stack / Languages</label>
                <div className="chips-picker">
                  {TECH_STACK_OPTIONS.map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`tag ${form.techStack.includes(t) ? 'tag-accent' : ''}`}
                      onClick={() => toggleItem('techStack', t)}
                    >
                      {t}
                      {form.techStack.includes(t) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(3)} id="register-next-2">
                  Next — Project Interests
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step animate-fade-in">
              <div className="form-group">
                <label className="form-label">Project Interests</label>
                <div className="chips-picker">
                  {PROJECT_INTERESTS_OPTIONS.map(i => (
                    <button
                      key={i}
                      type="button"
                      className={`tag ${form.projectInterests.includes(i) ? 'tag-success' : ''}`}
                      onClick={() => toggleItem('projectInterests', i)}
                    >
                      {i}
                      {form.projectInterests.includes(i) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio (Optional)</label>
                <textarea
                  className="form-input"
                  placeholder="What kind of projects do you want to build? What are you looking for in a teammate?"
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  id="register-bio"
                />
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="register-submit">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      {/* Google Account Picker Modal */}
      {showGooglePicker && (
        <div className="modal-overlay" onClick={() => setShowGooglePicker(false)}>
          <div className="modal-content google-picker-modal" onClick={e => e.stopPropagation()}>
            <div className="google-picker-header">
              <GoogleIcon />
              <h2>Choose an account</h2>
              <p>to continue to DevMatch</p>
            </div>
            <div className="google-picker-list">
              {GOOGLE_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  className="google-picker-item"
                  onClick={() => handleGoogleSignup(acc)}
                >
                  <div className="avatar avatar-sm" style={{ background: ['var(--gradient-primary)', 'var(--gradient-cool)', 'var(--gradient-warm)'][i] }}>
                    {acc.avatar.charAt(0)}
                  </div>
                  <div className="google-picker-info">
                    <span className="google-picker-name">{acc.name}</span>
                    <span className="google-picker-email">{acc.email}</span>
                  </div>
                </button>
              ))}
            </div>
            <button className="google-picker-other" onClick={() => setShowGooglePicker(false)}>
              Use another account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
