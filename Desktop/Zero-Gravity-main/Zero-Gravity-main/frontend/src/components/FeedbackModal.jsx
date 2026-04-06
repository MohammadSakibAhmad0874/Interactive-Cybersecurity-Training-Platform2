import { useState } from 'react'
import { X, Star } from 'lucide-react'

export default function FeedbackModal({ user, onClose, token }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: user.id, rating, comment })
      })
      setSubmitted(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rate {user.name}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="feedback-success">
            <Star size={48} fill="var(--warning)" color="var(--warning)" />
            <h3>Thank you!</h3>
            <p>Your feedback helps improve our AI matching.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`star-btn ${s <= rating ? 'active' : ''}`}
                  onClick={() => setRating(s)}
                >
                  <Star size={32} fill={s <= rating ? 'var(--warning)' : 'none'} />
                </button>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea
                className="form-input"
                placeholder="Share your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={!rating || submitting} style={{ width: '100%' }}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
