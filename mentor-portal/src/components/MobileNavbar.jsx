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

function SettingsIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M19.4 13.2v-2.4l-2-.7a6.9 6.9 0 0 0-.8-1.9l1-1.9-1.7-1.7-1.9 1a6.9 6.9 0 0 0-1.9-.8l-.7-2h-2.4l-.7 2a6.9 6.9 0 0 0-1.9.8l-1.9-1-1.7 1.7 1 1.9a6.9 6.9 0 0 0-.8 1.9l-2 .7v2.4l2 .7a6.9 6.9 0 0 0 .8 1.9l-1 1.9 1.7 1.7 1.9-1a6.9 6.9 0 0 0 1.9.8l.7 2h2.4l.7-2a6.9 6.9 0 0 0 1.9-.8l1.9 1 1.7-1.7-1-1.9a6.9 6.9 0 0 0 .8-1.9l2-.7Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
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

export default function MobileNavbar({ activeView, setActiveView, isSuperAdmin }) {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = isSuperAdmin
        ? [
            { label: 'Home', view: 'overview', to: '/dashboard', icon: HomeIcon },
            { label: 'Mentors', to: '/mentors', icon: UsersIcon },
            { label: 'Logout', action: 'logout', icon: LogoutIcon },
        ]
        : [
            { label: 'Home', view: 'overview', to: '/dashboard', icon: HomeIcon },
            { label: 'Schedule', view: 'schedule', icon: CalendarIcon },
            { label: 'Earnings', view: 'earnings', icon: ChartIcon },
            { label: 'Settings', view: 'settings', icon: SettingsIcon },
        ];

    const handleSelect = (tab) => {
        if (tab.action === 'logout') {
            signOut();
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
