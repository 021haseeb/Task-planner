import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import api from '../utils/api.js'

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function useCountUp(value, { durationMs = 650 } = {}) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)
  const lastValueRef = useRef(0)

  useEffect(() => {
    const from = lastValueRef.current
    const to = Number.isFinite(value) ? value : 0
    lastValueRef.current = to

    const start = performance.now()

    const tick = (now) => {
      const t = clamp((now - start) / durationMs, 0, 1)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const next = Math.round(from + (to - from) * eased)
      setDisplay(next)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, durationMs])

  return display
}

function ProgressRing({ percent }) {
  const p = clamp(Number.isFinite(percent) ? percent : 0, 0, 100)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - p / 100)

  return (
    <div className="ring" style={{ position: 'relative' }} aria-label={`Completion ${p}%`}>
      <svg viewBox="0 0 44 44" aria-hidden>
        <circle
          className="ring-track"
          cx="22"
          cy="22"
          r={radius}
          fill="transparent"
          strokeWidth="4"
        />
        <circle
          className="ring-progress"
          cx="22"
          cy="22"
          r={radius}
          fill="transparent"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-text">{p}%</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext)

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/tasks')
        setTasks(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(String(err?.response?.data?.message || err?.message || err))
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.isCompleted).length
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

    const today = new Date()
    const todayStr = today.toDateString()
    const dueToday = tasks.filter((t) => {
      if (!t.dueDate) return false
      return new Date(t.dueDate).toDateString() === todayStr
    }).length

    const highPriority = tasks.filter((t) => (t.priority || 'Medium') === 'High').length

    return { total, completed, completionRate, dueToday, highPriority }
  }, [tasks])

  const totalUp = useCountUp(stats.total)
  const completedUp = useCountUp(stats.completed)
  const dueTodayUp = useCountUp(stats.dueToday)
  const highPriorityUp = useCountUp(stats.highPriority)

  return (
    <div className="page">
      <div className="container">
        <div className="header-row">
          <div>
            <div className="pill">
              <span className="kbd">Task Planner</span>
              <span className="muted">Productivity & Wellness</span>
            </div>
            <h1 className="h1" style={{ marginTop: 10 }}>
              Dashboard
            </h1>
            <div className="muted" style={{ marginTop: 6 }}>
              Welcome, <strong>{user?.name}</strong>. Here’s your momentum.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link className="btn btn-ghost" to="/tasks">
              Open Tasks
            </Link>
            <button className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </div>
        </div>

        {error ? (
          <div className="card" style={{ padding: 14, marginBottom: 12 }}>
            <div className="error">{error}</div>
          </div>
        ) : null}

        <div className="stats-grid" style={{ marginBottom: 14 }}>
          {loading ? (
            <>
              <div className="stat-skeleton skeleton" />
              <div className="stat-skeleton skeleton" />
              <div className="stat-skeleton skeleton" />
              <div className="stat-skeleton skeleton" />
            </>
          ) : (
            <>
              <div className="card card-hover stat-card">
                <div className="stat-top">
                  <div className="stat-label">Total tasks</div>
                  <div className="faint">📌</div>
                </div>
                <div className="stat-value">{totalUp}</div>
                <div className="stat-sub">Everything you’ve planned</div>
              </div>

              <div className="card card-hover stat-card">
                <div className="stat-top">
                  <div className="stat-label">Completed</div>
                  <div className="faint">✅</div>
                </div>
                <div className="stat-value">{completedUp}</div>
                <div className="stat-sub">Done tasks</div>
              </div>

              <div className="card card-hover stat-card">
                <div className="stat-top">
                  <div className="stat-label">Due today</div>
                  <div className="faint">🗓️</div>
                </div>
                <div className="stat-value">{dueTodayUp}</div>
                <div className="stat-sub">Focus targets</div>
              </div>

              <div className="card card-hover stat-card">
                <div className="stat-top">
                  <div className="stat-label">Completion</div>
                  <ProgressRing percent={stats.completionRate} />
                </div>
                <div className="stat-value">{highPriorityUp}</div>
                <div className="stat-sub">High-priority tasks</div>
              </div>
            </>
          )}
        </div>

        <div className="card card-hover" style={{ padding: 16 }}>
          <h2 className="h2" style={{ marginBottom: 10 }}>
            Quick actions
          </h2>
          <div className="muted" style={{ marginBottom: 14 }}>
            Small consistent wins beat huge occasional effort.
          </div>

          <div className="split">
            <Link className="card card-hover" to="/tasks" style={{ padding: 16 }}>
              <h3 style={{ margin: 0, marginBottom: 6 }}>Tasks</h3>
              <div className="muted">Create, prioritize, and finish tasks.</div>
            </Link>

            <div className="card" style={{ padding: 16, opacity: 0.88 }}>
              <h3 style={{ margin: 0, marginBottom: 6 }}>Habits</h3>
              <div className="muted">Coming next: streaks + goals.</div>
            </div>

            <div className="card" style={{ padding: 16, opacity: 0.88 }}>
              <h3 style={{ margin: 0, marginBottom: 6 }}>Mood</h3>
              <div className="muted">Coming next: mood + stress timeline.</div>
            </div>

            <div className="card" style={{ padding: 16, opacity: 0.88 }}>
              <h3 style={{ margin: 0, marginBottom: 6 }}>Analytics</h3>
              <div className="muted">Coming next: weekly insights + coach tips.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
