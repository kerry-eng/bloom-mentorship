import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import './Booking.css'

const SESSION_TYPES = [
    { id: 'discovery', label: 'Discovery Session', duration: '30 min', price: 2500, desc: 'A professional introduction to identify your primary goals.' },
    { id: 'deep-dive', label: 'Deep Dive Session', duration: '60 min', price: 4500, desc: 'An intensive session to work through complex challenges.' },
    { id: 'monthly', label: 'Monthly Mentorship', duration: '4× / month', price: 15000, desc: 'Ongoing weekly support with priority messaging access.' }
]

const TIMESLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00']

export default function Booking() {
    const [searchParams] = useSearchParams()
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'discovery')
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [loading, setLoading] = useState(false)
    const [mentors, setMentors] = useState(null)
    const [selectedMentor, setSelectedMentor] = useState(null)
    const [error, setError] = useState('')
    const [phone, setPhone] = useState('')
    const [paymentStatus, setPaymentStatus] = useState(null) // 'prompted' | 'success' | 'failed'
    const { user, profile } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetchMentors()
    }, [])

    async function fetchMentors() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, bio, expertise')
                .eq('role', 'mentor')
                .order('full_name', { ascending: true })

            if (error) throw error
            setMentors(data || [])
            if (data && data.length > 0) {
                setSelectedMentor(data[0])
            }
        } catch (e) {
            console.error('Error fetching mentors:', e)
            setMentors([])
        }
    }

    const session = SESSION_TYPES.find(s => s.id === selectedType) || SESSION_TYPES[0]

    const minDate = new Date()
    const minDateStr = minDate.toISOString().split('T')[0]

    function setNow() {
        const now = new Date()
        setSelectedDate(now.toISOString().split('T')[0])
        const h = now.getHours().toString().padStart(2, '0')
        const m = now.getMinutes() < 30 ? '00' : '30'
        setSelectedTime(`${h}:${m}`)
    }

    useEffect(() => {
        // Listen for realtime payment updates
        if (!user) return

        const channel = supabase.channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'sessions',
                    filter: `client_id=eq.${user.id}`
                },
                (payload) => {
                    if (payload.new.status === 'paid') {
                        setPaymentStatus('success')
                        setTimeout(() => navigate('/dashboard?view=assignments&booked=1'), 2000)
                    } else if (payload.new.status === 'cancelled') {
                        setPaymentStatus('failed')
                        setError('Payment was cancelled or failed.')
                        setLoading(false)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, navigate])

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime || !selectedMentor) {
            setError('Please select a mentor, date and time.')
            return
        }
        if (!phone.trim() || phone.length < 9) {
            setError('Please enter a valid M-Pesa phone number (e.g. 2547...).')
            return
        }
        
        // format phone (ensure it starts with 254)
        let formattedPhone = phone.trim().replace(/\s+/g, '')
        if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.substring(1)
        if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1)

        setError('')
        setLoading(true)

        try {
            // 1. Create a pending session to get an ID for tracking
            const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString()
            const { data: sessionData, error: err } = await supabase.from('sessions').insert({
                client_id: user.id,
                session_type: session.id,
                session_label: session.label,
                duration_mins: session.id === 'deep-dive' ? 60 : 30,
                price: session.price,
                scheduled_at: scheduledAt,
                mentor_id: selectedMentor?.id,
                status: 'pending' // stripe_payment_id will be set by the edge function
            }).select().single()

            if (err) throw err

            // 2. Trigger Daraja STK Push via Supabase Edge Function
            const { data, error: fnError } = await supabase.functions.invoke('mpesa-stk-push', {
                body: { 
                    phone: formattedPhone, 
                    amount: session.price, 
                    sessionId: sessionData.id 
                }
            })

            if (fnError) throw new Error(fnError.message)
            if (data?.error) throw new Error(data.error)

            setPaymentStatus('prompted')
        } catch (e) {
            console.error(e)
            setError(e.message || 'Failed to initiate payment. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="booking-page">
            <div className="container booking-container">
                <div className="booking-header text-center fade-in">
                    <span className="section-label">Mentorship Booking</span>
                    <h1 className="hero-title">Schedule Your Session</h1>
                    <p className="booking-subtitle">Choose your path, select a mentor, and find a time that works for you.</p>
                </div>

                <div className="booking-grid">
                    <div className="booking-form fade-in-delay-1">
                        <section className="booking-section glass-card">
                            <h3 className="section-title">1. Select Session Type</h3>
                            <div className="session-types-list">
                                {SESSION_TYPES.map(s => (
                                    <button
                                        key={s.id}
                                        className={`session-card ${selectedType === s.id ? 'active' : ''}`}
                                        onClick={() => setSelectedType(s.id)}
                                    >
                                        <div className="session-card-header">
                                            <strong>{s.label}</strong>
                                            <span className="price">KES {s.price.toLocaleString()}</span>
                                        </div>
                                        <span className="duration">{s.duration}</span>
                                        <p className="desc">{s.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="booking-section glass-card mt-4">
                            <h3 className="section-title">2. Choose Your Mentor</h3>
                            {mentors === null ? (
                                <div className="text-center py-5">
                                    <div className="spinner mx-auto" />
                                </div>
                            ) : mentors.length === 0 ? (
                                <div className="alert-box">No mentors available at this time.</div>
                            ) : (
                                <div className="mentors-selection">
                                    {mentors.map(m => (
                                        <button
                                            key={m.id}
                                            className={`mentor-card-select ${selectedMentor?.id === m.id ? 'active' : ''}`}
                                            onClick={() => setSelectedMentor(m)}
                                        >
                                            <div className="mentor-avatar">
                                                {m.full_name?.charAt(0)}
                                            </div>
                                            <strong>{m.full_name}</strong>
                                            <div className="expertise-tags">
                                                {(m.expertise || []).slice(0, 2).map((exp, i) => (
                                                    <span key={i} className="tag">{exp}</span>
                                                ))}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="booking-section glass-card mt-4">
                            <div className="section-header-row">
                                <h3 className="section-title">3. Pick Date & Time</h3>
                                <button type="button" className="btn-now" onClick={setNow}>Quick Select: Now</button>
                            </div>
                            <div className="date-picker-group">
                                <label className="form-label">Select Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    min={minDateStr}
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div className="time-picker-group mt-3">
                                <label className="form-label">Select Time</label>
                                <div className="time-slots-grid">
                                    {TIMESLOTS.map(t => (
                                        <button
                                            key={t}
                                            className={`time-slot ${selectedTime === t ? 'active' : ''}`}
                                            onClick={() => setSelectedTime(t)}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="booking-summary-wrapper fade-in-delay-2">
                        <div className="summary-card glass-card">
                            <h3 className="section-title">Reservation Summary</h3>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Session</span>
                                    <strong>{session.label}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Duration</span>
                                    <span>{session.duration}</span>
                                </div>
                                {selectedMentor && (
                                    <div className="summary-row">
                                        <span>Mentor</span>
                                        <strong>{selectedMentor.full_name}</strong>
                                    </div>
                                )}
                                {selectedDate && (
                                    <div className="summary-row">
                                        <span>Date</span>
                                        <span>{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                    </div>
                                )}
                                {selectedTime && (
                                    <div className="summary-row">
                                        <span>Time</span>
                                        <span>{selectedTime}</span>
                                    </div>
                                )}
                                <div className="summary-divider" />
                                <div className="summary-row total">
                                    <span>Total Amount</span>
                                    <span className="price-total">KES {session.price.toLocaleString()}</span>
                                </div>
                            </div>

                            {error && <div className="error-msg">{error}</div>}

                            {paymentStatus === 'prompted' ? (
                                <div className="payment-instructions text-center" style={{ marginTop: '1.5rem', padding: '2rem 1.5rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '16px', border: '1px solid var(--color-primary)' }}>
                                    <div className="spinner mx-auto mb-3" style={{ borderColor: 'var(--color-primary) transparent var(--color-primary) transparent' }} />
                                    <h4 style={{ color: 'var(--color-text-dark)', fontSize: '1.1rem', fontWeight: '800' }}>Check Your Phone</h4>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--color-text-mid)' }}>
                                        We've sent an M-Pesa prompt to <strong>{phone}</strong>. Please enter your PIN to complete the payment of KES {session.price.toLocaleString()}.
                                    </p>
                                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                                        Waiting for payment confirmation...
                                    </p>
                                </div>
                            ) : paymentStatus === 'success' ? (
                                <div className="payment-instructions text-center" style={{ marginTop: '1.5rem', padding: '2rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid #10b981' }}>
                                    <h4 style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: '800' }}>Payment Successful!</h4>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--color-text-mid)' }}>
                                        Your booking is confirmed. Redirecting to dashboard...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="payment-instructions" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-dark)', fontSize: '1.1rem', fontWeight: '800' }}>Pay Via M-Pesa</h4>
                                        <div style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--color-text-mid)', lineHeight: '1.6' }}>
                                            <p>Automatically prompt your phone for payment. The transaction will be billed to <strong>Paybill 714777</strong>.</p>
                                        </div>
                                        
                                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>M-Pesa Phone Number</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            placeholder="e.g. 254712345678 or 0712345678" 
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    <button
                                        className="btn btn-primary btn-vibration btn-checkout w-100"
                                        onClick={handleBooking}
                                        disabled={loading || !phone.trim()}
                                        style={{ marginTop: '1.5rem' }}
                                    >
                                        {loading ? <div className="spinner sm" /> : `Pay KES ${session.price.toLocaleString()} Now`}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
