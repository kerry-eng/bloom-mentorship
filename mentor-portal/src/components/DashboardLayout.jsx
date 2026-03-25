import React from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbarRefined';
import MobileNavbar from './MobileNavbar';
import MobileProfileSheet from './MobileProfileSheet';

export default function DashboardLayout({ children, isMobileMenuOpen, setIsMobileMenuOpen, activeView, setActiveView, onProfileClick, isSuperAdmin, isProfileSheetOpen, setIsProfileSheetOpen, onOpenProfileSheet }) {
    return (
        <div className={`workspace-page ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
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
                        onOpenProfileSheet={onOpenProfileSheet}
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

            <MobileNavbar
                activeView={activeView}
                setActiveView={setActiveView}
                isSuperAdmin={isSuperAdmin}
                isProfileSheetOpen={isProfileSheetOpen}
                onOpenProfileSheet={onOpenProfileSheet}
            />

            <MobileProfileSheet
                open={isProfileSheetOpen}
                onClose={() => setIsProfileSheetOpen(false)}
                onEditProfile={() => {
                    setIsProfileSheetOpen(false)
                    setActiveView('settings')
                }}
            />
        </div>
    );
}
