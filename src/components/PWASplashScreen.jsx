import React, { useState, useEffect } from 'react';

export default function PWASplashScreen() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Evaluate if running natively as a standalone PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
            || window.navigator.standalone 
            || document.referrer.includes('android-app://');
            
        // If not in standalone mode, just render normally without a splash
        if (!isStandalone) {
            setShow(false);
            return;
        }

        // Show splash screen for exactly 2 seconds
        const timer = setTimeout(() => {
            setShow(false);
        }, 2000);
        
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 999999,
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'bloomSplashFade .5s ease 1.8s forwards'
        }}>
            <img 
                src="/Splash screen.png" 
                alt="Bloom Loading..." 
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' // ensures the user's design fills the screen gracefully
                }} 
            />
            <style>{`
                @keyframes bloomSplashFade {
                    from { opacity: 1; visibility: visible; }
                    to { opacity: 0; visibility: hidden; }
                }
            `}</style>
        </div>
    );
}
