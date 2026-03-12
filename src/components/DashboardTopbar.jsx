import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardTopbar({ isMobileMenuOpen, setIsMobileMenuOpen, onProfileClick }) {
    const { user, profile } = useAuth();

    return (
        <header className="workspace-topbar-arch">
            <div className="topbar-left-arch">
                <div className="topbar-search-arch hide-mobile">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search for mentors, sessions..." />
                </div>
            </div>
            <div className="topbar-right-arch">
                <div className="action-items-arch">
                    <button className="topbar-btn-circle" title="Messages">
                        <span className="action-icon">💬</span>
                    </button>
                    <button className="topbar-btn-circle" title="Notifications">
                        <span className="action-icon">🔔</span>
                        <span className="notification-dot"></span>
                    </button>
                </div>
                <div className="user-profile-arch" onClick={onProfileClick}>
                    <div className="avatar-circle">
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'N')}
                    </div>
                    <div className="user-info-arch hide-mobile">
                        <span className="user-name-arch">{profile?.full_name || 'User Name'}</span>
                        <span className="user-role-arch">ACCOUNT</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
