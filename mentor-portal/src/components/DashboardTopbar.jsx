import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardTopbar({ isMobileMenuOpen, setIsMobileMenuOpen, onProfileClick, onOpenProfileSheet, setActiveView }) {
    const { user, profile } = useAuth();

    return (
        <header className="workspace-topbar-arch">
            <div className="topbar-left-arch">
                <div className="topbar-search-arch hide-mobile">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search for sessions, mentees..." />
                </div>
                <Link to="/dashboard" className="mobile-brand-arch show-mobile">
                    <span className="mobile-brand-mark">✦</span>
                    <span className="mobile-brand-copy">
                        <span className="mobile-brand-title">Bloom</span>
                        <span className="mobile-brand-subtitle">Mentor Portal</span>
                    </span>
                </Link>
            </div>
            <div className="topbar-right-arch">
                <div className="action-items-arch hide-mobile">
                    <button className="topbar-btn-circle" title="Messages" onClick={() => setActiveView('messages')}>
                        <span className="action-icon">💬</span>
                        <span className="notification-dot"></span>
                    </button>
                    <button className="topbar-btn-circle" title="Notifications" onClick={() => setActiveView('notifications')}>
                        <span className="action-icon">🔔</span>
                        <span className="notification-dot"></span>
                    </button>
                </div>
                <button className="mobile-action-chip show-mobile" type="button" onClick={onOpenProfileSheet} aria-label="Open profile sheet">
                    <span className="mobile-action-chip__icon">⚙</span>
                </button>
                <div className="user-profile-arch hide-mobile" onClick={onProfileClick}>
                    <div className="avatar-circle">
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'M')}
                    </div>
                    <div className="user-info-arch hide-mobile">
                        <span className="user-name-arch">{profile?.full_name || 'Mentor Name'}</span>
                        <span className="user-role-arch">{profile?.role?.toUpperCase() || 'MENTOR'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
