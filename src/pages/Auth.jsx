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
                    <Link to="/" className="auth-card-brand">
                        <svg className="auth-logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C12 22 12 18 12 12C12 6 12 2 12 2M12 12C12 12 16 10 19 12C22 14 20 18 17 17C14 16 12 12 12 12ZM12 12C12 12 8 10 5 12C2 14 4 18 7 17C10 16 12 12 12 12ZM12 8C12 8 14 5 12 2C10 5 12 8 12 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="auth-logo-text">Bloom</span>
                    </Link>
                    <div className="card-nav-links">
                        <Link to="/">Home</Link>
                        <Link to="/about">About</Link>
                        <Link to="/blogs">Blogs</Link>
                        <button className="card-nav-search">Search</button>
                    </div>
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
