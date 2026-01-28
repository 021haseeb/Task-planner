import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useContext(AuthContext)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container auth-shell">
        <div className="auth-card card card-hover">
          <div className="brand">
            <div className="brand-mark" aria-hidden>
              MP
            </div>
            <div>
              <h1 className="brand-title">Create account</h1>
              <div className="muted">Start building momentum today.</div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="form">
            <label className="field">
              <span className="label">Name</span>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>

            <label className="field">
              <span className="label">Email</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="field">
              <span className="label">Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
              />
            </label>

            {error ? <div className="error">{error}</div> : null}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <div className="muted" style={{ marginTop: 14 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
