import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomeIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 9.75V21h12V9.75" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="5" width="16" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 3v4M16 3v4M4 9h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 19.5V5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M5 19.5H19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M8 15.5V12M12 15.5V8M16 15.5V10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-1A4.5 4.5 0 0 0 7 18.5V20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 12.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 17l5-5-5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 12H4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M20 4v16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function MoreIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" />
        </svg>
    );
}

function ProfileIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4.5 20.2a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

export default function MobileNavbar({ activeView, setActiveView, isSuperAdmin, isProfileSheetOpen, onOpenProfileSheet }) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = isSuperAdmin
        ? [
            { label: 'Home', view: 'overview', to: '/dashboard', icon: HomeIcon },
            { label: 'Mentors', to: '/mentors', icon: UsersIcon },
            { label: 'Profile', action: 'profile', icon: ProfileIcon },
            { label: 'Logout', action: 'logout', icon: LogoutIcon },
        ]
        : [
            { label: 'Home', view: 'overview', to: '/dashboard', icon: HomeIcon },
            { label: 'Schedule', view: 'schedule', icon: CalendarIcon },
            { label: 'Earnings', view: 'earnings', icon: ChartIcon },
            { label: 'More', action: 'profile', icon: MoreIcon },
        ];

    const handleSelect = (tab) => {
        if (tab.action === 'logout') {
            signOut();
            return;
        }

        if (tab.action === 'profile') {
            onOpenProfileSheet?.();
            return;
        }

        if (tab.to) {
            navigate(tab.to);
        }

        if (tab.view && setActiveView) {
            setActiveView(tab.view);
        }
    };

    const isTabActive = (tab) => {
        if (tab.action === 'logout') return false;
        if (tab.action === 'profile') return !!isProfileSheetOpen;
        if (tab.to === '/mentors') return location.pathname === '/mentors';
        if (tab.view) return activeView === tab.view;
        return location.pathname === tab.to;
    };

    return (
        <nav className="mobile-bottom-nav" aria-label="Mentor quick navigation">
            <div
                className="mobile-bottom-nav__inner"
                style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
            >
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.label}
                            type="button"
                            className={`mobile-bottom-nav__item ${isTabActive(tab) ? 'active' : ''} ${tab.action === 'logout' ? 'danger' : ''}`}
                            onClick={() => handleSelect(tab)}
                        >
                            <span className="mobile-bottom-nav__icon"><Icon /></span>
                            <span className="mobile-bottom-nav__label">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
