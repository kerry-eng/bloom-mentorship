import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MobileProfileSheet({ open, onClose, onEditProfile }) {
    const { user, profile, signOut, isSuperAdmin } = useAuth();

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleEscape = (event) => {
            if (event.key === 'Escape') onClose?.();
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleEscape);
        };
    }, [open, onClose]);

    if (!open) return null;

    const activeSince = profile?.created_at
        ? `${Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24 * 30))} months ago`
        : 'Recently joined';

    const roleLabel = isSuperAdmin ? 'Super Admin' : (profile?.role || 'Mentor').toUpperCase();

    return (
        <div className="mobile-profile-sheet__overlay" onClick={onClose}>
            <section className="mobile-profile-sheet" onClick={(event) => event.stopPropagation()} aria-label="Mobile profile sheet">
                <div className="mobile-profile-sheet__handle" />
                <div className="mobile-profile-sheet__header">
                    <div>
                        <p className="mobile-profile-sheet__eyebrow">Account</p>
                        <h2>{profile?.full_name || 'Mentor Profile'}</h2>
                    </div>
                    <button type="button" className="mobile-profile-sheet__close" onClick={onClose} aria-label="Close profile sheet">
                        ✕
                    </button>
                </div>

                <div className="mobile-profile-sheet__hero">
                    <div className="mobile-profile-sheet__banner" />
                    <div className="mobile-profile-sheet__avatar">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile avatar" />
                        ) : (
                            <span>{profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'M'}</span>
                        )}
                    </div>
                </div>

                <div className="mobile-profile-sheet__identity">
                    <h3>{profile?.full_name || 'Mentor Name'}</h3>
                    <div className="mobile-profile-sheet__chips">
                        <span className="mobile-profile-sheet__chip">{roleLabel}</span>
                        <span className="mobile-profile-sheet__chip mobile-profile-sheet__chip--soft">{profile?.verification_status || 'pending'}</span>
                    </div>
                    <p>{profile?.bio || 'Empowering growth and guiding the next generation.'}</p>
                </div>

                <div className="mobile-profile-sheet__stats">
                    <div>
                        <strong>{activeSince}</strong>
                        <span>Member since</span>
                    </div>
                    <div>
                        <strong>{user?.email ? 'Verified' : 'Pending'}</strong>
                        <span>Account status</span>
                    </div>
                </div>

                <div className="mobile-profile-sheet__actions">
                    <button type="button" className="mobile-profile-sheet__primary" onClick={() => {
                        onEditProfile?.();
                        onClose?.();
                    }}>
                        Edit profile
                    </button>
                    <button type="button" className="mobile-profile-sheet__secondary" onClick={async () => {
                        await signOut();
                        onClose?.();
                    }}>
                        Sign out
                    </button>
                </div>
            </section>
        </div>
    );
}
