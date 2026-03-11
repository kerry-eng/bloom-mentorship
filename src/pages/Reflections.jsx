import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabase';
import MoodChecker from '../components/MoodChecker';
import JournalPreview from '../components/JournalPreview';
import DashboardLayout from '../components/DashboardLayout';
import './Reflections.css';

export default function Reflections() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [reflections, setReflections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <DashboardLayout
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            onProfileClick={() => {}}
        >
            <div className="reflections-container-inner fade-in">
                <header className="reflections-header-simple mb-5">
                    <h1 className="display-title sm">Mindset Hub</h1>
                    <p className="subtitle">Cultivate your focus. Record your evolution.</p>
                </header>

                <div className="mindset-tools-grid">
                    <MoodChecker onEntrySaved={fetchReflections} />
                    <JournalPreview onEntrySaved={fetchReflections} />
                </div>

                <div className="section-label mt-5 mb-4">
                    <span className="pill-label-vibe">JOURNEY HISTORY</span>
                </div>

                {loading ? (
                    <div className="text-center py-5"><div className="spinner mx-auto" /></div>
                ) : reflections.length === 0 ? (
                    <div className="empty-state glass-card">
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
        </DashboardLayout>
    );
}
