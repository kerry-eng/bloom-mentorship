import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import MoodChecker from '../components/MoodChecker'
import JournalPreview from '../components/JournalPreview'
import MusivePlayer from '../components/MusivePlayer'
import './Dashboard.css'

function timeUntil(dateStr) {
    const diff = new Date(dateStr) - new Date()
    if (diff < 0) return 'Past'
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    if (days > 0) return `In ${days}d ${hours}h`
    if (hours > 0) return `In ${hours}h`
    const mins = Math.floor((diff % 3600000) / 60000)
    return `In ${mins} min`
}

function isJoinable(dateStr) {
    const diff = new Date(dateStr) - new Date()
    return diff < 15 * 60000 && diff > -90 * 60000
}

export default function Dashboard() {
    const { user, profile } = useAuth()
    const [sessions, setSessions] = useState([])
    const [stats, setStats] = useState({
        sessions: 0,
        journals: 0,
        moods: 0,
        streak: 5
    })
    const [moodHistory, setMoodHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [showMoodLogger, setShowMoodLogger] = useState(false)
    const [showMusicPlayer, setShowMusicPlayer] = useState(false)
    const [activeReflectionSession, setActiveReflectionSession] = useState(null)
    const [reflectionForm, setReflectionForm] = useState({
        notes: '',
        take_homes: '',
        actionables: '',
        key_insights: '',
        challenges: '',
        next_steps: ''
    })
    const [saveStatus, setSaveStatus] = useState('')
    const [activeTab, setActiveTab] = useState('recent')
    const [activeView, setActiveView] = useState('overview')
    const [searchParams] = useSearchParams()
    const justBooked = searchParams.get('booked') === '1'

    useEffect(() => {
        if (!user) return
        fetchAllData()
    }, [user])

    useEffect(() => {
        if (showMoodLogger || showMusicPlayer) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [showMoodLogger, showMusicPlayer])

    async function fetchAllData() {
        setLoading(true)
        try {
            const { data: sessData, error: sessErr } = await supabase
                .from('sessions')
                .select('*, mentor:mentor_id(full_name)')
                .eq('client_id', user.id)
                .order('scheduled_at', { ascending: true })
            if (sessErr) throw sessErr
            setSessions(sessData || [])

            const { count: journalCount } = await supabase
                .from('journals')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            const { data: moodData } = await supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: true })

            setMoodHistory(moodData || [])

            setStats({
                sessions: sessData?.length || 0,
                journals: journalCount || 0,
                moods: moodData?.length || 0,
                streak: 5
            })

            const pastSessions = sessData?.filter(s => new Date(s.scheduled_at) < new Date()) || []
            if (pastSessions.length > 0) {
                const latestPast = pastSessions[pastSessions.length - 1]
                setActiveReflectionSession(latestPast)
                setReflectionForm({
                    notes: latestPast.notes || '',
                    take_homes: latestPast.take_homes || '',
                    actionables: latestPast.actionables || '',
                    key_insights: latestPast.key_insights || '',
                    challenges: latestPast.challenges || '',
                    next_steps: latestPast.next_steps || ''
                })
            }
        } catch (e) {
            console.error('Error fetching dashboard data:', e)
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveReflection() {
        if (!activeReflectionSession) return
        setSaveStatus('saving')
        try {
            const { error } = await supabase
                .from('sessions')
                .update({
                    notes: reflectionForm.notes,
                    take_homes: reflectionForm.take_homes,
                    actionables: reflectionForm.actionables,
                    key_insights: reflectionForm.key_insights,
                    challenges: reflectionForm.challenges,
                    next_steps: reflectionForm.next_steps
                })
                .eq('id', activeReflectionSession.id)

            if (error) throw error
            setSaveStatus('saved')
            setTimeout(() => {
                setSaveStatus('')
                setActiveReflectionSession(null)
            }, 2000)
            setSessions(prev => prev.map(s => s.id === activeReflectionSession.id ? { ...s, ...reflectionForm } : s))
        } catch (e) {
            setSaveStatus('error')
        }
    }

    const upcoming = sessions.filter(s => new Date(s.scheduled_at) > new Date() || isJoinable(s.scheduled_at))
    const past = sessions.filter(s => new Date(s.scheduled_at) < new Date() && !isJoinable(s.scheduled_at))

    const renderOverview = () => (
        <div className="workspace-main-content">
            {activeTab === 'recent' ? (
                <div className="bento-layout fade-in">
                    <div className="bento-main-col">
                        <section className="hero-greeting">
                            <h1 className="display-title">Good morning, {user?.email?.split('@')[0] || 'Member'}.</h1>
                            <p className="subtitle">Consistency is the architecture of success.</p>
                        </section>

                        <div className="stats-bento-grid">
                            <div className="stat-card">
                                <span className="label">Growth Streak</span>
                                <span className="value">{stats.streak} Days</span>
                            </div>
                            <div className="stat-card">
                                <span className="label">Sessions</span>
                                <span className="value">{stats.sessions}</span>
                            </div>
                            <div className="stat-card">
                                <span className="label">Journals</span>
                                <span className="value">{stats.journals}</span>
                            </div>
                        </div>

                        <JournalPreview onEntrySaved={fetchAllData} />
                    </div>

                    <div className="bento-side-col">
                        <section className="bento-card session-highlight">
                            <div className="card-header">
                                <h2 className="card-title">Reflection</h2>
                                <span className="card-label">Active</span>
                            </div>
                            {activeReflectionSession ? (
                                <div className="reflection-form compact">
                                    <textarea
                                        value={reflectionForm.notes}
                                        onChange={e => setReflectionForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="Key takeaways..."
                                    />
                                    <button className="btn btn-primary btn-block" onClick={handleSaveReflection}>
                                        Verify Reflection
                                    </button>
                                </div>
                            ) : (
                                <p className="empty-text">Review your progress to maintain momentum.</p>
                            )}
                        </section>

                        <section className="bento-card upcoming-mini">
                            <div className="card-header">
                                <h2 className="card-title">Schedule</h2>
                                <Link to="/booking" className="text-link">Book Now</Link>
                            </div>
                            {upcoming.length === 0 ? (
                                <p className="empty-text">No meetings.</p>
                            ) : (
                                <div className="session-list-mini">
                                    {upcoming.slice(0, 1).map(s => (
                                        <div key={s.id} className="session-item-mini">
                                            <div className="session-dot"></div>
                                            <div className="session-info">
                                                <strong>{s.session_label}</strong>
                                                <span>{new Date(s.scheduled_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            ) : (
                <div className="analytics-view fade-in">
                    <section className="bento-card progress-report">
                        <h2 className="card-title text-center">Your Growth Path</h2>
                        <div className="progress-summary mt-4">
                            <div className="p-item">
                                <span className="p-label">Sessions Completed</span>
                                <span className="p-value">{stats.sessions} / 12</span>
                                <div className="p-bar"><div className="p-fill" style={{ width: `${(stats.sessions / 12) * 100}%` }} /></div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )

    const renderCommunity = () => (
        <div className="workspace-module fade-in">
            <div className="module-header mb-5">
                <h2 className="display-title sm">Community Exchange</h2>
                <p className="subtitle">Connect with the collective. Accelerate your growth.</p>
            </div>

            <div className="section-label mb-4">
                <span className="pill-label-vibe">Discover Groups</span>
            </div>

            <div className="community-grid">
                <div className="glass-card-vibe group-card">
                    <div className="group-badge">ACTIVE NOW</div>
                    <div className="group-content">
                        <div className="group-icon">🙏</div>
                        <h3>Faith & Focus</h3>
                        <p>Daily morning prayers and intentional living discussions.</p>
                        <div className="group-stats">
                            <span className="stat-tag">2.4k Members</span>
                            <span className="stat-tag">Live Now</span>
                        </div>
                    </div>
                    <button className="btn btn-vibration-outline btn-sm w-100 mt-4">Join Group</button>
                </div>

                <div className="glass-card-vibe group-card">
                    <div className="group-content">
                        <div className="group-icon">🌱</div>
                        <h3>Growth Hive</h3>
                        <p>Sharing breakthroughs in career and personal development.</p>
                        <div className="group-stats">
                            <span className="stat-tag">1.8k Members</span>
                            <span className="stat-tag">12 Space Chats</span>
                        </div>
                    </div>
                    <button className="btn btn-vibration-outline btn-sm w-100 mt-4">Join Group</button>
                </div>

                <div className="glass-card-vibe group-card">
                    <div className="group-content">
                        <div className="group-icon">🎭</div>
                        <h3>Creative Bloom</h3>
                        <p>Support for artists, writers, and digital creators.</p>
                        <div className="group-stats">
                            <span className="stat-tag">950 Members</span>
                            <span className="stat-tag">Daily Prompts</span>
                        </div>
                    </div>
                    <button className="btn btn-vibration-outline btn-sm w-100 mt-4">Join Group</button>
                </div>
            </div>

            <div className="glass-card-vibe mt-5 event-spotlight">
                <div className="event-info">
                    <span className="pill-label-vibe">Spotlight Event</span>
                    <h3>The Bloom Summit 2026</h3>
                    <p>A massive virtual gathering of mentors and mentees to set intentions, build roadmaps, and network for the upcoming year.</p>
                </div>
                <div className="event-actions">
                    <button className="btn btn-primary btn-vibration px-5 py-3">RSVP Now</button>
                </div>
            </div>
        </div>
    )

    const renderAssignments = () => (
        <div className="workspace-module fade-in">
            <div className="module-header">
                <h2 className="display-title sm">Performance Tracker</h2>
                <p className="subtitle">Your professional roadmap. Key milestones and action items.</p>
            </div>

            <div className="assignments-list mt-5">
                <div className="glass-card-vibe p-5 assignment-item">
                    <div className="assignment-status done">✓ DONE</div>
                    <h3>Core Vision Session</h3>
                    <p>Complete the vision board exercise from our last meeting.</p>
                    <div className="assignment-footer mt-3">
                        <span className="due-label">Completed Jun 12</span>
                    </div>
                </div>
                <div className="glass-card-vibe p-5 assignment-item">
                    <div className="assignment-status pending">PENDING</div>
                    <h3>Growth Habit Log</h3>
                    <p>Track your daily focus habits for 7 consecutive days.</p>
                    <div className="assignment-footer mt-3">
                        <span className="due-label">Due in 3 days</span>
                        <button className="btn btn-vibration-outline btn-sm">Upload Work</button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderMessages = () => (
        <div className="workspace-module fade-in">
            <div className="module-header">
                <h2 className="display-title sm">Communications</h2>
                <p className="subtitle">Direct advisory. High-frequency mentorship.</p>
            </div>

            <div className="messaging-container mt-5 glass-card-vibe">
                <div className="chat-window p-5">
                    <div className="message mentor">
                        <div className="msg-bubble">Hey there! Loved your insights in today's session. Keep that energy! 🚀</div>
                        <span className="msg-time">2:30 PM</span>
                    </div>
                    <div className="message user">
                        <div className="msg-bubble">Thank you! Really feeling the breakthrough.</div>
                        <span className="msg-time">2:45 PM</span>
                    </div>
                </div>
                <div className="chat-input-area p-4">
                    <input type="text" placeholder="Type a message..." className="chat-input" />
                    <button className="btn btn-primary btn-icon"><span>✈️</span></button>
                </div>
            </div>
        </div>
    )

    const renderBlogStudio = () => (
        <div className="workspace-module fade-in">
            <div className="module-header">
                <h2 className="display-title sm">Executive Studio</h2>
                <p className="subtitle">Publish your insights. Influence the industry.</p>
            </div>

            <div className="blog-editor-container mt-5 glass-card-vibe p-5">
                <div className="editor-group mb-4">
                    <label className="editor-label">Blog Title</label>
                    <input type="text" placeholder="Something high-energy..." className="editor-input-main" />
                </div>

                <div className="editor-row mb-4">
                    <div className="editor-group flex-1">
                        <label className="editor-label">Category</label>
                        <select className="editor-select">
                            <option>Growth & Mindset</option>
                            <option>Career Vibes</option>
                            <option>Spiritual Health</option>
                            <option>Creative Flow</option>
                        </select>
                    </div>
                </div>

                <div className="editor-group">
                    <label className="editor-label">Content</label>
                    <textarea
                        className="editor-textarea"
                        placeholder="Write from the heart. Share the breakthrough..."
                    ></textarea>
                </div>

                <div className="editor-actions mt-5">
                    <button className="btn btn-vibration-outline">Save Draft</button>
                    <button className="btn btn-primary btn-vibration px-5">Publish to Community</button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="dashboard-page workspace-page">
            <div className="workspace-container">
                <aside className="workspace-sidebar glass-card-vibe">
                    <div className="sidebar-brand">
                        <Link to="/" className="brand-logo">
                            <span className="logo-icon">🌿</span>
                            <span className="logo-text">Bloom</span>
                        </Link>
                    </div>
                    <div className="sidebar-nav">
                        <button className={`nav-item ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}>
                            <span className="nav-text">Overview</span>
                        </button>
                        <button className={`nav-item ${activeView === 'community' ? 'active' : ''}`} onClick={() => setActiveView('community')}>
                            <span className="nav-text">Community</span>
                        </button>
                        <button className={`nav-item ${activeView === 'assignments' ? 'active' : ''}`} onClick={() => setActiveView('assignments')}>
                            <span className="nav-text">Tasks</span>
                        </button>
                        <button className={`nav-item ${activeView === 'messages' ? 'active' : ''}`} onClick={() => setActiveView('messages')}>
                            <span className="nav-text">Messages</span>
                        </button>
                        <button className={`nav-item ${activeView === 'write-blog' ? 'active' : ''}`} onClick={() => setActiveView('write-blog')}>
                            <span className="nav-text">Studio</span>
                        </button>
                    </div>
                    <div className="sidebar-footer">
                        <button className="nav-item logout-item" onClick={() => supabase.auth.signOut()}>
                            <div className="nav-icon-bg logout">🚪</div>
                            <span className="nav-text">Sign Out</span>
                        </button>
                    </div>
                </aside>

                <main className="workspace-main">
                    <header className="workspace-topbar">
                        <div className="topbar-left">
                            <span className="welcome-text">Account: <span className="user-name">{profile?.full_name || user?.email}</span></span>
                        </div>
                        <div className="topbar-right">
                            <span className="pill-label-vibe">Zen Executive Active</span>
                        </div>
                    </header>

                    <div className="workspace-content">
                        {activeView === 'overview' && renderOverview()}
                        {activeView === 'community' && renderCommunity()}
                        {activeView === 'assignments' && renderAssignments()}
                        {activeView === 'messages' && renderMessages()}
                        {activeView === 'write-blog' && renderBlogStudio()}
                    </div>
                </main>
            </div>

            {/* Modals */}
            {(showMoodLogger || showMusicPlayer) && (
                <div className="modal-backdrop" onClick={() => { setShowMoodLogger(false); setShowMusicPlayer(false); }}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-content glass-card-vibe p-5">
                            <div className="modal-header">
                                <h3 className="display-title sm">{showMoodLogger ? "DAILY VIBE CHECK" : "FOCUS MODE"}</h3>
                                <button className="close-btn" onClick={() => { setShowMoodLogger(false); setShowMusicPlayer(false); }}>&times;</button>
                            </div>
                            {showMoodLogger && <MoodChecker onEntrySaved={fetchAllData} />}
                            {showMusicPlayer && <MusivePlayer inline={true} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
