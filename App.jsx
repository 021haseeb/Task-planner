import { Navigate, Route, Routes } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext.jsx'

import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}> 
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
