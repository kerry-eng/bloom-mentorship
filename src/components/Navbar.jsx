import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Navbar.css'
import './NavbarTheme.css'

export default function Navbar() {
    const { user, signOut } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        setMenuOpen(false)
    }, [location])

    async function handleSignOut() {
        await signOut()
        navigate('/')
    }

    const isHome = location.pathname === '/'

    return (
        <>
            <div className={`navbar__overlay ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)}></div>
            <nav className={`navbar ${scrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'}`}>
                <div className="navbar__inner container">
                    <Link to="/" className="navbar__brand">
                        <div className="navbar__logo-wrapper">
                            <img src="/LOGO.png" alt="Bloom Logo" style={{ height: '44px', width: 'auto', display: 'block' }} className="navbar__logo-img" />
                        </div>
                    </Link>

                    <div className={`navbar__links ${menuOpen ? 'open' : ''}`}>
                        <div className="navbar__mobile-header">
                            <div className="navbar__logo-wrapper">
                                <img src="/LOGO.png" alt="Bloom Logo" style={{ height: '44px', width: 'auto', display: 'block' }} className="navbar__logo-img" />
                            </div>
                        </div>

                        <div className="navbar__main-links">
                            <Link to="/" className="navbar__link">Home</Link>
                            <Link to="/about" className="navbar__link">About</Link>
                            <Link to="/freedom" className="navbar__link">Freedom</Link>
                            <Link to="/blogs" className="navbar__link">Blogs</Link>
                        </div>

                        <div className="navbar__footer-actions">
                            <button
                                onClick={toggleTheme}
                                className="btn-theme-toggle"
                                title={`Switch Theme (Current: ${theme})`}
                            >
                                <span className="theme-toggle-icon">{theme === 'bloom' ? '🌿' : '🌸'}</span>
                                <span className="theme-toggle-label">{theme === 'bloom' ? 'Bloom' : 'Pink'} Mode</span>
                            </button>

                            {user ? (
                                <div className="navbar__actions">
                                    <Link to="/dashboard" className="navbar__link">Dashboard</Link>
                                    <Link to="/booking" className="btn btn-nav-book">
                                        Book Session
                                    </Link>
                                    <button onClick={handleSignOut} className="btn-logout-minimal" title="Sign Out">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="navbar__actions">
                                    {/* <a href="http://localhost:5174/auth" className="navbar__link mentor-join-nav">Mentor Application</a> */}
                                    <Link to="/auth" className="navbar__link">
                                        Sign In
                                    </Link>
                                    <Link to="/booking" className="btn btn-nav-book">
                                        Book Session
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                        id="nav-toggle"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </nav>
        </>
    )
}
