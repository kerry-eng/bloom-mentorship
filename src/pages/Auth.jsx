import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { getMentorAppUrl } from '../config/appUrls'
import './Auth.css'

export default function Auth() {
    const [mode, setMode] = useState('signin') // 'signin' | 'signup'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth()
    const navigate = useNavigate()
    const mentorPortalUrl = getMentorAppUrl('/auth')

    async function handleSocial(provider) {
        setError('')
        setLoading(true)
        try {
            if (provider === 'google') await signInWithGoogle('client')
            if (provider === 'facebook') await signInWithFacebook('client')
            // Note: OAuth redirects away, so navigation here is usually not needed immediately,
            // but Supabase will redirect back to /dashboard based on our redirectTo config.
        } catch (err) {
            setError(err.message || 'Social login failed.')
            setLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)
        try {
            if (mode === 'signup') {
                await signUp(email, password, fullName, 'client')
                setSuccess('Account created! Please check your email to confirm.')
                navigate('/dashboard')
            } else {
                const data = await signIn(email, password)
                
                // Fetch profile to check role
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                if (profileData?.role === 'mentor') {
                    // Mentors are redirected to the other portal
                    window.location.href = mentorPortalUrl
                } else {
                    navigate('/dashboard')
                }
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-nature-container">
            <div className="auth-nature-overlay" />

            <div className="auth-nature-card fade-in">
                {/* Elegant Glassmorphism Decor */}
                <div className="transformation-inner-glow" aria-hidden="true"></div>

                <nav className="auth-card-nav">
                    <Link to="/" className="auth-back-link">
                        <span className="back-icon">←</span>
                        <span className="back-text">Back to Home</span>
                    </Link>
                </nav>

                <div className="auth-card-main">
                    <h1 className="auth-card-title">
                        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                    </h1>

                    <div className="auth-card-switcher">
                        {mode === 'signin' ? (
                            <span>New here? <button onClick={() => setMode('signup')}>Sign Up</button></span>
                        ) : (
                            <span>Already a member? <button onClick={() => setMode('signin')}>Log in</button></span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="auth-nature-form">
                        {error && <div className="auth-error-hint">{error}</div>}

                        {mode === 'signup' && (
                            <>
                                <div className="nature-input-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* <div className="mentor-portal-hint">
                                    Are you a Mentor? <a href={mentorPortalUrl}>Join the Mentor Portal</a>
                                </div> */}
                            </>
                        )}

                        <div className="nature-input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="nature-input-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <button id="auth-submit" type="submit" className="nature-submit-btn" disabled={loading}>
                            {loading ? '...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="auth-social-sect">
                        <div className="social-divider">
                            <span>or {mode === 'signin' ? 'sign in' : 'sign up'} with</span>
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
                </div>
            </div>
        </div>
    )
}
