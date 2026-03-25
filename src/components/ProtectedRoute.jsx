import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({
    children,
    mentorOnly = false,
    mentorRedirectTo = '/dashboard',
    requireOnboarding = true,
    onboardingRedirectTo = '/personalization'
}) {
    const { user, profile, isMentor, loading } = useAuth()

    if (loading) return null

    if (!user) return <Navigate to="/auth" replace />

    if (mentorOnly && !isMentor) return <Navigate to={mentorRedirectTo} replace />

    // Redirect to personalization if onboarding not completed
    const isOnboardingPage = window.location.pathname === '/personalization'
    if (requireOnboarding && user && profile && !profile.onboarding_completed && !isOnboardingPage) {
        return <Navigate to={onboardingRedirectTo} replace />
    }

    return children
}
