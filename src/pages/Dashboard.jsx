import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../supabase'
import MusivePlayer from '../components/MusivePlayer'
import { useRef } from 'react'
import './Dashboard.css'
import './ProfileView.css'
import DashboardLayout from '../components/DashboardLayout'

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

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

export default function Dashboard() {
    const { user, profile } = useAuth()
    const { theme } = useTheme()
    const [sessions, setSessions] = useState([])
    const [stats, setStats] = useState({
        sessions: 0,
        journals: 0,
        moods: 0,
        streak: 5
    })
    const [moodHistory, setMoodHistory] = useState([])
    const [loading, setLoading] = useState(true)
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const bannerInputRef = useRef(null)
    const avatarInputRef = useRef(null)
    const [uploading, setUploading] = useState({ banner: false, avatar: false })

    useEffect(() => {
        if (!user) return
        fetchAllData()
    }, [user])

    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam) {
            setActiveView(viewParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (showMusicPlayer) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [showMusicPlayer])

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

    async function handleMediaUpload(event, type) {
        const file = event.target.files[0]
        if (!file) return

        setUploading(prev => ({ ...prev, [type]: true }))
        try {
            // In a real app, we would upload to Supabase Storage here.
            // For now, we'll use a local preview and simulate a successful "save" to the profile
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64data = reader.result
                const { error } = await supabase
                    .from('profiles')
                    .update({ [`${type}_url`]: base64data })
                    .eq('id', user.id)
                
                if (error) throw error
                // Refresh profile to show new image
                window.location.reload() // Quickest way to reflect changes for now
            }
            reader.readAsDataURL(file)
        } catch (err) {
            console.error(`Upload error for ${type}:`, err)
            alert(`Failed to upload ${type}.`)
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }))
        }
    }

    const upcoming = sessions.filter(s => new Date(s.scheduled_at) > new Date() || isJoinable(s.scheduled_at))
    const past = sessions.filter(s => new Date(s.scheduled_at) < new Date() && !isJoinable(s.scheduled_at))

    const renderOverview = () => (
        <div className="profile-view-container fade-in">
            <div className="profile-banner-wrapper" onClick={() => bannerInputRef.current.click()}>
                <img src={profile?.banner_url || "/profile/banner.png"} alt="Profile Banner" className="profile-banner-img" />
                <div className="media-edit-overlay banner">
                    <span className="icon">📷</span>
                    <span>Change Banner</span>
                </div>
                <input 
                    type="file" 
                    ref={bannerInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={(e) => handleMediaUpload(e, 'banner')}
                />
            </div>

            <div className="profile-header-meta">
                <div className="profile-avatar-large" onClick={() => avatarInputRef.current.click()}>
                    <img src={profile?.avatar_url || "/hero.jpg"} alt="User Avatar" />
                    <div className="media-edit-overlay avatar">
                        <span className="icon">📷</span>
                    </div>
                    <input 
                        type="file" 
                        ref={avatarInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={(e) => handleMediaUpload(e, 'avatar')}
                    />
                </div>
                <div className="profile-main-info">
                    <div className="profile-user-titles">
                        <div className="greeting-row">
                            <span className="pill-label-vibe">{getGreeting()}</span>
                        </div>
                        <h1>{profile?.full_name || user?.email?.split('@')[0]}</h1>
                        <span className="location">📍 Kenya</span>
                    </div>
                    <div className="profile-header-stats">
                        <div className="mini-stat">
                            <span className="value">{stats.streak}</span>
                            <span className="label">Streak</span>
                        </div>
                        <div className="mini-stat">
                            <span className="value">{stats.sessions}</span>
                            <span className="label">Sessions</span>
                        </div>
                    </div>
                    <button className="edit-profile-btn">Edit Profile</button>
                </div>
            </div>

            <div className="profile-grid">
                <aside className="profile-sidebar-col">
                    <div className="profile-sidebar-card">
                        <div className="sidebar-card-header">
                            <span className="icon">😊</span>
                            <h3>Profile</h3>
                        </div>
                        <div className="sidebar-card-body">
                            <div className="info-item">
                                <span className="label">Name</span>
                                <span className="value">{profile?.full_name || 'Not set'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Date Joined</span>
                                <div className="icon-text">
                                    <span className="icon">🕒</span>
                                    <span className="value">2 months ago</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <span className="label">Phone number</span>
                                <span className="value">{profile?.phone || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-sidebar-card mt-4">
                        <div className="sidebar-card-header">
                            <span className="icon">📅</span>
                            <h3>Schedule</h3>
                        </div>
                        <div className="sidebar-card-body">
                            {upcoming.length === 0 ? (
                                <p className="empty-text">No meetings.</p>
                            ) : (
                                <div className="session-list-mini">
                                    {upcoming.slice(0, 2).map(s => (
                                        <div key={s.id} className="session-item-mini mb-3">
                                            <div className="session-info">
                                                <strong>{s.session_label}</strong>
                                                <span>{new Date(s.scheduled_at).toLocaleDateString()}</span>
                                                {isJoinable(s.scheduled_at) && (
                                                    <Link to={`/session/${s.id}?role=user`} className="text-link mt-1 d-block">Join Now</Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Link to="/booking" className="btn btn-vibration-outline btn-sm w-100 mt-2">Book Session</Link>
                        </div>
                    </div>
                </aside>

                <main className="profile-data-col">
                    <section className="bento-card reflection-highlight mb-4">
                        <div className="card-header">
                            <h2 className="card-title">Daily Reflection</h2>
                            <span className="card-label">Focus</span>
                        </div>
                        {activeReflectionSession ? (
                            <div className="reflection-form compact">
                                <p className="subtitle mb-3">Reflecting on: {activeReflectionSession.session_label}</p>
                                <textarea
                                    value={reflectionForm.notes}
                                    onChange={e => setReflectionForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="Key takeaways from your last session..."
                                />
                                <button className="btn btn-primary btn-block" onClick={handleSaveReflection}>
                                    Save Reflection
                                </button>
                            </div>
                        ) : (
                            <div className="empty-state-p">
                                <p className="empty-text">Maintain momentum by recording your growth insights daily.</p>
                                <button className="btn btn-vibration-outline btn-sm mt-3">Start New Post</button>
                            </div>
                        )}
                    </section>

                    <div className="profile-main-content">
                        <img src="/profile/illustration.png" alt="" className="empty-state-illustration" />
                        <h3 className="card-title">Adventure Awaits</h3>
                        <p className="empty-text">Your growth journey is being architected. Keep pushing.</p>
                    </div>
                </main>
            </div>
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
            <div className="module-header d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="display-title sm">Your Sessions</h2>
                    <p className="subtitle">Join active meetings or review past progress.</p>
                </div>
                <Link to="/booking" className="btn btn-primary btn-vibration btn-sm">New Booking</Link>
            </div>

            <div className="assignments-list mt-5">
                {sessions.length === 0 ? (
                    <div className="glass-card-vibe p-5 text-center">
                        <p className="empty-text">No mentorship sessions scheduled yet.</p>
                        <Link to="/booking" className="text-link mt-3 d-inline-block">Book your first session</Link>
                    </div>
                ) : (
                    sessions.map(s => (
                        <div key={s.id} className={`glass-card-vibe p-5 assignment-item ${new Date(s.scheduled_at) < new Date() && !isJoinable(s.scheduled_at) ? 'past-session' : ''}`}>
                            <div className="assignment-status-row d-flex justify-content-between align-items-center mb-4">
                                <div className={`assignment-status ${new Date(s.scheduled_at) < new Date() && !isJoinable(s.scheduled_at) ? 'done' : 'pending'}`}>
                                    {new Date(s.scheduled_at) < new Date() && !isJoinable(s.scheduled_at) ? '✓ COMPLETED' : 'UPCOMING'}
                                </div>
                                <span className="session-price-tag">KES {s.price?.toLocaleString()}</span>
                            </div>

                            <div className="session-content-row d-flex justify-content-between align-items-end">
                                <div>
                                    <h3 className="mb-2">{s.session_label || s.session_type}</h3>
                                    <p className="session-meta">
                                        📅 {new Date(s.scheduled_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        <br />
                                        ⏰ {new Date(s.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {s.mentor && (
                                        <p className="mentor-name-tag mt-2">
                                            Mentor: <strong>{s.mentor.full_name}</strong>
                                        </p>
                                    )}
                                </div>

                                <div className="session-actions">
                                    {isJoinable(s.scheduled_at) ? (
                                        <Link
                                            to={`/session/${s.id}?role=user`}
                                            className="btn btn-primary btn-vibration px-5"
                                        >
                                            🎥 Join Meeting
                                        </Link>
                                    ) : new Date(s.scheduled_at) > new Date() ? (
                                        <button className="btn btn-vibration-outline disabled" disabled>
                                            Starts soon
                                        </button>
                                    ) : (
                                        <button className="btn btn-vibration-outline" onClick={() => { setActiveView('overview'); /* Scroll to reflection */ }}>
                                            Record Reflection
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
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
        <DashboardLayout
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            activeView={activeView}
            setActiveView={setActiveView}
            onProfileClick={() => setActiveView('overview')}
        >
            {activeView === 'overview' && renderOverview()}
            {activeView === 'community' && renderCommunity()}
            {activeView === 'assignments' && renderAssignments()}
            {activeView === 'messages' && renderMessages()}
            {activeView === 'write-blog' && renderBlogStudio()}

            {/* Modals */}
            {showMusicPlayer && (
                <div className="modal-backdrop" onClick={() => { setShowMusicPlayer(false); }}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-content glass-card-vibe p-5">
                            <div className="modal-header">
                                <h3 className="display-title sm">FOCUS MODE</h3>
                                <button className="close-btn" onClick={() => { setShowMusicPlayer(false); }}>&times;</button>
                            </div>
                            <MusivePlayer inline={true} />
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
