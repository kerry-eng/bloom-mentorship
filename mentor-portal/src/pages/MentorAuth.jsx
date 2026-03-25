import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../src/context/AuthContext'
import { supabase } from '../../../src/supabase'
import { getClientAppUrl } from '../../../src/config/appUrls'
import '../../../src/pages/Auth.css'

export default function MentorAuth() {
    const [mode, setMode] = useState('signin')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const { user, isMentor, signIn, signUp, signInWithGoogle, signInWithFacebook, signOut } = useAuth()
    const navigate = useNavigate()
    const clientPortalUrl = getClientAppUrl('/auth')

    useEffect(() => {
        if (user && isMentor) navigate('/dashboard', { replace: true })
    }, [user, isMentor, navigate])

    async function handleSocial(provider) {
        setError('')
        setLoading(true)
        try {
            if (provider === 'google') await signInWithGoogle('mentor', '/dashboard')
            if (provider === 'facebook') await signInWithFacebook('mentor', '/dashboard')
        } catch (err) {
            setError(err.message || 'Social login failed.')
            setLoading(false)
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            if (mode === 'signup') {
                const signupData = await signUp(email, password, fullName, 'mentor')
                setSuccess('Mentor account created. Check your email to confirm your signup.')
                if (signupData.session) navigate('/dashboard')
                return
            }

            const data = await signIn(email, password)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role, is_super_admin')
                .eq('id', data.user.id)
                .single()

            if (profileError) throw profileError

            const hasMentorAccess =
                profileData?.role === 'mentor' ||
                profileData?.role === 'admin' ||
                profileData?.is_super_admin

            if (!hasMentorAccess) {
                await signOut()
                setError('This account does not have mentor access. Use the client portal instead.')
                return
            }

            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-nature-container mentor-auth-page">
            <div className="auth-nature-overlay" />

            <div className="auth-nature-card fade-in">
                <div className="transformation-inner-glow" aria-hidden="true"></div>

                <nav className="auth-card-nav">
                    <a href={clientPortalUrl} className="auth-back-link">
                        <span className="back-icon">←</span>
                        <span className="back-text">Client Portal</span>
                    </a>
                </nav>

                <div className="auth-card-main">
                    <div className="mentor-auth-badge">Mentor Portal</div>
                    <h1 className="auth-card-title">
                        {mode === 'signin' ? 'Mentor Sign In' : 'Create Mentor Account'}
                    </h1>

                    <div className="auth-card-switcher">
                        {mode === 'signin' ? (
                            <span>Need access? <button onClick={() => setMode('signup')}>Create account</button></span>
                        ) : (
                            <span>Already onboarded? <button onClick={() => setMode('signin')}>Log in</button></span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="auth-nature-form">
                        {error && <div className="auth-error-hint">{error}</div>}
                        {success && <div className="auth-success-hint">{success}</div>}

                        {mode === 'signup' && (
                            <div className="nature-input-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="nature-input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>

                        <div className="nature-input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <button type="submit" className="nature-submit-btn" disabled={loading}>
                            {loading ? '...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="auth-social-sect">
                        <div className="social-divider">
                            <span>or continue with</span>
                        </div>
                        <div className="social-btns-row">
                            <button
                                className="social-btn face"
                                onClick={() => handleSocial('facebook')}
                                disabled={loading}
                            >
                                <span className="icon">f</span>
                            </button>
                            <button
                                className="social-btn goog"
                                onClick={() => handleSocial('google')}
                                disabled={loading}
                            >
                                <span className="icon">G</span>
                            </button>
                        </div>
                    </div>

                    <p className="mentor-auth-footer">
                        Looking for mentee access? <a href={clientPortalUrl}>Open the client portal</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}
