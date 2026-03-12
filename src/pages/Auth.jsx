import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Auth() {
    const [mode, setMode] = useState('signin') // 'signin' | 'signup'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const { signIn, signUp } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)
        try {
            if (mode === 'signup') {
                await signUp(email, password, fullName)
                // navigate('/personalization') // Redirection will happen after login or via a check
                setSuccess('Account created! Please check your email to confirm, then sign in.')
                setMode('signin')
            } else {
                await signIn(email, password)
                // We should check if personalization is completed here or in a wrapper
                navigate('/dashboard')
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
                            <span>New here? <button onClick={() => setMode('signup')}>Join us</button></span>
                        ) : (
                            <span>Already a member? <button onClick={() => setMode('signin')}>Log in</button></span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="auth-nature-form">
                        {error && <div className="auth-error-hint">{error}</div>}

                        {mode === 'signup' && (
                            <div className="nature-input-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    required
                                />
                            </div>
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
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
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
                            <button className="social-btn face"><span className="icon">f</span></button>
                            <button className="social-btn goog"><span className="icon">G</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
