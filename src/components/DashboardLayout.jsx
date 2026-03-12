import React from 'react';
import { useTheme } from '../context/ThemeContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';

export default function DashboardLayout({ children, isMobileMenuOpen, setIsMobileMenuOpen, activeView, setActiveView, onProfileClick }) {
    const { theme } = useTheme();

    return (
        <div className={`dashboard-wrapper ${theme === 'bo' ? 'theme-bo' : ''} ${theme === 'pink' ? 'theme-pink' : ''} workspace-page ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
            <div className="workspace-container">
                <DashboardSidebar 
                    isMobileMenuOpen={isMobileMenuOpen} 
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    activeView={activeView}
                    setActiveView={setActiveView}
                />

                <main className="workspace-main">
                    <DashboardTopbar 
                        isMobileMenuOpen={isMobileMenuOpen} 
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        onProfileClick={onProfileClick}
                        setActiveView={setActiveView}
                    />

                    <div className="workspace-content">
                        {children}
                    </div>
                </main>

                {isMobileMenuOpen && (
                    <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
                )}
            </div>
        </div>
    );
}
