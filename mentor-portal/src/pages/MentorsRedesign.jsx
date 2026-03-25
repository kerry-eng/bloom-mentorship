import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import './MentorsRedesign.css'

function formatStatus(mentor) {
    if (mentor.is_flagged) return 'Flagged'
    if (mentor.verification_status === 'verified') return 'Verified'
    return 'Pending'
}

function getExpertiseList(expertise) {
    if (Array.isArray(expertise)) return expertise.filter(Boolean)
    if (typeof expertise === 'string') return expertise.split(',').map(item => item.trim()).filter(Boolean)
    return []
}

function getInitials(name, email) {
    const source = name || email || 'M'
    return source.charAt(0).toUpperCase()
}

export default function MentorsRedesign() {
    const { isSuperAdmin } = useAuth()
    const [mentors, setMentors] = useState([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [newMentor, setNewMentor] = useState({ email: '' })
    const [editForm, setEditForm] = useState({ full_name: '', bio: '', expertise: '' })
    const [activeTab, setActiveTab] = useState('verified')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (isSuperAdmin) {
            fetchMentors()
        }
    }, [isSuperAdmin])

    async function fetchMentors() {
        setLoading(true)

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'mentor')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase query error:', error)
        } else {
            setMentors(data || [])
        }

        setLoading(false)
    }

    async function handleAddMentor(event) {
        event.preventDefault()
        setAdding(true)

        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', newMentor.email)
            .single()

        if (!existingUser) {
            alert('Error: No user found with this email. They must sign up on Bloom first.')
            setAdding(false)
            return
        }

        const { error } = await supabase
            .from('profiles')
            .update({ role: 'mentor', verification_status: 'pending' })
            .eq('id', existingUser.id)

        if (error) {
            alert(`Error: ${error.message}`)
        } else {
            alert('Mentor added with pending status.')
            await fetchMentors()
            setNewMentor({ email: '' })
            setActiveTab('pending')
        }

        setAdding(false)
    }

    async function verifyMentor(mentorId) {
        const { error } = await supabase
            .from('profiles')
            .update({ verification_status: 'verified' })
            .eq('id', mentorId)

        if (!error) {
            fetchMentors()
        }
    }

    async function toggleFlagMentor(mentorId, currentFlag) {
        const { error } = await supabase
            .from('profiles')
            .update({ is_flagged: !currentFlag })
            .eq('id', mentorId)

        if (!error) {
            fetchMentors()
        }
    }

    async function revokeMentorAccess(mentorId) {
        if (!window.confirm('Revoke mentor access and demote this account back to client?')) return

        const { error } = await supabase
            .from('profiles')
            .update({ role: 'client', verification_status: 'none', is_flagged: false })
            .eq('id', mentorId)

        if (!error) {
            fetchMentors()
        }
    }

    async function handleUpdateMentor(event) {
        event.preventDefault()

        const expertiseArray = editForm.expertise
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: editForm.full_name,
                bio: editForm.bio,
                expertise: expertiseArray
            })
            .eq('id', editingId)

        if (!error) {
            setEditingId(null)
            fetchMentors()
        }
    }

    function startEditing(mentor) {
        setEditingId(mentor.id)
        setEditForm({
            full_name: mentor.full_name || '',
            bio: mentor.bio || '',
            expertise: getExpertiseList(mentor.expertise).join(', ')
        })
    }

    const verifiedMentors = useMemo(
        () => mentors.filter(mentor => mentor.verification_status === 'verified' && !mentor.is_flagged),
        [mentors]
    )
    const pendingMentors = useMemo(
        () => mentors.filter(mentor => mentor.verification_status !== 'verified' && !mentor.is_flagged),
        [mentors]
    )
    const flaggedMentors = useMemo(
        () => mentors.filter(mentor => mentor.is_flagged),
        [mentors]
    )

    const mentorsToDisplay = useMemo(() => {
        const baseList =
            activeTab === 'verified'
                ? verifiedMentors
                : activeTab === 'pending'
                    ? pendingMentors
                    : flaggedMentors

        const query = searchQuery.trim().toLowerCase()
        if (!query) return baseList

        return baseList.filter(mentor => {
            const haystack = [
                mentor.full_name,
                mentor.email,
                mentor.bio,
                ...getExpertiseList(mentor.expertise)
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return haystack.includes(query)
        })
    }, [activeTab, verifiedMentors, pendingMentors, flaggedMentors, searchQuery])

    const stats = {
        total: mentors.length,
        verified: verifiedMentors.length,
        pending: pendingMentors.length,
        flagged: flaggedMentors.length
    }

    if (!isSuperAdmin) {
        return (
            <div className="mentors-directory-page">
                <div className="mentors-access-card">
                    <span className="mentors-kicker">Restricted</span>
                    <h1>403 Forbidden</h1>
                    <p>This area is only available to super admins.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mentors-directory-page">
            <section className="mentors-hero">
                <div className="mentors-hero__copy">
                    <span className="mentors-kicker">Directory control</span>
                    <h1>Mentor verification and onboarding</h1>
                    <p>
                        Approve mentor accounts, review pending applications, and keep the
                        Bloom directory clean from one structured workspace.
                    </p>
                </div>

                <div className="mentors-hero__stats">
                    <article className="mentors-stat-card">
                        <span>Verified</span>
                        <strong>{stats.verified}</strong>
                    </article>
                    <article className="mentors-stat-card">
                        <span>Pending</span>
                        <strong>{stats.pending}</strong>
                    </article>
                    <article className="mentors-stat-card">
                        <span>Flagged</span>
                        <strong>{stats.flagged}</strong>
                    </article>
                    <article className="mentors-stat-card mentors-stat-card--accent">
                        <span>Total mentors</span>
                        <strong>{stats.total}</strong>
                    </article>
                </div>
            </section>

            <section className="mentors-layout">
                <aside className="mentors-sidebar">
                    <article className="mentors-panel">
                        <div className="mentors-panel__header">
                            <span className="mentors-panel__eyebrow">Onboard mentor</span>
                            <h2>Add a mentor to review</h2>
                            <p>Promote an existing Bloom account into the mentor review queue.</p>
                        </div>

                        <form className="mentors-form" onSubmit={handleAddMentor}>
                            <label className="mentors-field">
                                <span>Email address</span>
                                <input
                                    type="email"
                                    placeholder="mentor@email.com"
                                    value={newMentor.email}
                                    onChange={event => setNewMentor({ email: event.target.value })}
                                    required
                                />
                            </label>

                            <button type="submit" className="mentors-button mentors-button--primary" disabled={adding}>
                                {adding ? 'Adding mentor...' : 'Add to pending review'}
                            </button>
                        </form>
                    </article>

                    <article className="mentors-panel">
                        <div className="mentors-panel__header">
                            <span className="mentors-panel__eyebrow">Profile editor</span>
                            <h2>{editingId ? 'Update mentor profile' : 'Select a mentor to edit'}</h2>
                            <p>
                                {editingId
                                    ? 'Refine public profile details before approving the mentor.'
                                    : 'Choose any mentor card from the directory to edit profile details here.'}
                            </p>
                        </div>

                        {editingId ? (
                            <form className="mentors-form" onSubmit={handleUpdateMentor}>
                                <label className="mentors-field">
                                    <span>Full name</span>
                                    <input
                                        value={editForm.full_name}
                                        onChange={event => setEditForm({ ...editForm, full_name: event.target.value })}
                                        placeholder="Mentor full name"
                                        required
                                    />
                                </label>

                                <label className="mentors-field">
                                    <span>Bio</span>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={event => setEditForm({ ...editForm, bio: event.target.value })}
                                        placeholder="Short professional bio"
                                        rows="5"
                                    />
                                </label>

                                <label className="mentors-field">
                                    <span>Expertise</span>
                                    <input
                                        value={editForm.expertise}
                                        onChange={event => setEditForm({ ...editForm, expertise: event.target.value })}
                                        placeholder="Leadership, Career Growth, Faith"
                                    />
                                </label>

                                <div className="mentors-form__actions">
                                    <button type="submit" className="mentors-button mentors-button--primary">
                                        Save changes
                                    </button>
                                    <button type="button" className="mentors-button mentors-button--ghost" onClick={() => setEditingId(null)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mentors-empty-card">
                                <strong>No mentor selected</strong>
                                <p>The edit form will appear here when you click edit on a mentor record.</p>
                            </div>
                        )}
                    </article>
                </aside>

                <div className="mentors-main">
                    <article className="mentors-panel">
                        <div className="mentors-toolbar">
                            <div className="mentors-tabs" role="tablist" aria-label="Mentor verification filters">
                                <button
                                    type="button"
                                    className={`mentors-tab ${activeTab === 'verified' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('verified')}
                                >
                                    Verified
                                    <span>{stats.verified}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`mentors-tab ${activeTab === 'pending' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    Pending
                                    <span>{stats.pending}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`mentors-tab ${activeTab === 'flagged' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('flagged')}
                                >
                                    Flagged
                                    <span>{stats.flagged}</span>
                                </button>
                            </div>

                            <label className="mentors-search">
                                <span>Search directory</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={event => setSearchQuery(event.target.value)}
                                    placeholder="Search by name, email, bio, or expertise"
                                />
                            </label>
                        </div>

                        <div className="mentors-results-head">
                            <div>
                                <span className="mentors-panel__eyebrow">Directory results</span>
                                <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} mentors</h2>
                            </div>
                            <p>{loading ? 'Refreshing directory...' : `${mentorsToDisplay.length} mentor record(s) shown.`}</p>
                        </div>

                        {loading ? (
                            <div className="mentors-empty-state">
                                <h3>Loading mentor directory</h3>
                                <p>Pulling mentor verification data from Bloom.</p>
                            </div>
                        ) : mentorsToDisplay.length === 0 ? (
                            <div className="mentors-empty-state">
                                <h3>No mentors found</h3>
                                <p>There are no mentor records matching the current filter and search.</p>
                            </div>
                        ) : (
                            <div className="mentors-card-list">
                                {mentorsToDisplay.map(mentor => {
                                    const expertise = getExpertiseList(mentor.expertise)
                                    const status = formatStatus(mentor)

                                    return (
                                        <article key={mentor.id} className="mentor-record-card">
                                            <div className="mentor-record-card__identity">
                                                <div className="mentor-record-card__avatar">
                                                    {getInitials(mentor.full_name, mentor.email)}
                                                </div>

                                                <div className="mentor-record-card__copy">
                                                    <div className="mentor-record-card__headline">
                                                        <h3>{mentor.full_name || 'Incomplete Profile'}</h3>
                                                        <span className={`mentor-status-badge mentor-status-badge--${status.toLowerCase()}`}>
                                                            {status}
                                                        </span>
                                                    </div>
                                                    <p>{mentor.email}</p>
                                                    <p className="mentor-record-card__bio">
                                                        {mentor.bio || 'No bio added yet.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mentor-record-card__meta">
                                                <div className="mentor-record-card__section">
                                                    <span>Expertise</span>
                                                    <div className="mentor-record-tags">
                                                        {expertise.length > 0 ? (
                                                            expertise.slice(0, 4).map(item => (
                                                                <span key={item} className="mentor-record-tag">
                                                                    {item}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="mentor-record-tag mentor-record-tag--muted">Not set</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mentor-record-card__section mentor-record-card__section--actions">
                                                    <span>Actions</span>
                                                    <div className="mentor-record-actions">
                                                        {mentor.verification_status !== 'verified' && !mentor.is_flagged && (
                                                            <button
                                                                type="button"
                                                                className="mentors-button mentors-button--primary"
                                                                onClick={() => verifyMentor(mentor.id)}
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="mentors-button mentors-button--ghost"
                                                            onClick={() => startEditing(mentor)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="mentors-button mentors-button--ghost"
                                                            onClick={() => toggleFlagMentor(mentor.id, mentor.is_flagged)}
                                                        >
                                                            {mentor.is_flagged ? 'Unflag' : 'Flag'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="mentors-button mentors-button--danger"
                                                            onClick={() => revokeMentorAccess(mentor.id)}
                                                        >
                                                            Revoke
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                        )}
                    </article>
                </div>
            </section>
        </div>
    )
}
