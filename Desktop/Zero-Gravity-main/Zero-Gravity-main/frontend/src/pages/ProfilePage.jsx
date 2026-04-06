import { useContext, useState } from 'react'
import { AuthContext } from '../App'
import { User, Save, MapPin, Code2, Layers, X } from 'lucide-react'
import { users as usersApi } from '../services/api'
import './ProfilePage.css'

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
  { value: 'beginner',     label: '🌱 Beginner (0–1 yr)' },
  { value: 'intermediate', label: '⚡ Intermediate (1–3 yrs)' },
  { value: 'advanced',     label: '🚀 Advanced (3+ yrs)' },
]

export default function ProfilePage() {
  const { user, token, setUser } = useContext(AuthContext)
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState({ ...user })
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  const toggleItem = (field, item) => {
    const list = form[field] || []
    setForm({
      ...form,
      [field]: list.includes(item) ? list.filter(x => x !== item) : [...list, item]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = await usersApi.updateMe(form)
      setUser(data.user)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container profile-page">
      <div className="section-header">
        <h1>Your Dev Profile</h1>
        <p>Manage your DevMatch developer profile</p>
      </div>

      <div className="profile-layout animate-fade-in-up">
        <div className="profile-card glass-card">
          <div className="profile-banner">
            <div className="avatar avatar-xl">{user?.name?.charAt(0)}</div>
          </div>
          <div className="profile-card-body">
            {editing ? (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input type="text" className="form-input" value={form.country || ''} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="">Select your primary role</option>
                    {ROLE_OPTIONS.map(r => (
                      <option key={r} value={r.toLowerCase().replace(' / ', '_').replace(' ', '_')}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select className="form-input" value={form.experienceLevel || 'beginner'} onChange={e => setForm({ ...form, experienceLevel: e.target.value })}>
                    {EXPERIENCE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} />
                </div>

                <div className="form-group">
                  <label className="form-label"><Code2 size={14} /> Skills / Frameworks</label>
                  <div className="chips-picker">
                    {SKILLS_OPTIONS.map(s => (
                      <button key={s} type="button" className={`tag ${(form.skills || []).includes(s) ? 'tag-primary' : ''}`} onClick={() => toggleItem('skills', s)}>
                        {s} {(form.skills || []).includes(s) && <X size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><Layers size={14} /> Tech Stack / Languages</label>
                  <div className="chips-picker">
                    {TECH_STACK_OPTIONS.map(t => (
                      <button key={t} type="button" className={`tag ${(form.techStack || []).includes(t) ? 'tag-accent' : ''}`} onClick={() => toggleItem('techStack', t)}>
                        {t} {(form.techStack || []).includes(t) && <X size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Interests</label>
                  <div className="chips-picker">
                    {PROJECT_INTERESTS_OPTIONS.map(i => (
                      <button key={i} type="button" className={`tag ${(form.projectInterests || []).includes(i) ? 'tag-success' : ''}`} onClick={() => toggleItem('projectInterests', i)}>
                        {i} {(form.projectInterests || []).includes(i) && <X size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="profile-edit-actions">
                  <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ ...user }) }}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-view">
                <h2>{user?.name}</h2>
                <p className="profile-location"><MapPin size={16} /> {user?.country || 'Earth'}</p>
                {user?.role && (
                  <span className="tag tag-primary" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                    {user.role}
                  </span>
                )}
                {user?.experienceLevel && (
                  <span className="tag tag-accent" style={{ marginLeft: '0.5rem', marginBottom: '0.5rem', display: 'inline-block' }}>
                    {user.experienceLevel}
                  </span>
                )}
                {user?.bio && <p className="profile-bio-text">{user.bio}</p>}

                <div className="profile-section-block">
                  <h4><Code2 size={14} /> Skills</h4>
                  <div className="tags-container">
                    {(user?.skills || []).map(s => <span key={s} className="tag tag-primary">{s}</span>)}
                    {(!user?.skills || user.skills.length === 0) && <span className="text-muted">No skills added yet</span>}
                  </div>
                </div>

                <div className="profile-section-block">
                  <h4><Layers size={14} /> Tech Stack</h4>
                  <div className="tags-container">
                    {(user?.techStack || []).map(t => <span key={t} className="tag tag-accent">{t}</span>)}
                    {(!user?.techStack || user.techStack.length === 0) && <span className="text-muted">No tech stack added yet</span>}
                  </div>
                </div>

                <div className="profile-section-block">
                  <h4>Project Interests</h4>
                  <div className="tags-container">
                    {(user?.projectInterests || []).map(i => <span key={i} className="tag tag-success">{i}</span>)}
                    {(!user?.projectInterests || user.projectInterests.length === 0) && <span className="text-muted">No interests added yet</span>}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => setEditing(true)} style={{ marginTop: '1.5rem' }} id="edit-profile-btn">
                  <User size={18} />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {saved && <div className="toast toast-success">Profile updated successfully! ✓</div>}
    </div>
  )
}
