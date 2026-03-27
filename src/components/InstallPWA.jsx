import React, { useEffect, useState } from 'react';
import './InstallPWA.css';

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="install-pwa-banner">
            <div className="install-pwa-content">
                <img src="/LOGO.png" alt="Bloom" className="install-pwa-logo" />
                <div className="install-pwa-text">
                    <strong>Get the Bloom App</strong>
                    <p>Install our app for a faster, better experience.</p>
                </div>
            </div>
            <div className="install-pwa-actions">
                <button className="btn-install" onClick={handleInstallClick}>Install Now</button>
                <button className="btn-dismiss" onClick={handleDismiss}>✕</button>
            </div>
        </div>
    );
}
