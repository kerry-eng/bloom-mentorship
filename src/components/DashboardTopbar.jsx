import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardTopbar({ isMobileMenuOpen, setIsMobileMenuOpen, onProfileClick }) {
    const { user, profile } = useAuth();

    return (
        <header className="workspace-topbar">
            <div className="topbar-left">
                <button
                    className="mobile-toggle-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    <span className="hamburger"></span>
                </button>
            </div>
            <div className="topbar-right">
                <div className="notification-wrapper">
                    <button className="topbar-btn">
                        <span className="bell-icon">🔔</span>
                        <span className="notification-badge"></span>
                    </button>
                </div>
                <button className="topbar-user-link" onClick={onProfileClick}>
                    <span className="welcome-text">Account: <span className="user-name">{profile?.full_name || user?.email}</span></span>
                </button>
            </div>
        </header>
    );
}
