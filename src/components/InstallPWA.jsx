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

        <div className="install-pwa-banner">
            <div className="install-pwa-body">
                <div className="install-pwa-icon-wrapper">
                    <img src="/LOGO.png" alt="Bloom" className="install-pwa-logo" />
                </div>
                <div className="install-pwa-text">
                    <h4 className="install-pwa-title">Get the Bloom App</h4>
                    <p className="install-pwa-desc">Install our app for a faster, better experience.</p>
                </div>
            </div>

            <div className="install-pwa-actions">
                <button className="btn-install" onClick={handleInstallClick}>
                    {showInstructions ? 'Got it' : 'Install Now'}
                </button>
                <button className="btn-dismiss" onClick={handleDismiss} aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            {showInstructions && (
                <div className="install-pwa-instructions">
                    {isIos ? (
                        <span>To install on iOS: Tap the <strong>Share</strong> icon (square with arrow) at the bottom toolbar, then tap <strong>Add to Home Screen</strong>.</span>
                    ) : (
                        <span>To install manually: Tap the browser <strong>Menu (⋮)</strong> at the top right, then tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</span>
                    )}
                </div>
            )}
        </div>
}
