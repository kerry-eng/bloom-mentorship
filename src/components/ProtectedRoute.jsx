import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, mentorOnly = false }) {
    const { user, profile, isMentor, loading } = useAuth()

    if (loading) return null

    if (!user) return <Navigate to="/auth" replace />

    if (mentorOnly && !isMentor) return <Navigate to="/dashboard" replace />

    // Redirect to personalization if onboarding not completed
    // Note: Use window.location.pathname check if needed, but usually routes are distinct
    const isOnboardingPage = window.location.pathname === '/personalization'
    if (user && profile && !profile.onboarding_completed && !isOnboardingPage) {
        return <Navigate to="/personalization" replace />
    }

    return children
}
