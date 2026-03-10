import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabase';
import MoodChecker from '../components/MoodChecker';
import JournalPreview from '../components/JournalPreview';
import './Reflections.css';

export default function Reflections() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [reflections, setReflections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchReflections();
    }, [user]);

    async function fetchReflections() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('client_id', user.id)
                .not('notes', 'is', null)
                .order('scheduled_at', { ascending: false });

            if (error) throw error;
            setReflections(data || []);
        } catch (e) {
            console.error('Error fetching reflections:', e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`reflections-page ${theme === 'bo' ? 'theme-bo' : ''}`}>
            <div className="container reflections-container">
                <header className="reflections-header fade-in">
                    <Link to="/dashboard" className="back-btn" aria-label="Back">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="header-titles">
                        <h1 className="display-title">Mindset Hub</h1>
                        <p className="subtitle">Cultivate your focus. Record your evolution.</p>
                    </div>
                </header>

                <div className="mindset-tools-grid mb-5">
                    <div className="tool-card glass-card fade-in">
                        <MoodChecker onEntrySaved={fetchReflections} />
                    </div>
                    <div className="tool-card glass-card fade-in">
                        <JournalPreview onEntrySaved={fetchReflections} />
                    </div>
                </div>

                <div className="section-label mb-4 fade-in">
                    <span className="pill-label-vibe">JOURNEY HISTORY</span>
                </div>

                {loading ? (
                    <div className="text-center py-5"><div className="spinner mx-auto" /></div>
                ) : reflections.length === 0 ? (
                    <div className="empty-state glass-card fade-in">
                        <div className="empty-icon">📔</div>
                        <h3>No reflections on record</h3>
                        <p>Your session insights will appear here once you've completed a reflection on your dashboard.</p>
                        <Link to="/dashboard" className="btn btn-primary mt-3">Go to Dashboard</Link>
                    </div>
                ) : (
                    <div className="reflections-grid">
                        {reflections.map((ref, idx) => (
                            <article key={ref.id} className={`reflection-card glass-card fade-in-delay-${Math.min(idx + 1, 4)}`}>
                                <div className="reflection-card-header">
                                    <div className="date-tag">
                                        {new Date(ref.scheduled_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </div>
                                    <h2 className="session-title">{ref.session_label}</h2>
                                </div>

                                <div className="reflection-card-content">
                                    <div className="content-block">
                                        <h4>Key Focus Areas</h4>
                                        <p>{ref.notes || 'No notes provided.'}</p>
                                    </div>
                                    <div className="content-block">
                                        <h4>Strategic Insights</h4>
                                        <p>{ref.key_insights || 'No insights recorded.'}</p>
                                    </div>
                                    <div className="content-block">
                                        <h4>Action Plan</h4>
                                        <p>{ref.next_steps || 'Pending definition.'}</p>
                                    </div>
                                </div>

                                <div className="reflection-card-footer">
                                    <span className="status-badge">Completed Session</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
