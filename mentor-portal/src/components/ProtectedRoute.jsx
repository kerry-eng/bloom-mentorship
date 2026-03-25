import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getClientAppUrl } from '../config/appUrls'

export default function ProtectedRoute({ children }) {
    const { user, isMentor, loading, profileLoading } = useAuth()

    if (loading || (user && profileLoading && !isMentor)) return (
        <div style={{
            display: 'flex', height: '100vh', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '1rem',
            background: '#fdf6f0', color: '#7c6d8a', fontFamily: 'sans-serif'
        }}>
            <div style={{ fontSize: '2rem' }}>🌸</div>
            <p>Verifying access...</p>
        </div>
    )

    if (!user) return <Navigate to="/auth" replace />

    if (!isMentor) {
        window.location.href = getClientAppUrl('/auth')
        return null
    }

    return children
}
