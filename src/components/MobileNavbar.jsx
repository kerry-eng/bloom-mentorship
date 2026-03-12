import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './MobileNavbar.css';

export default function MobileNavbar() {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    
    const isDashboardBase = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/reflections');
    const searchParams = new URLSearchParams(location.search);
    const activeView = searchParams.get('view') || 'overview';

    const isHome = location.pathname === '/';
    const isAbout = location.pathname === '/about';
    const isBlogs = location.pathname === '/blogs';
    const isReflections = location.pathname === '/reflections';

    // Scroll to section helper
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <div className="mobile-menu-content" onClick={e => e.stopPropagation()}>
                    <div className="menu-header">
                        <h3>Menu</h3>
                        <button className="close-btn" onClick={() => setIsMenuOpen(false)}>✕</button>
                    </div>
                    
                    <div className="menu-sections">
                        {!isDashboardBase && (
                            <Link to="/booking" className={`menu-link ${location.pathname === '/booking' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                <span className="link-icon">📅</span> Book Session
                            </Link>
                        )}
                        
                        {isDashboardBase ? (
                            <>
                                <Link to="/reflections" className={`menu-link ${isReflections ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">🧠</span> Reflections
                                </Link>
                                <Link to="/dashboard?view=messages" className={`menu-link ${activeView === 'messages' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">💬</span> Messages
                                </Link>
                                <Link to="/dashboard?view=write-blog" className={`menu-link ${activeView === 'write-blog' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">✍️</span> Studio
                                </Link>
                                <Link to="/blogs" className={`menu-link ${isBlogs ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">📰</span> Blogs
                                </Link>
                                <Link to="/booking" className={`menu-link ${location.pathname === '/booking' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">📅</span> Book Session
                                </Link>
                            </>
                        ) : (
                            <>
                                {user && (
                                    <Link to="/dashboard" className="menu-link" onClick={() => setIsMenuOpen(false)}>
                                        <span className="link-icon">📊</span> Dashboard
                                    </Link>
                                )}
                                <Link to="/reflections" className={`menu-link ${isReflections ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">🧠</span> Reflections
                                </Link>
                            </>
                        )}
                        
                        <div className="menu-divider"></div>
                        
                        <button className="mode-switch-btn" onClick={toggleTheme}>
                            <div className="mode-info">
                                <span className="mode-icon">{theme === 'bloom' ? '🌿' : '🌸'}</span>
                                <div className="mode-text">
                                    <span className="mode-label">{theme === 'bloom' ? 'Bloom' : 'Pink'} Mode</span>
                                    <span className="mode-sub">Switch to {theme === 'bloom' ? 'Pink' : 'Bloom'}</span>
                                </div>
                            </div>
                        </button>

                        <div className="menu-divider"></div>
                        
                        {user ? (
                            <button className="sign-out-btn" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                                🚪 Sign Out
                            </button>
                        ) : (
                            <Link to="/auth" className="sign-in-link" onClick={() => setIsMenuOpen(false)}>
                                🔑 Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <nav className="mobile-bottom-nav">
                {isDashboardBase ? (
                    <>
                        <Link to="/dashboard?view=overview" className={`mobile-nav-item ${activeView === 'overview' && !isReflections ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">📊</div>
                            <span className="mobile-nav-label">Overview</span>
                        </Link>
                        <Link to="/dashboard?view=assignments" className={`mobile-nav-item ${activeView === 'assignments' ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">📅</div>
                            <span className="mobile-nav-label">Sessions</span>
                        </Link>
                        <Link to="/dashboard?view=community" className={`mobile-nav-item ${activeView === 'community' ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">🤝</div>
                            <span className="mobile-nav-label">Groups</span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/" className={`mobile-nav-item ${isHome ? 'active' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="mobile-nav-icon">🏠</div>
                            <span className="mobile-nav-label">Home</span>
                        </Link>
                        <Link to="/about" className={`mobile-nav-item ${isAbout ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">🕊️</div>
                            <span className="mobile-nav-label">About</span>
                        </Link>
                        <Link to="/blogs" className={`mobile-nav-item ${isBlogs ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">✍️</div>
                            <span className="mobile-nav-label">Blogs</span>
                        </Link>
                    </>
                )}
                <button className={`mobile-nav-item ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(true)}>
                    <div className="mobile-nav-icon">≡</div>
                    <span className="mobile-nav-label">More</span>
                </button>
            </nav>
        </>
    );
}
