import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../src/context/AuthContext'
import { ThemeProvider } from '../../src/context/ThemeContext'
import ProtectedRoute from '../../src/components/ProtectedRoute'
import MentorDashboard from '../../src/pages/MentorDashboard'
import Session from '../../src/pages/Session'
import EditProfile from '../../src/pages/EditProfile'
import MentorAuth from './pages/MentorAuth'

export default function App() {
    const { loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="mentor-portal-shell mentor-portal-loading">
                <div className="spinner" />
            </div>
        )
    }

    return (
        <ThemeProvider>
            <div className={`mentor-portal-shell ${location.pathname === '/auth' ? 'mentor-auth-route' : ''}`}>
                <Routes>
                    <Route path="/" element={<MentorHomeGate />} />
                    <Route path="/auth" element={<MentorAuth />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute mentorOnly mentorRedirectTo="/auth" requireOnboarding={false}>
                                <MentorDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/session/:sessionId"
                        element={
                            <ProtectedRoute mentorOnly mentorRedirectTo="/auth" requireOnboarding={false}>
                                <Session forceMentor mentorHomePath="/dashboard" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/edit-profile"
                        element={
                            <ProtectedRoute mentorOnly mentorRedirectTo="/auth" requireOnboarding={false}>
                                <EditProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </ThemeProvider>
    )
}

function MentorHomeGate() {
    const { user, isMentor } = useAuth()

    if (!user) return <Navigate to="/auth" replace />
    if (isMentor) return <Navigate to="/dashboard" replace />

    return <Navigate to="/auth" replace />
}
