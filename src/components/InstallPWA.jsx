import React, { useEffect, useState } from 'react';
import './InstallPWA.css';

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        // Automatically show banner if not running seamlessly as an installed app
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        
        if (!isStandalone) {
            setIsVisible(true);
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Also check if display mode physically changes while running
        const mql = window.matchMedia('(display-mode: standalone)');
        const mqlHandler = (e) => {
            if (e.matches) setIsVisible(false);
        };
        mql.addEventListener('change', mqlHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            mql.removeEventListener('change', mqlHandler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (showInstructions) {
            setShowInstructions(false);
            return;
        }

        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                setDeferredPrompt(null);
                if (outcome === 'accepted') {
                    setIsVisible(false);
                }
            } catch (err) {
                console.error("Prompt failed", err);
                setShowInstructions(true);
            }
        } else {
            // The prompt isn't natively supported (iOS or throttled cache). Fallback to instructions.
            setShowInstructions(true);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const isIos = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());

    return (
        <div className="install-pwa-banner" style={{ flexDirection: 'column' }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="install-pwa-content">
                    <img src="/LOGO.png" alt="Bloom" className="install-pwa-logo" />
                    <div className="install-pwa-text">
                        <strong>Get the Bloom App</strong>
                        <p>Install our app for a faster, better experience.</p>
                    </div>
                </div>
                <div className="install-pwa-actions">
                    <button className="btn-install" onClick={handleInstallClick}>Install</button>
                    <button className="btn-dismiss" onClick={handleDismiss}>✕</button>
                </div>
            </div>

            {showInstructions && (
                <div style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', color: '#ccc', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {isIos ? (
                        <span>To install on iOS: Tap the <strong>Share</strong> icon (the square with an arrow) at the bottom toolbar, then tap <strong>Add to Home Screen</strong>.</span>
                    ) : (
                        <span>To install manually: Tap the browser <strong>Menu (⋮)</strong> at the top right, then tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</span>
                    )}
                </div>
            )}
        </div>
    );
}
