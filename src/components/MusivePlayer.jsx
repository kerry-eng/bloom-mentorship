import { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import './MusivePlayer.css';

const MusivePlayer = ({ inline = false }) => {
    const { isPlaying, currentSound, togglePlay, selectSound, SOUNDS } = useMusic();
    const [showMenu, setShowMenu] = useState(inline);

    const handleToggle = (e) => {
        if (e) e.stopPropagation();
        togglePlay();
    };

    const handleSelect = (sound) => {
        selectSound(sound);
    };

    // Close menu when clicking outside (only if NOT inline)
    useEffect(() => {
        if (inline) return;
        const handleClickOutside = () => setShowMenu(false);
        if (showMenu) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [showMenu, inline]);

    const renderContent = () => (
        <div className={`musive-popup ${inline ? 'inline' : 'fade-in'}`}>
            <div className="musive-popup-header">
                <h3 className="musive-title">Calming Sounds</h3>
                <p className="musive-subtitle">Choose what soothes your soul ✿</p>
            </div>

            <div className="musive-tracks">
                {SOUNDS.map(sound => (
                    <button
                        key={sound.id}
                        className={`musive-track-item ${currentSound.id === sound.id ? 'active' : ''}`}
                        onClick={() => handleSelect(sound)}
                    >
                        <div className="track-left">
                            <span className="track-icon">{sound.icon}</span>
                            <span className="track-name">{sound.name}</span>
                        </div>
                        {currentSound.id === sound.id && isPlaying ? (
                            <div className="audio-wave"><span></span><span></span><span></span></div>
                        ) : (
                            <div className="play-hint-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="musive-popup-footer">
                ✨ find your inner peace ✨
            </div>
        </div>
    );

    if (inline) {
        return (
            <div className="musive-player inline">
                {renderContent()}
            </div>
        );
    }

    return (
        <div className="musive-player" onClick={(e) => e.stopPropagation()}>
            {showMenu && renderContent()}

            <button
                className={`musive-btn ${isPlaying ? 'playing' : ''} ${showMenu ? 'menu-open' : ''}`}
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Open sound menu"
            >
                <div className="musive-btn-icon">
                    {isPlaying ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                    )}
                </div>

                {isPlaying && (
                    <div className="musive-playing-indicator" onClick={handleToggle}>
                        <div className="pause-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        </div>
                    </div>
                )}
            </button>
        </div>
    );
};

export default MusivePlayer;
