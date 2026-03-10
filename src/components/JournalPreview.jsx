import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import './JournalPreview.css';

const JournalPreview = ({ onEntrySaved }) => {
    const { user } = useAuth();
    const [entry, setEntry] = useState('');
    const [reflections, setReflections] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) fetchReflections();
    }, [user]);

    async function fetchReflections() {
        const { data } = await supabase
            .from('journals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
        if (data) setReflections(data);
    }

    const handleSave = async () => {
        if (!entry.trim() || saving) return;
        setSaving(true);

        try {
            const { data, error } = await supabase
                .from('journals')
                .insert([{ user_id: user.id, content: entry }])
                .select();

            if (error) throw error;
            if (data) {
                setReflections([data[0], ...reflections]);
                setEntry('');
                if (onEntrySaved) onEntrySaved();
            }
        } catch (e) {
            console.error('Error saving journal:', e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="journal-preview-section fade-in">
            <div className="journal-header" style={{ marginBottom: '1rem' }}>
                <h2 className="journal-title">Your Personal Journal</h2>
            </div>

            <div className="journal-container-split">
                {/* Left Panel: Notebook */}
                <div className="journal-notebook-panel">
                    <div className="notebook-holes">
                        <div className="hole"></div>
                        <div className="hole"></div>
                        <div className="hole"></div>
                        <div className="hole"></div>
                        <div className="hole"></div>
                    </div>

                    <div className="notebook-content">
                        <div className="notebook-header">
                            <span className="notebook-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span className="notebook-icon">✨</span>
                        </div>
                        <hr className="notebook-divider" />
                        <div className="notebook-lines">
                            <input
                                type="text"
                                className="notebook-input"
                                placeholder="Dear journal... how am i feeling today?"
                                value={entry}
                                onChange={(e) => setEntry(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                disabled={saving}
                            />
                            <div className="paper-line"></div>
                            <div className="paper-line"></div>
                            <div className="paper-line"></div>
                        </div>

                        <button className="notebook-save-btn" onClick={handleSave} disabled={saving}>
                            <svg className="save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            {saving ? 'Saving...' : 'Save to My Journal'}
                        </button>
                    </div>

                    <button className="notebook-float-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                            <path d="M12 17c-1.1 0-2-.9-2-2 0-.31.07-.61.2-.88.16-.32.06-.71-.24-.91-.18-.12-.39-.18-.6-.18-1.65 0-3-1.35-3-3 0-1.65 1.35-3 3-3 .24 0 .47.03.69.09.31.08.64-.09.77-.39.14-.3.21-.63.21-.97 0-1.65 1.35-3 3-3 1.65 0 3 1.35 3 3 0 .32-.06.63-.18.91-.16.35.08.77.44.89.24.08.5.12.76.12 1.65 0 3 1.35 3 3 0 1.65-1.35 3-3 3-.3 0-.58-.04-.84-.12-.34-.1-.71.06-.88.38-.13.26-.2.55-.2.85 0 1.1-.9 2-2 2H12zM12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
                        </svg>
                    </button>
                </div>

                {/* Right Panel: Recent Reflections */}
                <div className="journal-reflections-panel">
                    <h3 className="reflections-title">Your Recent Reflections</h3>
                    {reflections.length === 0 ? (
                        <div className="reflections-empty fade-in">
                            <p className="journal-empty-text">Your journal entries will appear here ✨</p>
                        </div>
                    ) : (
                        <div className="reflections-list">
                            {reflections.map((ref) => (
                                <div key={ref.id} className="reflection-card fade-in-up">
                                    <div className="reflection-card-header">
                                        <span className="reflection-card-date">
                                            {new Date(ref.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="reflection-card-pin">📌</span>
                                    </div>
                                    <p className="reflection-card-text">{ref.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default JournalPreview;
