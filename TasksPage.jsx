import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api.js'

const PRIORITIES = ['Low', 'Medium', 'High']

function formatDateInputValue(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [justAddedId, setJustAddedId] = useState(null)
  const [removing, setRemoving] = useState({})
  const clearNewTimer = useRef(null)

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1

      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      if (ad !== bd) return ad - bd

      const ac = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bc = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bc - ac
    })
  }, [tasks])

  const refresh = async () => {
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

  useEffect(() => {
    refresh()
    return () => {
      if (clearNewTimer.current) {
        window.clearTimeout(clearNewTimer.current)
      }
    }
  }, [])

  const createTask = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      }

      const { data } = await api.post('/tasks', payload)
      setTasks((prev) => [data, ...prev])

      setTitle('')
      setDescription('')
      setPriority('Medium')
      setDueDate('')

      setJustAddedId(data?._id || null)
      if (clearNewTimer.current) window.clearTimeout(clearNewTimer.current)
      clearNewTimer.current = window.setTimeout(() => setJustAddedId(null), 1100)
    } catch (err) {
      setError(String(err?.response?.data?.message || err?.message || err))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCompleted = async (task) => {
    setError(null)
    try {
      const { data } = await api.put(`/tasks/${task._id}`, {
        isCompleted: !task.isCompleted,
      })
      setTasks((prev) => prev.map((t) => (t._id === task._id ? data : t)))
    } catch (err) {
      setError(String(err?.response?.data?.message || err?.message || err))
    }
  }

  const deleteTask = async (task) => {
    const ok = window.confirm(`Delete task: "${task.title}"?`)
    if (!ok) return

    // Animate out first, then actually delete.
    setRemoving((prev) => ({ ...prev, [task._id]: true }))

    window.setTimeout(async () => {
      try {
        await api.delete(`/tasks/${task._id}`)
        setTasks((prev) => prev.filter((t) => t._id !== task._id))
      } catch (err) {
        setRemoving((prev) => {
          const next = { ...prev }
          delete next[task._id]
          return next
        })
        setError(String(err?.response?.data?.message || err?.message || err))
      }
    }, 180)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="header-row">
          <div>
            <div className="pill">
              <span className="kbd">Tasks</span>
              <span className="muted">Plan → Execute → Review</span>
            </div>
            <h1 className="h1" style={{ marginTop: 10 }}>
              Tasks
            </h1>
            <div className="muted" style={{ marginTop: 6 }}>
              Smooth animations + clean structure — feels like a product.
            </div>
          </div>

          <Link className="btn btn-ghost" to="/dashboard">
            Back
          </Link>
        </div>

        <div className="card card-hover" style={{ padding: 16, marginBottom: 14 }}>
          <h2 className="h2" style={{ marginBottom: 10 }}>
            Create a task
          </h2>

          <form onSubmit={createTask} className="form">
            <label className="field">
              <span className="label">Title</span>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Prepare interview notes"
                required
              />
            </label>

            <label className="field">
              <span className="label">Description (optional)</span>
              <textarea
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Make it small, clear, and actionable"
                rows={3}
              />
            </label>

            <div className="split">
              <label className="field">
                <span className="label">Priority</span>
                <select
                  className="select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="label">Due date (optional)</span>
                <input
                  className="input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </label>
            </div>

            {error ? <div className="error">{error}</div> : null}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create task'}
              </button>
              <button type="button" className="btn" onClick={refresh} disabled={loading}>
                Refresh
              </button>
            </div>
          </form>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h2 className="h2" style={{ marginBottom: 10 }}>
            Your tasks
          </h2>

          {loading ? (
            <div className="task-list" aria-label="Loading tasks">
              <div className="task-skeleton skeleton" />
              <div className="task-skeleton skeleton" />
              <div className="task-skeleton skeleton" />
            </div>
          ) : null}

          {!loading && sortedTasks.length === 0 ? (
            <div className="muted">
              No tasks yet. Add one above — it will animate in.
            </div>
          ) : null}

          {!loading ? (
            <div className="task-list">
              {sortedTasks.map((t) => {
                const isRemoving = Boolean(removing[t._id])
                const isNew = justAddedId === t._id
                const titleClass = `task-title${t.isCompleted ? ' is-done' : ''}`
                const itemClass = `card card-hover task-item${isRemoving ? ' is-removing' : ''}${isNew ? ' is-new' : ''}`

                return (
                  <div key={t._id} className={itemClass}>
                    <input
                      type="checkbox"
                      checked={Boolean(t.isCompleted)}
                      onChange={() => toggleCompleted(t)}
                      aria-label={`Mark ${t.title} complete`}
                    />

                    <div>
                      <div className={titleClass}>{t.title}</div>
                      {t.description ? (
                        <div className="muted" style={{ marginTop: 6 }}>
                          {t.description}
                        </div>
                      ) : null}

                      <div className="task-meta faint">
                        <span>Priority: {t.priority || 'Medium'}</span>
                        {t.dueDate ? <span>Due: {formatDateInputValue(t.dueDate)}</span> : null}
                      </div>
                    </div>

                    <button
                      className="btn"
                      onClick={() => deleteTask(t)}
                      disabled={isRemoving}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Delete
                    </button>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
