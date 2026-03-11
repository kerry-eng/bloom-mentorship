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
                        {theme === 'pink' ? (
                            <span className="navbar__logo-icon-pink">💗</span>
                        ) : theme === 'bo' ? (
                            <span className="navbar__logo-icon-bo">⚡</span>
                        ) : (
                            <svg className="navbar__logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C12 22 12 18 12 12C12 6 12 2 12 2M12 12C12 12 16 10 19 12C22 14 20 18 17 17C14 16 12 12 12 12ZM12 12C12 12 8 10 5 12C2 14 4 18 7 17C10 16 12 12 12 12ZM12 8C12 8 14 5 12 2C10 5 12 8 12 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                        <span className="navbar__logo-text">{theme === 'pink' ? 'bloom' : 'Bloom'}</span>
                    </div>
                </Link>

                <div className={`navbar__links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className="navbar__link">{theme === 'pink' ? 'home' : 'Home'}</Link>
                    <Link to="/about" className="navbar__link">{theme === 'pink' ? 'about' : 'About'}</Link>
                    <Link to="/reflections" className="navbar__link">{theme === 'pink' ? 'reflections' : 'Reflections'}</Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" className="navbar__link">{theme === 'pink' ? 'dashboard' : 'Dashboard'}</Link>
                            <div className="navbar__actions">
                                <button
                                    onClick={toggleTheme}
                                    className="btn-theme-toggle"
                                    title={`Switch Theme (Current: ${theme})`}
                                >
                                    {theme === 'bloom' && '🌸'}
                                    {theme === 'bo' && '⚡'}
                                    {theme === 'pink' && '💗'}
                                </button>
                                <Link to="/booking" className="btn btn-primary btn-sm btn-book btn-nav-action">
                                    Book Session
                                </Link>
                                <button onClick={handleSignOut} className="btn btn-secondary btn-sm btn-logout btn-nav-action">Sign Out</button>
                            </div>
                        </>
                    ) : (
                        <div className="navbar__actions">
                            <button
                                onClick={toggleTheme}
                                className="btn-theme-toggle"
                                title={`Switch Theme (Current: ${theme})`}
                            >
                                {theme === 'bloom' && '🌸'}
                                {theme === 'bo' && '⚡'}
                                {theme === 'pink' && '💗'}
                            </button>
                            <Link to="/auth" className="navbar__link btn-signin-nav">Sign In</Link>
                            <Link to="/booking" className="btn btn-primary btn-sm btn-book btn-nav-action">
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
