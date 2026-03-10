import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

const MusicContext = createContext();

export const SOUNDS = [
    { id: 'rain', name: 'Rain', icon: '☁️', url: 'https://assets.mixkit.co/music/preview/mixkit-rain-sound-74.mp3' },
    { id: 'ocean', name: 'Ocean', icon: '🌊', url: 'https://assets.mixkit.co/music/preview/mixkit-waves-at-the-beach-209.mp3' },
    { id: 'wind', name: 'Wind', icon: '🌬️', url: 'https://assets.mixkit.co/music/preview/mixkit-wind-howl-blowing-65.mp3' },
    { id: 'ambient', name: 'Ambient', icon: '🎵', url: 'https://assets.mixkit.co/music/preview/mixkit-ambient-relaxing-music-116.mp3' }
];

export const MusicProvider = ({ children }) => {
    const { profile } = useAuth();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSound, setCurrentSound] = useState(SOUNDS[3]);
    const audioRef = useRef(null);

    // Sync with profile preference
    useEffect(() => {
        if (profile?.music_preference) {
            const pref = SOUNDS.find(s => s.id === profile.music_preference);
            if (pref && pref.id !== currentSound.id) {
                setCurrentSound(pref);
                // Respect autoplay if already playing, but don't force it
                if (isPlaying && audioRef.current) {
                    audioRef.current.load();
                    audioRef.current.play().catch(() => setIsPlaying(false));
                }
            }
        }
    }, [profile]);

    const play = () => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => {
                    console.error("Audio playback error:", err);
                    // This often happens due to autoplay policy
                    setIsPlaying(false);
                });
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const togglePlay = () => {
        if (isPlaying) pause();
        else play();
    };

    const selectSound = (sound) => {
        if (currentSound.id === sound.id) {
            togglePlay();
            return;
        }

        setCurrentSound(sound);
        // We wait for the next render for src to update
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.load();
                play();
            }
        }, 0);
    };

    return (
        <MusicContext.Provider value={{
            isPlaying,
            currentSound,
            togglePlay,
            selectSound,
            SOUNDS
        }}>
            {children}
            <audio
                ref={audioRef}
                src={currentSound.url}
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);
