import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'

export default function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
