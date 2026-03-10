import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import './Personalization.css';

const Personalization = () => {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Preferences State
    const [mood, setMood] = useState(null);
    const [interests, setInterests] = useState([]);
    const [musicPref, setMusicPref] = useState('ambient');

    const moods = [
        { emoji: '😊', name: 'Focused' },
        { emoji: '😌', name: 'Calm' },
        { emoji: '😔', name: 'Reflective' },
        { emoji: '😰', name: 'Stressed' },
        { emoji: '😢', name: 'Overwhelmed' },
        { emoji: '😠', name: 'Determined' },
    ];

    const interestOptions = [
        'Strategic Planning', 'Leadership Skills', 'Emotional Intelligence',
        'Time Management', 'Technical Growth', 'Creative Innovation',
        'Career Transition', 'Work-Life Balance'
    ];

    const toggleInterest = (interest) => {
        setInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    initial_mood: mood,
                    interests: interests,
                    music_preference: musicPref,
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (error) throw error;
            await refreshProfile(user.id);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error saving personalization:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="personalize-page">
            <div className="container personalize-container">
                <div className="personalize-card glass-card fade-in">
                    <div className="personalize-header">
                        <span className="step-indicator">Step {step} of 3</span>
                        <h1 className="display-title mt-2">
                            {step === 1 && "Current State"}
                            {step === 2 && "Focus Areas"}
                            {step === 3 && "Environment"}
                        </h1>
                        <p className="subtitle">
                            {step === 1 && "How are you feeling as we begin?"}
                            {step === 2 && "What would you like to prioritize?"}
                            {step === 3 && "Select your preferred background sound."}
                        </p>
                    </div>

                    <div className="personalize-content mt-4">
                        {step === 1 && (
                            <div className="mood-selection-grid">
                                {moods.map((m) => (
                                    <button
                                        key={m.name}
                                        className={`mood-option-btn ${mood === m.name ? 'active' : ''}`}
                                        onClick={() => setMood(m.name)}
                                    >
                                        <span className="emoji">{m.emoji}</span>
                                        <span className="name">{m.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="interests-selection-grid">
                                {interestOptions.map((option) => (
                                    <button
                                        key={option}
                                        className={`interest-tag-btn ${interests.includes(option) ? 'active' : ''}`}
                                        onClick={() => toggleInterest(option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="sound-selection-grid">
                                {[
                                    { id: 'rain', icon: '🌧️', name: 'Rainfall' },
                                    { id: 'ocean', icon: '🌊', name: 'Ocean Waves' },
                                    { id: 'wind', icon: '🌬️', name: 'White Noise' },
                                    { id: 'ambient', icon: '🎵', name: 'Lofi Ambient' }
                                ].map((sound) => (
                                    <button
                                        key={sound.id}
                                        className={`sound-option-card ${musicPref === sound.id ? 'active' : ''}`}
                                        onClick={() => setMusicPref(sound.id)}
                                    >
                                        <span className="icon">{sound.icon}</span>
                                        <span className="name">{sound.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="personalize-footer mt-5">
                        {step > 1 && (
                            <button className="btn btn-secondary" onClick={prevStep}>Back</button>
                        )}
                        <span style={{ flex: 1 }}></span>
                        {step < 3 ? (
                            <button
                                className="btn btn-primary"
                                onClick={nextStep}
                                disabled={step === 1 && !mood}
                            >
                                Continue →
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? <div className="spinner sm" /> : "Complete Setup →"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Personalization;
