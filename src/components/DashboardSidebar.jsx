import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useTheme } from '../context/ThemeContext';

export default function DashboardSidebar({ isMobileMenuOpen, setIsMobileMenuOpen, activeView, setActiveView }) {
    const { theme } = useTheme();
    const location = useLocation();

    const isDashboard = location.pathname === '/dashboard';
    const isReflections = location.pathname === '/reflections';

    const handleNavClick = (view) => {
        if (setActiveView) {
            setActiveView(view);
        }
        if (setIsMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <aside className={`workspace-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
                <Link to="/" className="brand-logo">
                    <div className="logo-icon-v2">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 4C16 4 16 12 8 16C12 16 16 16 16 28C16 28 16 20 24 16C20 16 16 16 16 4Z" fill="#A3B18A"/>
                            <path d="M16 12C18.2091 12 20 10.2091 20 8C20 5.79086 18.2091 4 16 4C13.7909 4 12 5.79086 12 8C12 10.2091 13.7909 12 16 12Z" fill="#588157"/>
                        </svg>
                    </div>
                    <span className="logo-text">Bloom</span>
                </Link>
            </div>
            
            <nav className="sidebar-nav">
                <button 
                    className={`nav-item ${activeView === 'overview' && isDashboard ? 'active' : ''}`} 
                    onClick={() => handleNavClick('overview')}
                >
                    OVERVIEW
                </button>
                <button 
                    className={`nav-item ${activeView === 'community' ? 'active' : ''}`} 
                    onClick={() => handleNavClick('community')}
                >
                    COMMUNITY
                </button>
                <button 
                    className={`nav-item ${activeView === 'assignments' ? 'active' : ''}`} 
                    onClick={() => handleNavClick('assignments')}
                >
                    SESSIONS
                </button>
                <Link 
                    to="/reflections" 
                    className={`nav-item ${isReflections ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                >
                    REFLECTIONS
                </Link>
                <button 
                    className={`nav-item ${activeView === 'messages' ? 'active' : ''}`} 
                    onClick={() => handleNavClick('messages')}
                >
                    MESSAGES
                </button>
                <button 
                    className={`nav-item ${activeView === 'write-blog' ? 'active' : ''}`} 
                    onClick={() => handleNavClick('write-blog')}
                >
                    STUDIO
                </button>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={() => supabase.auth.signOut()}>
                    <span className="logout-icon">🚪</span>
                    <span className="logout-text">SIGN OUT</span>
                </button>
            </div>
        </aside>
    );
}
