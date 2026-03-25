import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import './AdminDashboard.css'

function formatCurrency(amount) {
    return `KES ${Number(amount || 0).toLocaleString()}`
}

function formatDateTime(value) {
    if (!value) return 'Not scheduled'

    return new Date(value).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function getSessionName(session) {
    return session.session_label || session.session_type || 'Mentorship session'
}

export default function AdminDashboard() {
    const { profile, isSuperAdmin } = useAuth()
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [mentors, setMentors] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState({})
    const [lastSyncedAt, setLastSyncedAt] = useState(null)

    useEffect(() => {
        if (!isSuperAdmin) {
            navigate('/')
            return
        }

        fetchAllSessions()
        fetchAllMentors()
    }, [isSuperAdmin, navigate])

    async function fetchAllMentors() {
        const { data } = await supabase.from('profiles').select('id, full_name, role').eq('role', 'mentor')
        setMentors(data || [])
    }

    async function fetchAllSessions() {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*, profiles:client_id(full_name, email), mentor:mentor_id(full_name)')
                .order('scheduled_at', { ascending: true })

            if (error) throw error

            setSessions(data || [])
            setLastSyncedAt(new Date())
        } catch (error) {
            console.error('Error fetching all sessions:', error)
        } finally {
            setLoading(false)
        }
    }

    async function assignMentor(sessionId, mentorId) {
        setSaving(current => ({ ...current, [sessionId]: true }))

        try {
            await supabase
                .from('sessions')
                .update({ mentor_id: mentorId === '' ? null : mentorId })
                .eq('id', sessionId)

            await fetchAllSessions()
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(current => ({ ...current, [sessionId]: false }))
        }
    }

    function handleRefresh() {
        setLoading(true)
        fetchAllSessions()
        fetchAllMentors()
    }

    const now = new Date()
    const upcoming = sessions.filter(session => new Date(session.scheduled_at) >= now && session.status !== 'completed')
    const past = sessions.filter(session => new Date(session.scheduled_at) < now || session.status === 'completed')
    const unassignedUpcoming = upcoming.filter(session => !session.mentor_id)
    const nextSession = upcoming[0] || null
    const recentCompleted = [...past]
        .sort((left, right) => new Date(right.scheduled_at || 0) - new Date(left.scheduled_at || 0))
        .slice(0, 4)

    const assignmentCoverage = upcoming.length
        ? Math.round(((upcoming.length - unassignedUpcoming.length) / upcoming.length) * 100)
        : 100

    const stats = {
        pending: upcoming.length,
        revenue: sessions.reduce((total, session) => total + (session.price || 0), 0),
        activeMentors: mentors.length,
        completed: past.length,
        unassigned: unassignedUpcoming.length,
        coverage: assignmentCoverage
    }

    const systemStatus = stats.unassigned > 0 ? 'Attention needed' : 'Healthy'
    const systemStatusTone = stats.unassigned > 0 ? 'attention' : 'healthy'

    return (
        <div className="admin-dashboard-page">
            <section className="admin-hero">
                <div className="admin-hero__copy">
                    <span className="admin-kicker">Super admin</span>
                    <h1>Platform command center</h1>
                    <p>
                        Review live assignments, keep mentor coverage balanced, and track
                        platform delivery from one cleaner control surface.
                    </p>

                    <div className="admin-hero__chips">
                        <span>{stats.activeMentors} mentors active</span>
                        <span>{stats.pending} sessions in queue</span>
                        <span>{stats.coverage}% assignment coverage</span>
                    </div>
                </div>

                <div className="admin-hero__panel">
                    <div className="admin-hero__meta">
                        <div className="admin-meta-card">
                            <span>Outstanding queue</span>
                            <strong>{stats.pending}</strong>
                        </div>
                        <div className="admin-meta-card">
                            <span>Last sync</span>
                            <strong>
                                {lastSyncedAt
                                    ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : 'Pending'}
                            </strong>
                        </div>
                        <div className={`admin-meta-card admin-meta-card--${systemStatusTone}`}>
                            <span>System status</span>
                            <strong>{systemStatus}</strong>
                        </div>
                    </div>

                    <div className="admin-hero__actions">
                        <button type="button" className="admin-button admin-button--primary" onClick={handleRefresh}>
                            Refresh platform data
                        </button>
                        <button
                            type="button"
                            className="admin-button admin-button--secondary"
                            onClick={() => navigate('/mentors')}
                        >
                            Open mentors directory
                        </button>
                    </div>
                </div>
            </section>

            <section className="admin-stats-grid">
                <article className="admin-stat-card">
                    <span className="admin-stat-card__label">Outstanding sessions</span>
                    <strong className="admin-stat-card__value">{stats.pending}</strong>
                    <p>Sessions still awaiting delivery or follow-through.</p>
                </article>

                <article className="admin-stat-card">
                    <span className="admin-stat-card__label">Unassigned sessions</span>
                    <strong className="admin-stat-card__value">{stats.unassigned}</strong>
                    <p>Bookings that still need a mentor owner.</p>
                </article>

                <article className="admin-stat-card">
                    <span className="admin-stat-card__label">Platform revenue</span>
                    <strong className="admin-stat-card__value">{formatCurrency(stats.revenue)}</strong>
                    <p>Total session value currently tracked in the platform.</p>
                </article>

                <article className="admin-stat-card">
                    <span className="admin-stat-card__label">Completed sessions</span>
                    <strong className="admin-stat-card__value">{stats.completed}</strong>
                    <p>Closed sessions recorded across the current dataset.</p>
                </article>
            </section>

            <section className="admin-layout-grid">
                <div className="admin-layout-grid__main">
                    <article className="admin-panel">
                        <div className="admin-panel__header">
                            <div>
                                <span className="admin-panel__eyebrow">Assignments</span>
                                <h2>Live schedule and mentor coverage</h2>
                            </div>
                            <p>Reassign upcoming sessions without leaving the dashboard.</p>
                        </div>

                        <div className="admin-session-list">
                            {loading ? (
                                <div className="admin-empty-state">
                                    <h3>Loading platform sessions</h3>
                                    <p>Pulling the latest assignments and availability snapshot.</p>
                                </div>
                            ) : upcoming.length === 0 ? (
                                <div className="admin-empty-state">
                                    <h3>No upcoming sessions</h3>
                                    <p>There are no future bookings waiting in the platform right now.</p>
                                </div>
                            ) : (
                                upcoming.map(session => (
                                    <article key={session.id} className="admin-session-card">
                                        <div className="admin-session-card__main">
                                            <div className="admin-session-card__topline">
                                                <h3>{session.profiles?.full_name || 'Client'}</h3>
                                                <span className={`admin-status-badge admin-status-badge--${session.status || 'pending'}`}>
                                                    {session.status || 'pending'}
                                                </span>
                                            </div>

                                            <p className="admin-session-card__title">{getSessionName(session)}</p>

                                            <dl className="admin-session-card__details">
                                                <div>
                                                    <dt>Scheduled</dt>
                                                    <dd>{formatDateTime(session.scheduled_at)}</dd>
                                                </div>
                                                <div>
                                                    <dt>Current mentor</dt>
                                                    <dd>{session.mentor?.full_name || 'Unassigned'}</dd>
                                                </div>
                                                <div>
                                                    <dt>Client email</dt>
                                                    <dd>{session.profiles?.email || 'Not available'}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="admin-session-card__assign">
                                            <label htmlFor={`session-${session.id}`}>Assign mentor</label>
                                            <select
                                                id={`session-${session.id}`}
                                                value={session.mentor_id || ''}
                                                onChange={event => assignMentor(session.id, event.target.value)}
                                                disabled={saving[session.id]}
                                                className="admin-select"
                                            >
                                                <option value="">Unassigned</option>
                                                {mentors.map(mentor => (
                                                    <option key={mentor.id} value={mentor.id}>
                                                        {mentor.full_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="admin-session-card__hint">
                                                {saving[session.id] ? 'Saving assignment...' : 'Changes save immediately.'}
                                            </span>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </article>
                </div>

                <aside className="admin-layout-grid__side">
                    <article className="admin-panel admin-panel--compact">
                        <div className="admin-panel__header admin-panel__header--stack">
                            <div>
                                <span className="admin-panel__eyebrow">Platform pulse</span>
                                <h2>Operational summary</h2>
                            </div>
                        </div>

                        <div className="admin-pulse-list">
                            <div className="admin-pulse-item">
                                <span>Next session</span>
                                <strong>{nextSession ? formatDateTime(nextSession.scheduled_at) : 'No session queued'}</strong>
                                <p>{nextSession ? `${nextSession.profiles?.full_name || 'Client'} - ${getSessionName(nextSession)}` : 'Nothing scheduled yet.'}</p>
                            </div>

                            <div className="admin-pulse-item">
                                <span>Mentor coverage</span>
                                <strong>{stats.coverage}% covered</strong>
                                <p>{stats.unassigned} session(s) still need assignment.</p>
                            </div>

                            <div className="admin-pulse-item">
                                <span>Directory strength</span>
                                <strong>{stats.activeMentors} mentors available</strong>
                                <p>Use the mentors directory to review capacity and profiles.</p>
                            </div>
                        </div>
                    </article>

                    <article className="admin-panel admin-panel--compact">
                        <div className="admin-panel__header admin-panel__header--stack">
                            <div>
                                <span className="admin-panel__eyebrow">Recent completions</span>
                                <h2>Latest closed sessions</h2>
                            </div>
                        </div>

                        <div className="admin-activity-list">
                            {recentCompleted.length === 0 ? (
                                <div className="admin-empty-state admin-empty-state--small">
                                    <h3>No completed sessions yet</h3>
                                    <p>Completed work will appear here once sessions are closed.</p>
                                </div>
                            ) : (
                                recentCompleted.map(session => (
                                    <div key={session.id} className="admin-activity-item">
                                        <strong>{session.profiles?.full_name || 'Client'}</strong>
                                        <span>{getSessionName(session)}</span>
                                        <time>{formatDateTime(session.scheduled_at)}</time>
                                    </div>
                                ))
                            )}
                        </div>
                    </article>

                    <article className="admin-panel admin-panel--compact">
                        <div className="admin-panel__header admin-panel__header--stack">
                            <div>
                                <span className="admin-panel__eyebrow">Quick actions</span>
                                <h2>Admin shortcuts</h2>
                            </div>
                        </div>

                        <div className="admin-actions-stack">
                            <button type="button" className="admin-button admin-button--secondary" onClick={() => navigate('/mentors')}>
                                Manage mentors directory
                            </button>
                            <button type="button" className="admin-button admin-button--ghost" onClick={handleRefresh}>
                                Run manual refresh
                            </button>
                        </div>
                    </article>
                </aside>
            </section>

            <footer className="admin-footer-note">
                <span>Signed in as</span>
                <strong>{profile?.full_name || 'Admin user'}</strong>
            </footer>
        </div>
    )
}
