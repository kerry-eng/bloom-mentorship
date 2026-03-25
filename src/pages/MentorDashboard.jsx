import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import DashboardLayout from '../components/DashboardLayout'
import './MentorDashboard.css'

export default function MentorDashboard() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        pending: 0,
        completed: 0,
        clients: 0,
        revenue: 0
    })
    const [activeView, setActiveView] = useState('overview')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (!user) return
        fetchMentorData()
    }, [user])

    async function fetchMentorData() {
        setLoading(true)
        try {
            // Fetch sessions where this user is the mentor
            const { data, error } = await supabase
                .from('sessions')
                .select('*, client:client_id(full_name, avatar_url)')
                .eq('mentor_id', user.id)
                .order('scheduled_at', { ascending: true })

            if (error) throw error
            setSessions(data || [])

            // Calculate stats
            const pending = data?.filter(s => s.status === 'pending' || s.status === 'paid').length || 0
            const completed = data?.filter(s => s.status === 'completed').length || 0
            const uniqueClients = new Set(data?.map(s => s.client_id)).size
            const revenue = data?.filter(s => s.status === 'completed' || s.status === 'paid').reduce((acc, s) => acc + (s.price || 0), 0) || 0

            setStats({
                pending,
                completed,
                clients: uniqueClients,
                revenue
            })
        } catch (err) {
            console.error('Error fetching mentor data:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdateStatus(sessionId, newStatus) {
        try {
            const { error } = await supabase
                .from('sessions')
                .update({ status: newStatus })
                .eq('id', sessionId)
            
            if (error) throw error
            fetchMentorData() // Refresh
        } catch (err) {
            console.error('Error updating status:', err)
        }
    }

    const renderOverview = () => (
        <div className="mentor-overview fade-in">
            <div className="mentor-stats-row">
                <div className="mentor-stat-card">
                    <span className="stat-label">Active Bookings</span>
                    <span className="stat-number">{stats.pending}</span>
                </div>
                <div className="mentor-stat-card">
                    <span className="stat-label">Total Mentees</span>
                    <span className="stat-number">{stats.clients}</span>
                </div>
                <div className="mentor-stat-card">
                    <span className="stat-label">Earnings (Est)</span>
                    <span className="stat-number">KES {stats.revenue.toLocaleString()}</span>
                </div>
                <div className="mentor-stat-card">
                    <span className="stat-label">Success Rate</span>
                    <span className="stat-number">98%</span>
                </div>
            </div>

            <div className="mentor-grid">
                <div className="mentor-main-panel">
                    <div className="mentor-card">
                        <h2>
                            Current Schedule
                            <Link to="/booking" className="btn-mentor btn-mentor-outline">Manage Slots</Link>
                        </h2>
                        <div className="session-list">
                            {sessions.length === 0 ? (
                                <p className="empty-msg">No sessions scheduled yet.</p>
                            ) : (
                                sessions.map(s => (
                                    <div key={s.id} className="mentor-session-item">
                                        <div className="session-client-info">
                                            <h4>{s.client?.full_name || 'Client'}</h4>
                                            <p>{s.session_label} • {new Date(s.scheduled_at).toLocaleString()}</p>
                                        </div>
                                        <div className="session-actions">
                                            <span className={`status-badge ${s.status}`}>{s.status.toUpperCase()}</span>
                                            {s.status === 'paid' && (
                                                <Link to={`/session/${s.id}?role=mentor`} className="btn-mentor btn-mentor-primary">START</Link>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="mentor-side-panel">
                    <div className="mentor-card">
                        <h2>Recent Activity</h2>
                        <div className="activity-list">
                            <p className="subtitle" style={{fontSize: '0.9rem', opacity: 0.7}}>New booking from Sarah M.</p>
                            <hr style={{borderColor: 'rgba(255,255,255,0.05)', margin: '1rem 0'}} />
                            <p className="subtitle" style={{fontSize: '0.9rem', opacity: 0.7}}>Payment confirmed for Deep Dive Session.</p>
                        </div>
                    </div>
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
            isMentor={true}
        >
            <div className="mentor-dashboard-container">
                <header className="mentor-header">
                    <div className="mentor-welcome">
                        <h1>Welcome back, {profile?.full_name?.split(' ')[0] || 'Mentor'}</h1>
                        <p>Your leadership is shaping the future of architecture and mindset.</p>
                    </div>
                    <div className="mentor-actions">
                        <Link to="/edit-profile" className="btn-mentor btn-mentor-outline">Settings</Link>
                    </div>
                </header>

                {renderOverview()}
            </div>
        </DashboardLayout>
    )
}
