import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import './MoodChecker.css';

const MoodChecker = ({ onEntrySaved }) => {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState(null);
    const [saving, setSaving] = useState(false);

    const moods = [
        { emoji: '🎯', name: 'Focused' },
        { emoji: '⚖️', name: 'Balanced' },
        { emoji: '🌪️', name: 'Challenged' },
        { emoji: '📉', name: 'Low Energy' },
        { emoji: '🔋', name: 'Recharging' },
        { emoji: '🚀', name: 'Inspired' },
    ];

    const handleMoodSelect = async (mood) => {
        if (saving) return;
        setSelectedMood(mood.name);
        setSaving(true);
        try {
            const { error } = await supabase
                .from('mood_logs')
                .insert([{ user_id: user.id, mood: mood.name, emoji: mood.emoji }]);
            if (error) throw error;
            if (onEntrySaved) onEntrySaved();
        } catch (e) {
            console.error('Error saving mood:', e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="mood-checker-container">
            <div className="mood-header">
                <h3 className="mood-title">Performance Check-In</h3>
                <p className="mood-subtitle">Tracking your emotional state helps identify patterns in your growth.</p>
            </div>

            <div className="mood-selection-grid-inline">
                {moods.map((mood, index) => (
                    <button
                        key={index}
                        className={`mood-item-btn ${selectedMood === mood.name ? 'active' : ''} ${saving ? 'loading' : ''}`}
                        onClick={() => handleMoodSelect(mood)}
                        disabled={saving}
                    >
                        <span className="mood-icon">{mood.emoji}</span>
                        <span className="mood-text">{mood.name}</span>
                    </button>
                ))}
            </div>

            {selectedMood && (
                <div className="mood-confirmation fade-in">
                    <span className="check">✓</span>
                    Current state recorded as <strong>{selectedMood}</strong>.
                </div>
            )}
        </section>
    );
};

export default MoodChecker;
