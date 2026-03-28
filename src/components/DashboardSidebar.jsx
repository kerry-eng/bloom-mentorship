import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useTheme } from '../context/ThemeContext';

export default function DashboardSidebar({ isMobileMenuOpen, setIsMobileMenuOpen, activeView, setActiveView }) {
    const { theme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const isDashboard = location.pathname === '/dashboard';
    const isReflections = location.pathname === '/reflections';

    const handleNavClick = (view) => {
        if (view === 'reflections') {
            navigate('/reflections');
        } else if (!isDashboard) {
            navigate(`/dashboard?view=${view}`);
        } else if (setActiveView) {
            setActiveView(view);
        }
        
        if (setIsMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <aside className={`workspace-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
                <Link to="/" className="brand-logo" onClick={() => setIsMobileMenuOpen(false)}>
                    <img src="/LOGO.png" alt="Bloom Logo" style={{ height: '45px', width: 'auto' }} />
                </Link>
            </div>
            
            <nav className="sidebar-nav">
                <div className="nav-group">
                    <button 
                        className={`nav-item-arch ${activeView === 'overview' ? 'active' : ''}`} 
                        onClick={() => handleNavClick('overview')}
                    >
                        OVERVIEW
                    </button>
                    <button 
                        className={`nav-item-arch ${activeView === 'community' ? 'active' : ''}`} 
                        onClick={() => handleNavClick('community')}
                    >
                        COMMUNITY
                    </button>
                    <button 
                        className={`nav-item-arch ${activeView === 'assignments' ? 'active' : ''}`} 
                        onClick={() => handleNavClick('assignments')}
                    >
                        SESSIONS
                    </button>
                    <div className="nav-item-wrapper">
                        <button 
                            className={`nav-item-arch ${activeView === 'reflections' ? 'active' : ''}`} 
                            onClick={() => handleNavClick('reflections')}
                        >
                            REFLECTIONS
                        </button>
                    </div>
                    <button 
                        className={`nav-item-arch ${activeView === 'messages' ? 'active' : ''}`} 
                        onClick={() => handleNavClick('messages')}
                    >
                        MESSAGES
                    </button>
                    <button 
                        className={`nav-item-arch ${activeView === 'write-blog' ? 'active' : ''}`} 
                        onClick={() => handleNavClick('write-blog')}
                    >
                        STUDIO
                    </button>
                </div>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn-arch" onClick={() => supabase.auth.signOut()}>
                    <div className="logout-icon-group">
                        <span className="logout-accent"></span>
                        <div className="logout-icon-box">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </div>
                    </div>
                    <span className="logout-text">SIGN OUT</span>
                </button>
            </div>
        </aside>
    );
}
