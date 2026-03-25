import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import MentorDashboard from './pages/MentorDashboard'
import AdminDashboard from './pages/AdminDashboardRedesign'
import Mentors from './pages/MentorsRedesign'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import { useState } from 'react'

function App() {
  const { loading, profileLoading, profile, user, isSuperAdmin } = useAuth()
  const [activeView, setActiveView] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false)
  const rolePending = Boolean(
    user &&
    profileLoading &&
    !profile &&
    !user?.user_metadata?.role &&
    !user?.user_metadata?.is_super_admin
  )

  if (loading || rolePending) {
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
      isSuperAdmin={isSuperAdmin}
      isProfileSheetOpen={isProfileSheetOpen}
      setIsProfileSheetOpen={setIsProfileSheetOpen}
      onOpenProfileSheet={() => setIsProfileSheetOpen(true)}
      onProfileClick={() => setActiveView('settings')}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute>{isSuperAdmin ? <AdminDashboard /> : <MentorDashboard activeView={activeView} setActiveView={setActiveView} />}</ProtectedRoute>} />
        <Route path="/mentors" element={<ProtectedRoute><Mentors /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )

  return (
    <Routes>
      <Route path="/auth" element={<Login />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="*" element={user ? authenticatedContent : <Navigate to="/auth" replace />} />
    </Routes>
  )
}

export default App
