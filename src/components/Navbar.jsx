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
        <nav className={`navbar ${scrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'}`}>
            <div className="navbar__inner container">
                <Link to="/" className="navbar__brand">
                    <div className="navbar__logo-wrapper">
                        <svg className="navbar__logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22V12M12 12C12 12 16 10 19 12C22 14 20 18 17 17C14 16 12 12 12 12ZM12 12C12 12 8 10 5 12C2 14 4 18 7 17C10 16 12 12 12 12ZM12 8C12 8 14 5 12 2C10 5 12 8 12 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="navbar__logo-text">Bloom</span>
                    </div>
                </Link>

                <div className={`navbar__links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className="navbar__link">Home</Link>
                    <Link to="/about" className="navbar__link">About</Link>
                    <Link to="/reflections" className="navbar__link">Reflections</Link>
                    <Link to="/blogs" className="navbar__link">Blogs</Link>

                    <div className="navbar__separator"></div>

                    {user ? (
                        <div className="navbar__actions">
                            <Link to="/dashboard" className="navbar__link">Dashboard</Link>
                            <button
                                onClick={toggleTheme}
                                className="btn-theme-toggle"
                                title={`Switch Theme (Current: ${theme})`}
                            >
                                <span className="theme-toggle-icon">{theme === 'bloom' ? '🌿' : '💗'}</span>
                            </button>
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
                            <button
                                onClick={toggleTheme}
                                className="btn-theme-toggle"
                                title={`Switch Theme (Current: ${theme})`}
                            >
                                <span className="theme-toggle-icon">{theme === 'bloom' ? '🌿' : '💗'}</span>
                            </button>
                            <Link to="/auth" className="navbar__link auth-link-stacked">
                                <span>Sign</span>
                                <span>In</span>
                            </Link>
                            <Link to="/booking" className="btn btn-nav-book">
                                Book Session
                            </Link>
                        </div>
                    )}
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
    )
}
