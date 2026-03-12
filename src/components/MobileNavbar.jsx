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
                                <span className="link-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </span> Book Session
                            </Link>
                        )}
                        
                        {isDashboardBase ? (
                            <>
                                <Link to="/reflections" className={`menu-link ${isReflections ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path><path d="M12 12 2.21 12"></path><path d="M12 12 12 2"></path></svg>
                                    </span> Reflections
                                </Link>
                                <Link to="/dashboard?view=messages" className={`menu-link ${activeView === 'messages' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                    </span> Messages
                                </Link>
                                <Link to="/dashboard?view=write-blog" className={`menu-link ${activeView === 'write-blog' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    </span> Studio
                                </Link>
                                <Link to="/blogs" className={`menu-link ${isBlogs ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                    </span> Blogs
                                </Link>
                                <Link to="/booking" className={`menu-link ${location.pathname === '/booking' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    </span> Book Session
                                </Link>
                            </>
                        ) : (
                            <>
                                {user && (
                                    <Link to="/dashboard" className="menu-link" onClick={() => setIsMenuOpen(false)}>
                                        <span className="link-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                                        </span> Dashboard
                                    </Link>
                                )}
                                <Link to="/reflections" className={`menu-link ${isReflections ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                                    <span className="link-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                    </span> Reflections
                                </Link>
                            </>
                        )}
                        
                        <div className="menu-divider"></div>
                        
                        <button className="mode-switch-btn" onClick={toggleTheme}>
                            <div className="mode-info">
                                <span className="mode-icon">
                                    {theme === 'bloom' ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10z"></path><path d="M12 11V6"></path><path d="M12 18v-3"></path><path d="M16.5 16.5l-2.5-2.5"></path><path d="M7.5 7.5l2.5 2.5"></path><path d="M16.5 7.5l-2.5 2.5"></path><path d="M7.5 16.5l2.5-2.5"></path></svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                    )}
                                </span>
                                <div className="mode-text">
                                    <span className="mode-label">{theme === 'bloom' ? 'Bloom' : 'Pink'} Mode</span>
                                    <span className="mode-sub">Switch to {theme === 'bloom' ? 'Pink' : 'Bloom'}</span>
                                </div>
                            </div>
                        </button>

                        <div className="menu-divider"></div>
                        
                        {user ? (
                            <button className="sign-out-btn" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Sign Out
                            </button>
                        ) : (
                            <Link to="/auth" className="sign-in-link" onClick={() => setIsMenuOpen(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <nav className="mobile-bottom-nav">
                {isDashboardBase ? (
                    <>
                        <Link to="/dashboard?view=overview" className={`mobile-nav-item ${activeView === 'overview' && !isReflections ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="9"></rect>
                                    <rect x="14" y="3" width="7" height="5"></rect>
                                    <rect x="14" y="12" width="7" height="9"></rect>
                                    <rect x="3" y="16" width="7" height="5"></rect>
                                </svg>
                            </div>
                            <span className="mobile-nav-label">Overview</span>
                        </Link>
                        <Link to="/dashboard?view=assignments" className={`mobile-nav-item ${activeView === 'assignments' ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <span className="mobile-nav-label">Sessions</span>
                        </Link>
                        <Link to="/dashboard?view=community" className={`mobile-nav-item ${activeView === 'community' ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M7 21v-2a4 4 0 0 1 3-3.87"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <span className="mobile-nav-label">Groups</span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/" className={`mobile-nav-item ${isHome ? 'active' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="mobile-nav-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            </div>
                            <span className="mobile-nav-label">Home</span>
                        </Link>
                        <Link to="/about" className={`mobile-nav-item ${isAbout ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            </div>
                            <span className="mobile-nav-label">About</span>
                        </Link>
                        <Link to="/blogs" className={`mobile-nav-item ${isBlogs ? 'active' : ''}`}>
                            <div className="mobile-nav-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                </svg>
                            </div>
                            <span className="mobile-nav-label">Blogs</span>
                        </Link>
                    </>
                )}
                <button className={`mobile-nav-item ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(true)}>
                    <div className="mobile-nav-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </div>
                    <span className="mobile-nav-label">More</span>
                </button>
            </nav>
        </>
    );
}
