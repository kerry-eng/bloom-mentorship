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
        <section className="journal-entry-container fade-in">
            <div className="journal-header">
                <h3 className="journal-title">Daily Journal</h3>
                <p className="journal-subtitle">Document your thoughts, wins, and breakthroughs throughout the day.</p>
            </div>

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
                        <span className="notebook-icon">📓</span>
                    </div>
                    <hr className="notebook-divider" />
                    <div className="notebook-lines">
                        <textarea
                            className="notebook-input"
                            placeholder="Dear journal... how are we growing today?"
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    <button className="notebook-save-btn" onClick={handleSave} disabled={saving}>
                        <svg className="save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        {saving ? 'Syncing...' : 'Sync to Journal'}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default JournalPreview;
