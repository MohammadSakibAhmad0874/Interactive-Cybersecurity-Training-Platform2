import { useState } from 'react'
import { Mail, Github, Linkedin, Send, MessageCircle } from 'lucide-react'
import './StaticPages.css'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    // Opens default mail client as a fallback (no backend endpoint needed)
    const mailto = `mailto:23322147012@deshbhagatuniversity.in?subject=${encodeURIComponent(form.subject || 'DevMatch Contact')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`
    window.location.href = mailto
    setSent(true)
  }

  const contacts = [
    { icon: Mail, label: 'Email', value: '23322147012@deshbhagatuniversity.in', href: 'mailto:23322147012@deshbhagatuniversity.in' },
    { icon: Github, label: 'GitHub (Aditya)', value: 'github.com/adi4sure', href: 'https://github.com/adi4sure' },
    { icon: Github, label: 'GitHub (Sakib)', value: 'github.com/MohammadSakibAhmad0874', href: 'https://github.com/MohammadSakibAhmad0874' },
    { icon: Linkedin, label: 'LinkedIn', value: 'Connect with us', href: 'https://linkedin.com' },
  ]

  return (
    <div className="static-page">
      <div className="static-hero">
        <div className="static-badge">
          <MessageCircle size={14} /> Get in Touch
        </div>
        <h1 className="hd-heading">Contact Us</h1>
        <p className="static-lead">
          Have a question, bug report, or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      <div className="static-content page-container">
        <div className="contact-grid">

          {/* Form */}
          <div className="contact-form-card hd-card">
            <h2 className="hd-heading">Send a Message</h2>
            {sent ? (
              <div className="sent-success">
                <Send size={40} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                <h3 className="hd-heading">Opening your mail client…</h3>
                <p>If nothing opened, email us directly at<br/>
                  <a href="mailto:23322147012@deshbhagatuniversity.in" style={{ color: 'var(--primary-light)' }}>
                    23322147012@deshbhagatuniversity.in
                  </a>
                </p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <div className="form-group">
                    <label className="form-label hd-subheading">Your Name</label>
                    <input
                      name="name"
                      type="text"
                      className="form-input-hd"
                      placeholder="Ada Lovelace"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label hd-subheading">Email</label>
                    <input
                      name="email"
                      type="email"
                      className="form-input-hd"
                      placeholder="ada@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label hd-subheading">Subject</label>
                  <input
                    name="subject"
                    type="text"
                    className="form-input-hd"
                    placeholder="Bug report / Feature request / Hello!"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label hd-subheading">Message</label>
                  <textarea
                    name="message"
                    className="form-input-hd"
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-hd btn-lg" style={{ width: '100%' }}>
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="contact-info">
            <h2 className="hd-heading">Find Us Online</h2>
            <div className="contact-links">
              {contacts.map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="contact-link glass-card">
                  <div className="contact-link-icon">
                    <c.icon size={20} />
                  </div>
                  <div>
                    <span className="contact-link-label hd-subheading">{c.label}</span>
                    <span className="contact-link-value">{c.value}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="contact-project hd-card">
              <h3 className="hd-heading">About the Project</h3>
              <p>DevMatch is a hackathon project by Team Zero-Gravity, Desh Bhagat University. All feedback — bugs, compliments, feature ideas — is welcome!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
