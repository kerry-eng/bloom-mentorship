import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../supabase'
import MusivePlayer from '../components/MusivePlayer'
import { useRef } from 'react'
import './Dashboard.css'
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
    const { user, profile, refreshProfile } = useAuth()
    const { theme } = useTheme()
    const navigate = useNavigate()
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
    const [votd, setVotd] = useState({ text: 'The Lord is my shepherd; I shall not want.', reference: 'Psalm 23:1' })
    const [selectedMood, setSelectedMood] = useState('Balanced')
    const [showBookingSuccess, setShowBookingSuccess] = useState(false)
    const [blogForm, setBlogForm] = useState({ title: '', category: 'Growth & Mindset', content: '' })
    const [publishing, setPublishing] = useState(false)

    useEffect(() => {
        if (!user) return
        fetchAllData()
    }, [user])

    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam === 'reflections') {
            navigate('/reflections');
        } else if (viewParam) {
            setActiveView(viewParam);
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        if (searchParams.get('booked') === '1') {
            setShowBookingSuccess(true)
            // Clean up the URL after 4 seconds
            setTimeout(() => {
                setShowBookingSuccess(false)
                const newParams = new URLSearchParams(searchParams)
                newParams.delete('booked')
                navigate(`/dashboard?${newParams.toString()}`, { replace: true })
            }, 4000)
        }
    }, [searchParams, navigate])

    useEffect(() => {
        fetchVotd()
    }, [])

    async function fetchVotd() {
        try {
            const resp = await fetch('https://labs.bible.org/api/?passage=votd&type=json')
            const data = await resp.json()
            if (data && data[0]) {
                setVotd({ text: data[0].text, reference: `${data[0].bookname} ${data[0].chapter}:${data[0].verse}` })
            }
        } catch (e) {
            console.error('Failed to fetch VOTD:', e)
        }
    }

    async function handleMoodUpdate(mood) {
        setSelectedMood(mood)
        try {
            const { error } = await supabase
                .from('mood_logs')
                .insert([{ user_id: user.id, mood, created_at: new Date().toISOString() }])
            if (error) throw error
            fetchAllData() // Refresh stats/history
        } catch (e) {
            console.error('Error logging mood:', e)
        }
    }

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
            const base64data = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.onerror = (e) => reject(e)
                reader.readAsDataURL(file)
            })

            const { error } = await supabase
                .from('profiles')
                .update({ [`${type}_url`]: base64data })
                .eq('id', user.id)
            
            if (error) throw error
            
            // Refresh Both AuthContext profile and local Page data
            await refreshProfile(user.id)
            await fetchAllData() 
            
            setUploading(prev => ({ ...prev, [type]: false }))
            event.target.value = ''
        } catch (err) {
            console.error(`Upload error for ${type}:`, err)
            alert(`Failed to upload ${type}. Details: ${err.message || 'Unknown error'}`)
            setUploading(prev => ({ ...prev, [type]: false }))
        }
    }

    async function handlePublishBlog() {
        if (!blogForm.title || !blogForm.content) {
            alert('Please provide both a title and content.')
            return
        }

        setPublishing(true)
        try {
            const excerpt = blogForm.content.substring(0, 150) + (blogForm.content.length > 150 ? '...' : '')
            const { error } = await supabase
                .from('blogs')
                .insert([{
                    title: blogForm.title,
                    category: blogForm.category,
                    content: blogForm.content,
                    excerpt: excerpt,
                    author_id: user.id
                }])

            if (error) throw error
            
            alert('Blog published to community successfully!')
            setBlogForm({ title: '', category: 'Growth & Mindset', content: '' })
            navigate('/blogs') // Optional: route to blogs to see result
        } catch (e) {
            console.error('Publish error:', e)
            alert('Failed to publish. Check console.')
        } finally {
            setPublishing(false)
        }
    }

    const upcoming = sessions.filter(s => new Date(s.scheduled_at) > new Date() || isJoinable(s.scheduled_at))
    const past = sessions.filter(s => new Date(s.scheduled_at) < new Date() && !isJoinable(s.scheduled_at))

    const renderOverview = () => (
        <div className="overview-container-arch fade-in">
            {/* Banner & Profile Section */}
            <div className="profile-header-arch">
                <div className="hero-banner-arch" onClick={() => bannerInputRef.current?.click()}>
                    <img src={profile?.banner_url || "/profile/banner.png"} alt="Banner" className="arch-banner-img" />
                    {uploading.banner && <div className="upload-overlay-arch">Uploading...</div>}
                </div>
                
                <div className="profile-overlay-circle" onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}>
                    <img src={profile?.avatar_url || "/hero.jpg"} alt="Avatar" className="arch-avatar-img" />
                    <div className="avatar-edit-hint">
                        <span>CHANGE</span>
                    </div>
                    {uploading.avatar && <div className="upload-overlay-arch">...</div>}
                </div>
            </div>

            {/* Hidden Inputs */}
            <input type="file" ref={bannerInputRef} onChange={(e) => handleMediaUpload(e, 'banner')} style={{ display: 'none' }} accept="image/*" />
            <input type="file" ref={avatarInputRef} onChange={(e) => handleMediaUpload(e, 'avatar')} style={{ display: 'none' }} accept="image/*" />

            {/* Greeting & Bio Row */}
            <div className="bio-row-arch">
                <div className="bio-main-info">
                    <h1>Good evening {profile?.full_name?.split(' ')[0] || 'User'},</h1>
                    <p className="bio-p">{profile?.bio || 'Passionate about mental well-being and architectural design. Building a path with clarity.'}</p>
                </div>
                
                <div className="bio-stats-group">
                    <div className="stat-unit">
                        <span className="stat-value">{stats.streak}</span>
                        <span className="stat-label">Streak</span>
                    </div>
                    <div className="stat-unit">
                        <span className="stat-value">{stats.sessions}</span>
                        <span className="stat-label">Sessions</span>
                    </div>
                </div>

                <div className="bio-actions">
                    <Link to="/edit-profile" className="edit-profile-btn-arch">EDIT PROFILE</Link>
                </div>
            </div>

            {/* Info Cards Row (Date, Mood, Verse) */}
            <div className="info-cards-row-arch">
                <div className="arch-card info-card">
                    <span className="card-label-arch">Date Joined:</span>
                    <div className="card-content-arch">
                        <span className="icon-arch">🕒</span>
                        <span className="value-arch">
                            {profile?.created_at ? 
                                `${Math.floor((new Date() - new Date(profile.created_at))/(1000*60*60*24*30))} months ago` 
                                : 'New Member'}
                        </span>
                    </div>
                </div>
                <div className="arch-card info-card text-center">
                    <span className="card-label-arch">Mood Tracker:</span>
                    <div className="card-content-arch mood-selector-arch">
                        {['😊', '😌', '🤔', '😔'].map(m => (
                            <button 
                                key={m} 
                                className={`mood-btn-arch ${selectedMood === m ? 'active' : ''}`}
                                onClick={() => handleMoodUpdate(m)}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="arch-card info-card verse-card">
                    <span className="card-label-arch">Verse of the Day:</span>
                    <div className="verse-content-arch">
                        <p className="verse-text">"{votd.text}"</p>
                        <span className="verse-ref">— {votd.reference}</span>
                    </div>
                </div>
            </div>

            {/* Big Bento Row (Schedule & Reflection) */}
            <div className="bento-row-arch">
                <div className="arch-card schedule-card-arch">
                    <div className="schedule-header">
                        <div className="date-badge-arch">
                            <span className="month">
                                {upcoming[0] ? new Date(upcoming[0].scheduled_at).toLocaleString('default', { month: 'short' }).toUpperCase() : '---'}
                            </span>
                            <span className="day">
                                {upcoming[0] ? new Date(upcoming[0].scheduled_at).getDate() : '--'}
                            </span>
                        </div>
                        <h3>Schedule</h3>
                    </div>
                    <div className="schedule-body">
                        {upcoming.length === 0 ? (
                            <p className="empty-msg-arch">No meetings.</p>
                        ) : (
                            <div className="mini-session">
                                <strong>{upcoming[0].session_label}</strong>
                                <span>{new Date(upcoming[0].scheduled_at).toLocaleDateString()}</span>
                            </div>
                        )}
                        <Link to="/booking" className="book-btn-arch">Book Meeting</Link>
                    </div>
                </div>

                <div className="arch-card reflection-card-arch">
                    <div className="reflection-header">
                        <h3>Daily Reflection</h3>
                        <span className="subtitle-arch">Reflecting on: {activeReflectionSession?.session_label || 'Deep Dive Session'}</span>
                    </div>
                    <div className="reflection-body-arch">
                        <textarea 
                            className="reflection-textarea-arch"
                            placeholder="Type your notes here..."
                            value={reflectionForm.notes}
                            onChange={(e) => setReflectionForm(prev => ({ ...prev, notes: e.target.value }))}
                        />
                        <button className="save-reflection-btn-arch" onClick={handleSaveReflection}>
                            SAVE REFLECTION
                        </button>
                    </div>
                </div>
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

    const renderNotifications = () => (
        <div className="workspace-module fade-in">
            <div className="module-header">
                <h2 className="display-title sm">Notifications</h2>
                <p className="subtitle">Stay updated with your latest alerts and activities.</p>
            </div>

            <div className="notifications-list-arch mt-5 glass-card-vibe">
                <div className="notif-item-arch p-4 active">
                    <div className="notif-icon-arch">📅</div>
                    <div className="notif-content-arch">
                        <strong>New Session Booked</strong>
                        <p>Your session with Mentor Njeri is confirmed for tomorrow at 10:00 AM.</p>
                        <span className="notif-time-arch">Just now</span>
                    </div>
                </div>
                <div className="notif-item-arch p-4">
                    <div className="notif-icon-arch">📝</div>
                    <div className="notif-content-arch">
                        <strong>Reflection Reminder</strong>
                        <p>Don't forget to record your reflections for yesterday's session.</p>
                        <span className="notif-time-arch">2 hours ago</span>
                    </div>
                </div>
                <div className="notif-item-arch p-4">
                    <div className="notif-icon-arch">🌸</div>
                    <div className="notif-content-arch">
                        <strong>Welcome to Bloom</strong>
                        <p>Explore the dashboard to start your journey.</p>
                        <span className="notif-time-arch">1 day ago</span>
                    </div>
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
                    <input 
                        type="text" 
                        placeholder="Something high-energy..." 
                        className="editor-input-main" 
                        value={blogForm.title}
                        onChange={e => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                </div>

                <div className="editor-row mb-4">
                    <div className="editor-group flex-1">
                        <label className="editor-label">Category</label>
                        <select 
                            className="editor-select"
                            value={blogForm.category}
                            onChange={e => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
                        >
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
                        value={blogForm.content}
                        onChange={e => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                    ></textarea>
                </div>

                <div className="editor-actions mt-5">
                    <button className="btn btn-vibration-outline" onClick={() => alert('Draft feature coming soon!')}>Save Draft</button>
                    <button 
                        className="btn btn-primary btn-vibration px-5"
                        onClick={handlePublishBlog}
                        disabled={publishing}
                    >
                        {publishing ? 'Publishing...' : 'Publish to Community'}
                    </button>
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
            {showBookingSuccess && (
                <div className="booking-success-toast fade-in">
                    <div className="toast-icon"></div>
                    <div className="toast-content">
                        <strong>Booking Successful!</strong>
                        <span>Your mentorship session has been scheduled.</span>
                    </div>
                </div>
            )}
            {(() => {
                switch (activeView) {
                    case 'overview':
                        return renderOverview();
                    case 'community':
                        return renderCommunity();
                    case 'assignments':
                        return renderAssignments();
                    case 'messages':
                        return renderMessages();
                    case 'notifications':
                        return renderNotifications();
                    case 'write-blog':
                        return renderBlogStudio();
                    default:
                        return renderOverview();
                }
            })()}

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
