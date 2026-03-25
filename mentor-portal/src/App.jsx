import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import MentorDashboard from './pages/MentorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Mentors from './pages/Mentors'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import { useState } from 'react'

function App() {
  const { loading, signOut, user, isMentor, isSuperAdmin } = useAuth()
  const [activeView, setActiveView] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        background: '#fdf6f0',
        fontFamily: 'sans-serif',
        color: '#7c6d8a'
      }}>
        <div style={{ fontSize: '2rem' }}>🌸</div>
        <p>Loading Bloom Admin...</p>
      </div>
      )
  }

  const authenticatedContent = (
    <DashboardLayout
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      activeView={activeView}
      setActiveView={setActiveView}
      onProfileClick={() => setActiveView('settings')}
    >
      <Routes>
        <Route path="/" element={<ProtectedRoute>{isSuperAdmin ? <AdminDashboard /> : <MentorDashboard activeView={activeView} setActiveView={setActiveView} />}</ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute>{isSuperAdmin ? <AdminDashboard /> : <MentorDashboard activeView={activeView} setActiveView={setActiveView} />}</ProtectedRoute>} />
        <Route path="/mentors" element={<ProtectedRoute><Mentors /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  )

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth" element={<Login />} />
      <Route path="*" element={user ? authenticatedContent : <Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default App
