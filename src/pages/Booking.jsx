import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import './Booking.css'

const SESSION_TYPES = [
    { id: 'discovery', label: 'Discovery Session', duration: '30 min', price: 500, desc: 'A professional introduction to identify your primary goals.' },
    { id: 'deep-dive', label: 'Deep Dive Session', duration: '60 min', price: 1500, desc: 'An intensive session to work through complex challenges.' },
    { id: 'monthly', label: 'Monthly Mentorship', duration: '4× / month', price: 6000, desc: 'Ongoing weekly support with priority messaging access.' }
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
    const [transactionId, setTransactionId] = useState('')
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

    const handleBooking = () => {
        if (!selectedDate || !selectedTime || !selectedMentor) {
            setError('Please select a mentor, date and time.')
            return
        }
        if (!transactionId.trim()) {
            setError('Please enter the M-Pesa transaction code.')
            return
        }
        setError('')
        setLoading(true)
        saveSession(`LOOP_${transactionId.trim().toUpperCase()}`)
    }

    async function saveSession(paymentRef) {
        try {
            const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString()
            const { error: err } = await supabase.from('sessions').insert({
                client_id: user.id,
                session_type: session.id,
                session_label: session.label,
                duration_mins: session.id === 'deep-dive' ? 60 : 30,
                price: session.price,
                scheduled_at: scheduledAt,
                mentor_id: selectedMentor?.id,
                status: 'pending',
                stripe_payment_id: paymentRef
            })
            if (err) throw err
            navigate('/dashboard?view=assignments&booked=1')
        } catch (e) {
            setError(e.message)
        } finally {
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

                            <div className="payment-instructions" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-dark)', fontSize: '1.1rem', fontWeight: '800' }}>Payment Instructions</h4>
                                <div style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--color-text-mid)', lineHeight: '1.6' }}>
                                    <p>1. Go to <strong>M-Pesa</strong> &gt; <strong>Lipa na M-Pesa</strong> &gt; <strong>Paybill</strong></p>
                                    <p>2. Enter Paybill Number: <strong style={{ color: 'var(--color-primary)', fontSize: '1.05rem' }}>714777</strong></p>
                                    <p>3. Enter Account Number: <strong style={{ color: 'var(--color-primary)', fontSize: '1.05rem' }}>0710341260</strong></p>
                                    <p>4. Enter Amount: <strong>KES {session.price.toLocaleString()}</strong></p>
                                </div>
                                
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: '600' }}>
                                    Once the payment is made, enter the M-Pesa transaction code below to confirm your booking.
                                </p>
                                
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>M-Pesa Transaction Code</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. QAB1234XYZ" 
                                    value={transactionId}
                                    onChange={e => setTransactionId(e.target.value)}
                                    style={{ width: '100%', textTransform: 'uppercase' }}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-vibration btn-checkout w-100"
                                onClick={handleBooking}
                                disabled={loading}
                                style={{ marginTop: '1.5rem' }}
                            >
                                {loading ? <div className="spinner sm" /> : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
