import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16L21 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}

function ChatIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M5 6.5C5 5.67 5.67 5 6.5 5h11c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5H11l-4.5 4v-4H6.5C5.67 15 5 14.33 5 13.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function BellIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M12 4.5a4 4 0 0 0-4 4v2.4c0 .83-.28 1.63-.8 2.28L6 14.75h12l-1.2-1.57a3.8 3.8 0 0 1-.8-2.28V8.5a4 4 0 0 0-4-4z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path d="M10 18a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}

function SettingsIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7zm8 3.5l-1.7.75c-.12.4-.28.78-.48 1.13l.65 1.75l-1.8 1.8l-1.75-.65c-.35.2-.73.36-1.13.48L12 20l-1.79-1.71c-.4-.12-.78-.28-1.13-.48l-1.75.65l-1.8-1.8l.65-1.75a6.3 6.3 0 0 1-.48-1.13L4 12l1.7-.75c.12-.4.28-.78.48-1.13l-.65-1.75l1.8-1.8l1.75.65c.35-.2.73-.36 1.13-.48L12 4l1.79 1.71c.4.12.78.28 1.13.48l1.75-.65l1.8 1.8l-.65 1.75c.2.35.36.73.48 1.13z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default function DashboardTopbarRefined({ onProfileClick, onOpenProfileSheet, setActiveView }) {
    const { user, profile } = useAuth()

    const displayName = profile?.full_name || 'Mentor Name'
    const roleLabel = profile?.role?.toUpperCase() || 'MENTOR'
    const initials = profile?.full_name
        ? profile.full_name.charAt(0).toUpperCase()
        : user?.email?.charAt(0).toUpperCase() || 'M'

    return (
        <header className="workspace-topbar-arch">
            <div className="topbar-left-arch">
                <div className="topbar-search-wrap hide-mobile">
                    <div className="topbar-search-arch">
                        <span className="search-icon" aria-hidden="true">
                            <SearchIcon />
                        </span>
                        <div className="topbar-search-copy">
                            <span className="topbar-search-label">Workspace search</span>
                            <input type="text" placeholder="Search for sessions, mentees, or notes" />
                        </div>
                    </div>
                </div>

                <Link to="/dashboard" className="mobile-brand-arch show-mobile">
                    <span className="mobile-brand-mark">B</span>
                    <span className="mobile-brand-copy">
                        <span className="mobile-brand-title">Bloom</span>
                        <span className="mobile-brand-subtitle">Mentor Portal</span>
                    </span>
                </Link>
            </div>

            <div className="topbar-right-arch">
                <div className="action-items-arch hide-mobile">
                    <button className="topbar-btn-circle" title="Messages" onClick={() => setActiveView('messages')}>
                        <span className="action-icon" aria-hidden="true">
                            <ChatIcon />
                        </span>
                        <span className="notification-dot"></span>
                    </button>

                    <button className="topbar-btn-circle" title="Notifications" onClick={() => setActiveView('notifications')}>
                        <span className="action-icon" aria-hidden="true">
                            <BellIcon />
                        </span>
                        <span className="notification-dot"></span>
                    </button>
                </div>

                <button className="mobile-action-chip show-mobile" type="button" onClick={onOpenProfileSheet} aria-label="Open profile sheet">
                    <span className="mobile-action-chip__icon" aria-hidden="true">
                        <SettingsIcon />
                    </span>
                </button>

                <button type="button" className="user-profile-arch hide-mobile" onClick={onProfileClick}>
                    <div className="avatar-circle">{initials}</div>
                    <div className="user-info-arch">
                        <span className="user-role-arch">{roleLabel}</span>
                        <span className="user-name-arch">{displayName}</span>
                    </div>
                </button>
            </div>
        </header>
    )
}
