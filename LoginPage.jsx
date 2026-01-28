import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await login(email, password)
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
              <h1 className="brand-title">MePro</h1>
              <div className="muted">Productivity & Wellness Platform</div>
            </div>
          </div>

          <h2 className="h2" style={{ marginBottom: 6 }}>
            Sign in
          </h2>
          <div className="muted" style={{ marginBottom: 14 }}>
            Stay consistent. Track progress. Feel better.
          </div>

          <form onSubmit={onSubmit} className="form">
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
                placeholder="••••••••"
                required
              />
            </label>

            {error ? <div className="error">{error}</div> : null}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="muted" style={{ marginTop: 14 }}>
            New here? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
