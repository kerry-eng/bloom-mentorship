import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import VideoCallModal from '../components/VideoCallModal'
import './MentorDashboard.css'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

function isJoinable(dateStr) {
    const diff = new Date(dateStr) - new Date()
    return diff < 15 * 60000 && diff > -90 * 60000
}

function applySessionUpdate(session, updates) {
    return { ...session, ...updates }
}

function getLatestCompletedSession(sessionList) {
    const pastCompleted = sessionList.filter(session => session.status === 'completed')
    return pastCompleted.length > 0 ? pastCompleted[pastCompleted.length - 1] : null
}

export default function MentorDashboard({ activeView = 'overview', setActiveView }) {
    const { user, profile, refreshProfile } = useAuth()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState({})
    const [votd, setVotd] = useState({ text: 'As iron sharpens iron, so one person sharpens another.', reference: 'Proverbs 27:17' })
    const [selectedMood, setSelectedMood] = useState('🚀')
    const [reflectionForm, setReflectionForm] = useState({ notes: '', key_insights: '', next_steps: '' })
    const [activeReflectionSession, setActiveReflectionSession] = useState(null)
    const [saveStatus, setSaveStatus] = useState('')
    const [profileForm, setProfileForm] = useState({ full_name: '', bio: '', phone: '' })
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileSaved, setProfileSaved] = useState(false)
    const bannerInputRef = useRef(null)
    const avatarInputRef = useRef(null)
    const [uploading, setUploading] = useState({ banner: false, avatar: false })
    const [activeVideoSession, setActiveVideoSession] = useState(null)

    const isVerified = profile?.verification_status === 'verified'

    useEffect(() => {
        if (user) {
            fetchSessions()
            const verseTimer = setTimeout(() => {
                fetchVotd()
            }, 1200)

            return () => clearTimeout(verseTimer)
        }
    }, [user])

    useEffect(() => {
        if (profile) {
            setProfileForm({
                full_name: profile.full_name || '',
                bio: profile.bio || '',
                phone: profile.phone || ''
            })
        }
    }, [profile])

    async function fetchVotd() {
        try {
            const todayKey = `mentor_votd_${new Date().toISOString().slice(0, 10)}`
            const cachedVerse = sessionStorage.getItem(todayKey)

            if (cachedVerse) {
                setVotd(JSON.parse(cachedVerse))
                return
            }

            const resp = await fetch('https://labs.bible.org/api/?passage=votd&type=json')
            const data = await resp.json()
            if (data && data[0]) {
                const nextVotd = { text: data[0].text, reference: `${data[0].bookname} ${data[0].chapter}:${data[0].verse}` }
                setVotd(nextVotd)
                sessionStorage.setItem(todayKey, JSON.stringify(nextVotd))
            }
        } catch (e) { /* fallback */ }
    }

    async function fetchSessions() {
        setLoading(true)
        try {
            const { data: sessData, error } = await supabase
                .from('sessions')
                .select('id, client_id, mentor_id, scheduled_at, status, price, session_label, session_type, notes, key_insights, next_steps, profiles:client_id(full_name, email, avatar_url)')
                .eq('mentor_id', user.id)
                .order('scheduled_at', { ascending: true })
            if (error) throw error
            const nextSessions = sessData || []
            setSessions(nextSessions)

            const latest = getLatestCompletedSession(nextSessions)
            if (latest) {
                setActiveReflectionSession(latest)
                setReflectionForm({
                    notes: latest.notes || '',
                    key_insights: latest.key_insights || '',
                    next_steps: latest.next_steps || ''
                })
            }
        } catch (e) {
            console.error('Error fetching sessions:', e)
        } finally {
            setLoading(false)
        }
    }

    async function confirmBooking(sessionId) {
        setSaving(s => ({ ...s, [sessionId]: 'confirming' }))
        try {
            await supabase.from('sessions').update({ status: 'active' }).eq('id', sessionId)
            setSessions(currentSessions => currentSessions.map(session => (
                session.id === sessionId ? applySessionUpdate(session, { status: 'active' }) : session
            )))
        } catch (e) { console.error(e) }
        finally { setSaving(s => ({ ...s, [sessionId]: false })) }
    }

    async function markCompleted(sessionId) {
        setSaving(s => ({ ...s, [sessionId]: 'completing' }))
        try {
            await supabase.from('sessions').update({ status: 'completed' }).eq('id', sessionId)
            setSessions(currentSessions => {
                const nextSessions = currentSessions.map(session => (
                    session.id === sessionId ? applySessionUpdate(session, { status: 'completed' }) : session
                ))
                const latest = getLatestCompletedSession(nextSessions)
                if (latest) {
                    setActiveReflectionSession(latest)
                    setReflectionForm({
                        notes: latest.notes || '',
                        key_insights: latest.key_insights || '',
                        next_steps: latest.next_steps || ''
                    })
                }
                return nextSessions
            })
        } catch (e) { console.error(e) }
        finally { setSaving(s => ({ ...s, [sessionId]: false })) }
    }

    async function handleSaveReflection() {
        if (!activeReflectionSession) return
        setSaveStatus('saving')
        try {
            const { error } = await supabase.from('sessions').update({ ...reflectionForm }).eq('id', activeReflectionSession.id)
            if (error) throw error
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus(''), 2000)
        } catch (e) { setSaveStatus('error') }
    }

    async function handleMediaUpload(event, type) {
        const file = event.target.files[0]
        if (!file) return
        setUploading(prev => ({ ...prev, [type]: true }))
        try {
            const base64data = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.onerror = e => reject(e)
                reader.readAsDataURL(file)
            })
            const { error } = await supabase.from('profiles').update({ [`${type}_url`]: base64data }).eq('id', user.id)
            if (error) throw error
            
            if (refreshProfile) await refreshProfile(user.id)
            
            setSaveStatus('Media updated')
            setTimeout(() => setSaveStatus(''), 2000)
        } catch (err) {
            console.error(`Upload error for ${type}:`, err)
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }))
            if (event.target) event.target.value = ''
        }
    }

    async function handleProfileSave() {
        setProfileSaving(true)
        try {
            const { error } = await supabase.from('profiles').update({
                full_name: profileForm.full_name,
                bio: profileForm.bio,
                phone: profileForm.phone,
            }).eq('id', user.id)
            if (error) throw error
            await refreshProfile(user.id)
            setProfileSaved(true)
            setTimeout(() => setProfileSaved(false), 2500)
        } catch (e) {
            console.error('Profile save error:', e)
        } finally {
            setProfileSaving(false)
        }
    }

    // --- SESSION FILTERING ---
    const upcoming = sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled')
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    
    const past = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled')
        .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))

    const pendingNew = sessions.filter(s => s.status === 'paid' || s.status === 'pending')
    const completedSessions = sessions.filter(s => s.status === 'completed')
    const totalRevenue = completedSessions.reduce((acc, s) => acc + (s.price || 0), 0)
    const firstName = profile?.full_name?.split(' ')[0] || 'Mentor'
    const memberSince = profile?.created_at
        ? `${Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24 * 30))} months mentoring`
        : 'New mentor'
    const nextSession = upcoming[0]
    const summaryCards = [
        { label: 'Active sessions', value: upcoming.length },
        { label: 'Revenue', value: `KES ${totalRevenue.toLocaleString()}` },
        { label: 'Pending bookings', value: pendingNew.length },
    ]

    const handleRefresh = () => {
        fetchSessions()
        fetchVotd()
    }

    // ---------- VIEWS ----------

    const renderOverview = () => (
        <div className="overview-container-arch fade-in">
            {pendingNew.length > 0 && (
                <div className="booking-alert-banner">
                    <span className="alert-icon">📬</span>
                    <div>
                        <strong>{pendingNew.length} New Booking{pendingNew.length > 1 ? 's' : ''} Awaiting Confirmation</strong>
                        <p>A mentee has paid and is waiting for your confirmation.</p>
                    </div>
                    <button className="btn-mentor-alert" onClick={() => setActiveView('schedule')}>Open schedule</button>
                </div>
            )}

            <section className="mentor-overview-hero">
                <div className="mentor-overview-media">
                    <div className="hero-banner-arch" onClick={() => bannerInputRef.current?.click()}>
                        <img src={profile?.banner_url || "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80"} alt="Banner" className="arch-banner-img" />
                        <div className="mentor-overview-badges">
                            <span className={`mentor-status-pill ${isVerified ? 'verified' : 'pending'}`}>
                                {isVerified ? 'Verified mentor' : 'Review pending'}
                            </span>
                            <span className="mentor-status-pill subtle">{memberSince}</span>
                            <span className="mentor-status-pill subtle">{upcoming.length} active sessions</span>
                        </div>
                        {uploading.banner && <div className="upload-overlay-arch">Uploading...</div>}
                    </div>
                    <div className="profile-overlay-circle" onClick={() => avatarInputRef.current?.click()}>
                        <img src={profile?.avatar_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80"} alt="Avatar" className="arch-avatar-img" />
                        <div className="avatar-edit-hint"><span>CHANGE</span></div>
                        {uploading.avatar && <div className="upload-overlay-arch">...</div>}
                    </div>
                </div>
                <input type="file" ref={bannerInputRef} onChange={e => handleMediaUpload(e, 'banner')} style={{ display: 'none' }} accept="image/*" />
                <input type="file" ref={avatarInputRef} onChange={e => handleMediaUpload(e, 'avatar')} style={{ display: 'none' }} accept="image/*" />

                <div className="mentor-overview-copy">
                    <span className="mentor-overview-kicker">Mentor profile hub</span>
                    <h2>{profile?.full_name || 'Mentor profile'}</h2>
                    <p>{profile?.bio || 'Shape your public profile, manage live sessions, and keep your mentoring rhythm visible at a glance.'}</p>

                    {!isVerified && (
                        <div className="verification-notice-arch">
                            <span>🕒 Your mentor profile is still under review. You can keep refining your profile while you wait.</span>
                        </div>
                    )}

                    <div className="mentor-overview-actions">
                        <button type="button" className="mentor-shell-action primary" onClick={() => setActiveView('settings')}>
                            Edit profile
                        </button>
                        <button type="button" className="mentor-shell-action" onClick={() => setActiveView('schedule')}>
                            View schedule
                        </button>
                        <button
                            type="button"
                            className="mentor-shell-action ghost"
                            onClick={() => setActiveVideoSession({ profiles: { full_name: 'Mentee Demo' }, session_label: 'Instant Meeting' })}
                        >
                            Instant meeting
                        </button>
                    </div>

                    <div className="mentor-overview-meta">
                        <div className="mentor-overview-meta-card">
                            <span>Member since</span>
                            <strong>{memberSince}</strong>
                        </div>
                        <div className="mentor-overview-meta-card">
                            <span>Contact</span>
                            <strong>{profile?.phone || 'Add phone number'}</strong>
                        </div>
                        <div className="mentor-overview-meta-card">
                            <span>Revenue</span>
                            <strong>KES {totalRevenue.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mentor-overview-grid">
                <article className="arch-card overview-feature-card overview-feature-card--next">
                    <div className="overview-feature-header">
                        <div>
                            <span className="overview-feature-kicker">Next session</span>
                            <h3>{nextSession ? nextSession.session_label || nextSession.session_type : 'No upcoming session'}</h3>
                        </div>
                        <span className="overview-feature-tag">{nextSession ? nextSession.status.toUpperCase() : 'CLEAR'}</span>
                    </div>
                    {loading ? <p className="empty-msg-arch">Loading...</p> : nextSession ? (
                        <div className="overview-next-session">
                            <div className="overview-next-session__row">
                                <span>Mentee</span>
                                <strong>{nextSession.profiles?.full_name || 'Mentee'}</strong>
                            </div>
                            <div className="overview-next-session__row">
                                <span>When</span>
                                <strong>{new Date(nextSession.scheduled_at).toLocaleString()}</strong>
                            </div>
                            <div className="overview-next-session__row">
                                <span>Value</span>
                                <strong>KES {(nextSession.price || 0).toLocaleString()}</strong>
                            </div>
                            <button className="book-btn-arch" onClick={() => setActiveView('schedule')}>Manage session</button>
                        </div>
                    ) : (
                        <div className="overview-empty-state">
                            <p>No active session is lined up yet.</p>
                            <button className="book-btn-arch" onClick={() => setActiveView('schedule')}>Open schedule</button>
                        </div>
                    )}
                </article>

                <article className="arch-card overview-feature-card overview-feature-card--notes">
                    <div className="overview-feature-header">
                        <div>
                            <span className="overview-feature-kicker">Session notes</span>
                            <h3>{activeReflectionSession?.profiles?.full_name || 'Reflection space'}</h3>
                        </div>
                        <span className="overview-feature-tag subtle">Private</span>
                    </div>
                    <div className="reflection-body-arch">
                        <textarea
                            className="reflection-textarea-arch"
                            placeholder="Capture the strongest takeaway from your latest session."
                            value={reflectionForm.notes}
                            onChange={e => setReflectionForm(prev => ({ ...prev, notes: e.target.value }))}
                        />
                        <button className="save-reflection-btn-arch" onClick={handleSaveReflection}>
                            {saveStatus === 'saving' ? 'SAVING...' : saveStatus === 'saved' ? 'SAVED ✓' : 'SAVE NOTES'}
                        </button>
                    </div>
                </article>

                <article className="arch-card overview-feature-card">
                    <div className="overview-feature-header">
                        <div>
                            <span className="overview-feature-kicker">Daily pulse</span>
                            <h3>Your energy</h3>
                        </div>
                        <span className="overview-feature-tag subtle">{selectedMood}</span>
                    </div>
                    <div className="card-content-arch mood-selector-arch mood-selector-arch--expanded">
                        {['🔋', '🧘', '🚀', '☕'].map(m => (
                            <button key={m} className={`mood-btn-arch ${selectedMood === m ? 'active' : ''}`} onClick={() => setSelectedMood(m)}>{m}</button>
                        ))}
                    </div>
                    <div className="overview-mini-stats">
                        <div>
                            <span>Pending</span>
                            <strong>{pendingNew.length}</strong>
                        </div>
                        <div>
                            <span>Completed</span>
                            <strong>{completedSessions.length}</strong>
                        </div>
                    </div>
                </article>

                <article className="arch-card overview-feature-card overview-feature-card--wisdom">
                    <div className="overview-feature-header">
                        <div>
                            <span className="overview-feature-kicker">Wisdom of the day</span>
                            <h3>Daily grounding</h3>
                        </div>
                    </div>
                    <div className="verse-content-arch">
                        <p className="verse-text">"{votd.text}"</p>
                        <span className="verse-ref">— {votd.reference}</span>
                    </div>
                </article>
            </section>
        </div>
    )

    const renderSchedule = () => (
        <div className="workspace-module fade-in" style={{ padding: '1.5rem 4rem 3rem' }}>
            <div className="module-header-mentor">
                <div>
                    <span className="module-kicker">Session desk</span>
                    <h2>My Schedule</h2>
                    <p className="subtitle-arch">Everything upcoming, active, or already wrapped.</p>
                </div>
                {pendingNew.length > 0 && (
                    <div className="pending-badge-large">
                        {pendingNew.length} Awaiting Confirmation
                    </div>
                )}
            </div>

            <h3 className="section-heading">Upcoming & Active</h3>
            <div className="sessions-list-mentor">
                {loading ? <p className="empty-msg-arch">Loading sessions...</p>
                    : upcoming.length === 0 ? <div className="empty-state-mentor"><span>📅</span><p>No active sessions.</p></div>
                    : upcoming.map(s => {
                        const isPastDue = new Date(s.scheduled_at) < new Date()
                        return (
                            <div key={s.id} className={`session-card-mentor ${s.status} ${isPastDue ? 'past-due' : ''}`}>
                                <div className="session-card-left">
                                    <div className="mentee-avatar-sm">
                                        {s.profiles?.avatar_url
                                            ? <img src={s.profiles.avatar_url} alt="" />
                                            : <span>{s.profiles?.full_name?.[0] || 'M'}</span>}
                                    </div>
                                    <div className="session-card-info">
                                        <div className="card-title-row">
                                            <h4>{s.profiles?.full_name || 'Mentee'}</h4>
                                            {isPastDue && <span className="past-due-badge">HELD?</span>}
                                        </div>
                                        <p>{s.session_label || s.session_type}</p>
                                        <p className="session-time-arch">
                                            📅 {new Date(s.scheduled_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {new Date(s.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="session-card-right">
                                    <span className="price-tag-mentor">KES {(s.price || 0).toLocaleString()}</span>
                                    <span className={`status-badge ${s.status}`}>{s.status.toUpperCase()}</span>
                                    <div className="session-btns">
                                        {s.status === 'paid' && (
                                            <button className="btn-mentor btn-mentor-primary" onClick={() => confirmBooking(s.id)} disabled={!!saving[s.id]}>
                                                {saving[s.id] ? '...' : '✓ CONFIRM'}
                                            </button>
                                        )}
                                        {s.status === 'active' && isJoinable(s.scheduled_at) && (
                                            <button className="btn-mentor btn-mentor-primary" onClick={() => setActiveVideoSession(s)}>
                                                🎥 JOIN NOW
                                            </button>
                                        )}
                                        {s.status === 'active' && !isJoinable(s.scheduled_at) && (
                                            <button className="btn-mentor btn-mentor-outline" onClick={() => markCompleted(s.id)} disabled={!!saving[s.id]}>
                                                {saving[s.id] ? '...' : 'Mark Completed'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
            </div>

            <h3 className="section-heading" style={{ marginTop: '3rem' }}>History</h3>
            <div className="sessions-list-mentor">
                {past.length === 0
                    ? <div className="empty-state-mentor"><span>✅</span><p>No past sessions yet.</p></div>
                    : past.map(s => (
                        <div key={s.id} className={`session-card-mentor ${s.status}`}>
                            <div className="session-card-left">
                                <div className="mentee-avatar-sm">
                                    {s.profiles?.avatar_url
                                        ? <img src={s.profiles.avatar_url} alt="" />
                                        : <span>{s.profiles?.full_name?.[0] || 'M'}</span>}
                                </div>
                                <div className="session-card-info">
                                    <h4>{s.profiles?.full_name || 'Mentee'}</h4>
                                    <p>{s.session_label || s.session_type}</p>
                                    <p className="session-time-arch">
                                        {new Date(s.scheduled_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="session-card-right">
                                <span className="price-tag-mentor">KES {(s.price || 0).toLocaleString()}</span>
                                <span className={`status-badge ${s.status}`}>{s.status.toUpperCase()}</span>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )

    const renderEarnings = () => {
        const monthlyRevenue = {}
        sessions.forEach(s => {
            if (!s.price || s.status !== 'completed') return
            const month = new Date(s.scheduled_at).toLocaleString('default', { month: 'short', year: 'numeric' })
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + s.price
        })
        const maxRevenue = Math.max(...Object.values(monthlyRevenue), 1)

        return (
            <div className="workspace-module fade-in" style={{ padding: '1.5rem 4rem 3rem' }}>
                <div className="module-header-mentor">
                    <div>
                        <span className="module-kicker">Revenue desk</span>
                        <h2>My Earnings</h2>
                        <p className="subtitle-arch">Revenue from your completed sessions.</p>
                    </div>
                </div>

                <div className="earnings-stats-row">
                    <div className="earnings-stat-card accent">
                        <span className="earnings-stat-icon">💰</span>
                        <div>
                            <span className="earnings-stat-value">KES {totalRevenue.toLocaleString()}</span>
                            <span className="earnings-stat-label">Total Revenue</span>
                        </div>
                    </div>
                    <div className="earnings-stat-card">
                        <span className="earnings-stat-icon">✅</span>
                        <div>
                            <span className="earnings-stat-value">{completedSessions.length}</span>
                            <span className="earnings-stat-label">Completed Sessions</span>
                        </div>
                    </div>
                    <div className="earnings-stat-card">
                        <span className="earnings-stat-icon">📅</span>
                        <div>
                            <span className="earnings-stat-value">{upcoming.length}</span>
                            <span className="earnings-stat-label">Active Bookings</span>
                        </div>
                    </div>
                </div>

                {Object.keys(monthlyRevenue).length > 0 && (
                    <div className="arch-card" style={{ marginBottom: '2rem' }}>
                        <span className="card-label-arch">Monthly Revenue Breakdown</span>
                        <div className="revenue-chart">
                            {Object.entries(monthlyRevenue).map(([month, amount]) => (
                                <div key={month} className="revenue-bar-col">
                                    <div className="revenue-bar-wrap">
                                        <div className="revenue-bar" style={{ height: `${(amount / maxRevenue) * 100}%` }}>
                                            <span className="revenue-bar-tooltip">KES {amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <span className="revenue-bar-label">{month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="arch-card">
                    <span className="card-label-arch">Session Ledger</span>
                    <div className="table-scroll-arch">
                        <table className="earnings-table">
                            <thead>
                                <tr>
                                    <th>Mentee</th>
                                    <th>Session</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>No sessions found.</td></tr>
                                ) : [...sessions].sort((a,b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)).map(s => (
                                    <tr key={s.id}>
                                        <td>{s.profiles?.full_name || 'Mentee'}</td>
                                        <td>{s.session_label || s.session_type}</td>
                                        <td>{new Date(s.scheduled_at).toLocaleDateString()}</td>
                                        <td><span className={`status-badge ${s.status}`}>{s.status.toUpperCase()}</span></td>
                                        <td className="amount-cell">KES {(s.price || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} className="total-label">Projected Total</td>
                                    <td className="amount-cell total-value">KES {sessions.reduce((acc, s) => acc + (s.price || 0), 0).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    const renderSettings = () => (
        <div className="workspace-module fade-in" style={{ padding: '1.5rem 4rem 3rem' }}>
            <div className="module-header-mentor">
                <div>
                    <span className="module-kicker">Profile studio</span>
                    <h2>Profile Settings</h2>
                    <p className="subtitle-arch">Update your public mentor profile.</p>
                </div>
            </div>

            <div className="settings-grid">
                <div className="arch-card settings-media-card">
                    <span className="card-label-arch">Profile Photos</span>
                    <div className="settings-avatar-preview">
                        <img src={profile?.avatar_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80"} alt="avatar" className="settings-avatar-img" />
                        <div className="settings-avatar-actions">
                            <button className="btn-mentor btn-mentor-outline" onClick={() => avatarInputRef.current?.click()}>
                                {uploading.avatar ? 'Uploading...' : '📷 Change Avatar'}
                            </button>
                            <button className="btn-mentor btn-mentor-outline" onClick={() => bannerInputRef.current?.click()}>
                                {uploading.banner ? 'Uploading...' : '🖼 Change Banner'}
                            </button>
                        </div>
                    </div>
                    <input type="file" ref={bannerInputRef} onChange={e => handleMediaUpload(e, 'banner')} style={{ display: 'none' }} accept="image/*" />
                    <input type="file" ref={avatarInputRef} onChange={e => handleMediaUpload(e, 'avatar')} style={{ display: 'none' }} accept="image/*" />
                </div>

                <div className="arch-card settings-form-card">
                    <span className="card-label-arch">Account Details</span>
                    <div className="settings-form">
                        <div className="settings-field">
                            <label>Full Name</label>
                            <input type="text" className="settings-input" value={profileForm.full_name} onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" />
                        </div>
                        <div className="settings-field">
                            <label>Email Address</label>
                            <input type="text" className="settings-input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                        </div>
                        <div className="settings-field">
                            <label>Phone</label>
                            <input type="tel" className="settings-input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+254 700 000 000" />
                        </div>
                        <div className="settings-field">
                            <label>Bio / About Me</label>
                            <textarea className="settings-textarea" rows={4} value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell mentees about your expertise and approach..." />
                        </div>
                        <button className="save-reflection-btn-arch" style={{ alignSelf: 'flex-start' }} onClick={handleProfileSave} disabled={profileSaving}>
                            {profileSaving ? 'SAVING...' : profileSaved ? 'SAVED ✓' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderView = () => {
        switch (activeView) {
            case 'schedule': return renderSchedule()
            case 'earnings': return renderEarnings()
            case 'settings': return renderSettings()
            case 'overview':
            default: return renderOverview()
        }
    }

    return (
        <div className="mentor-dashboard-page-arch">
            <header className="mentor-shell-header">
                <div className="mentor-shell-copy">
                    <span className="section-label">Mentor portal</span>
                    <h1>{getGreeting()}, {firstName}</h1>
                    <p>Run sessions, revenue, and profile updates from one composed workspace that feels like your practice, not a spreadsheet.</p>
                    <div className="mentor-shell-highlights">
                        <span className={`mentor-shell-highlight ${isVerified ? 'verified' : 'pending'}`}>
                            {isVerified ? 'Verified mentor' : 'Review pending'}
                        </span>
                        <span className="mentor-shell-highlight">KES {totalRevenue.toLocaleString()} earned</span>
                    </div>
                </div>

                <div className="mentor-shell-panel">
                    <div className="mentor-shell-profile">
                        <img
                            src={profile?.avatar_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80"}
                            alt="Mentor avatar"
                            className="mentor-shell-profile__avatar"
                        />
                        <div>
                            <span className="mentor-shell-profile__label">Dashboard owner</span>
                            <strong>{profile?.full_name || 'Mentor profile'}</strong>
                            <p>{memberSince}</p>
                        </div>
                    </div>

                    <div className="mentor-shell-stats">
                        {summaryCards.map(card => (
                            <div key={card.label} className="mentor-shell-stat">
                                <span>{card.label}</span>
                                <strong>{card.value}</strong>
                            </div>
                        ))}
                    </div>

                    <div className="mentor-shell-actions">
                        <button type="button" className="mentor-shell-action primary" onClick={() => setActiveVideoSession({ profiles: { full_name: 'Mentee Demo' }, session_label: 'Instant Meeting' })}>
                            Instant meeting
                        </button>
                        <button type="button" className="mentor-shell-action" onClick={() => setActiveView('schedule')}>
                            Open schedule
                        </button>
                        <button type="button" className="mentor-shell-action ghost" onClick={handleRefresh}>
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main-mentor dashboard-main-mentor--modern" style={{ borderTop: 'none' }}>
                {renderView()}
            </main>

            {activeVideoSession && (
                <VideoCallModal 
                    session={activeVideoSession} 
                    onClose={() => setActiveVideoSession(null)} 
                />
            )}
        </div>
    )
}
