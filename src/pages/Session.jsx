import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { useWebRTC } from '../hooks/useWebRTC'
import './Session.css'

export default function Session() {
    const { sessionId } = useParams()
    const [searchParams] = useSearchParams()
    const isMentor = searchParams.get('role') === 'mentor'

    const { user } = useAuth()
    const navigate = useNavigate()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [elapsed, setElapsed] = useState(0)
    const timerRef = useRef(null)

    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)

    const {
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        isLocalSpeaking,
        isRemoteSpeaking,
        callStatus,
        permissionsGranted,
        startCall,
        requestPermissions,
        toggleMic,
        toggleCamera,
        endCall: endWebRTC,
    } = useWebRTC(sessionId, isMentor)

    useEffect(() => {
        fetchSession()
        return () => clearInterval(timerRef.current)
    }, [sessionId])

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
        }
    }, [remoteStream])

    async function fetchSession() {
        try {
            let query = supabase.from('sessions').select('*, mentor:mentor_id(full_name)').eq('id', sessionId)
            if (!isMentor && user) {
                query = query.eq('client_id', user.id)
            }
            const { data, error: err } = await query.single()
            if (err && !isMentor) {
                // Only block clients from seeing invalid sessions
                setError('Session not found or access denied.')
                return
            }
            setSession(data || { id: sessionId })
        } catch (e) {
            if (!isMentor) setError(e.message)
            else setSession({ id: sessionId })
        } finally {
            setLoading(false)
        }
    }

    function formatTime(secs) {
        const m = Math.floor(secs / 60).toString().padStart(2, '0')
        const s = (secs % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    async function handleEndCall() {
        clearInterval(timerRef.current)
        endWebRTC()
        try {
            if (!isMentor) {
                await supabase.from('sessions').update({ status: 'completed' }).eq('id', sessionId)
            }
        } catch (e) {
            console.error(e)
        }
        navigate(isMentor ? '/' : '/dashboard')
    }

    if (loading) return (
        <div className="session-loading">
            <div style={{ fontSize: '2.5rem' }}>🌸</div>
            <p>Preparing your safe space...</p>
        </div>
    )

    if (error) return (
        <div className="session-error">
            <div className="figma-panel" style={{ maxWidth: 480, textAlign: 'center', margin: 'auto' }}>
                <div style={{ fontSize: '3rem', margin: '1rem 0' }}>🔒</div>
                <h2 className="figma-script-title" style={{ fontSize: '2rem' }}>Session Unavailable</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-mid)' }}>{error}</p>
                <Link to="/dashboard" className="btn figma-btn-primary">Back to Dashboard</Link>
            </div>
        </div>
    )

    return (
        <div className="session-page">
            {/* Topbar */}
            <div className="session__topbar">
                <div className="session__topbar-left">
                    <span className="session__logo figma-script-title" style={{ fontSize: '1.8rem', margin: 0 }}>Bloom ✿</span>
                    <div className="session__info">
                        <span className="session__name">{session?.session_label || 'Mentorship Session'}</span>
                        <div className="session__live">
                            {session?.mentor && !isMentor && (
                                <span style={{ color: 'var(--color-text-mid)', fontSize: '0.85rem', marginRight: '1rem' }}>
                                    Mentored by: <b>{session.mentor.full_name}</b>
                                </span>
                            )}
                            {callStatus === 'connected' ? (
                                <>
                                    <span className="session__live-dot" />
                                    Live · {formatTime(elapsed)}
                                </>
                            ) : (
                                <span style={{ color: 'var(--color-text-soft)', fontSize: '0.8rem' }}>
                                    {callStatus === 'connecting' ? 'Connecting...' : 'Ready'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button id="end-call-btn" className="btn btn-secondary btn-sm session__end" onClick={handleEndCall}>
                    Leave
                </button>
            </div>

            {/* Room */}
            <div className="session__room">
                {(callStatus === 'idle' || callStatus === 'error' || callStatus === 'ended') ? (
                    /* Lobby */
                    <div className="session__lobby figma-panel" style={{ maxWidth: '500px', margin: 'auto', textAlign: 'center', padding: '3rem 2rem', position: 'relative' }}>
                        <div className="washi-tape tape-pink" style={{ top: '-15px', right: '30%', transform: 'rotate(2deg)' }}></div>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🌿</div>
                        <h2 className="figma-script-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Ready to Begin?</h2>
                        <p style={{ color: 'var(--color-text-mid)', marginBottom: '2rem', maxWidth: '380px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                            {session?.mentor && !isMentor ? (
                                <span style={{ display: 'block', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                    Assigned Mentor: {session.mentor.full_name} 🌸
                                </span>
                            ) : null}
                            Click below to turn on your camera and connect.
                            Your browser will ask for camera access.
                        </p>

                        <button
                            id="join-call-btn"
                            className="btn figma-btn-primary"
                            style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}
                            onClick={startCall}
                            disabled={callStatus === 'permissions'}
                        >
                            🎥 Join Session
                        </button>

                        {callStatus === 'error' && (
                            <div style={{ color: '#e05555', marginTop: '1.5rem', fontSize: '0.9rem', background: 'rgba(220,60,60,0.1)', padding: '0.75rem 1.2rem', borderRadius: '8px', maxWidth: '400px' }}>
                                <p style={{ marginBottom: '0.5rem' }}>⚠️ Camera or microphone access was denied.</p>
                                <p>Please click the 🔒 icon in your browser's address bar, allow Camera and Microphone, then refresh the page and try again.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Active Video Room — flex column layout */
                    <div className="session__video-grid">
                        {/* Video area — remote video fills background, self in corner */}
                        <div className={`session__video-area${isRemoteSpeaking ? ' is-speaking' : ''}`}>
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="session__video-main"
                            />

                            {/* Connecting overlay */}
                            {(callStatus === 'connecting') && (
                                <div className="session__video-overlay">
                                    <div className="session__waiting-pulse">
                                        <div className="session__pulse-ring" />
                                        <div className="session__pulse-ring session__pulse-ring--2" />
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                                        Waiting for {isMentor ? 'client' : 'mentor'} to connect...
                                    </p>
                                </div>
                            )}

                            {/* Self-view */}
                            <div className={`session__video-self${isLocalSpeaking ? ' is-speaking' : ''}`}>
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                />
                                {isCameraOff && (
                                    <div className="session__video-overlay" style={{ background: 'rgba(10,5,20,0.9)', pointerEvents: 'none' }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                                            <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10M1 1l22 22" />
                                        </svg>
                                        <span style={{ color: 'white', fontSize: '0.65rem', marginTop: '0.2rem' }}>Camera Off</span>
                                    </div>
                                )}
                                <div className="session__video-label">You</div>
                            </div>

                            {/* Remote label */}
                            <div className="session__video-label" style={{ top: '0.5rem', bottom: 'auto' }}>
                                {isMentor ? 'Client' : 'Mentor'}
                            </div>
                        </div>

                        {/* Controls bar — always at the bottom, never clipped */}
                        <div className="session__controls">
                            <button
                                className={`session__control-btn${isMuted ? ' session__control-btn--off' : ''}`}
                                onClick={() => {
                                    console.log('REACT CLICK FIRED: Toggling Mic!')
                                    toggleMic()
                                }}
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                        <path d="M9 9v3a3 3 0 005.1 2.1M15 9.3V4a3 3 0 00-5.9-.6" />
                                        <path d="M17 17A7 7 0 015 12v-2m14 0v2a7 7 0 01-.1 1.2M12 19v4M8 23h8" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
                                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                                        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                                    </svg>
                                )}
                                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                            </button>

                            <button
                                className="session__control-btn session__control-btn--end"
                                onClick={() => {
                                    console.log('REACT CLICK FIRED: Ending Call!')
                                    handleEndCall()
                                }}
                                title="End Session"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1-.18 1.1.4 2.3.6 3.6.6.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C9.6 21 3 14.4 3 6c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.3.2 2.5.58 3.6.14.32.04.72-.18.98L6.6 10.8z" />
                                </svg>
                                <span>End</span>
                            </button>

                            <button
                                className={`session__control-btn${isCameraOff ? ' session__control-btn--off' : ''}`}
                                onClick={() => {
                                    console.log('REACT CLICK FIRED: Toggling Camera!')
                                    toggleCamera()
                                }}
                                title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                            >
                                {isCameraOff ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
                                        <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10M1 1l22 22" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
                                        <polygon points="23 7 16 12 23 17 23 7" />
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                    </svg>
                                )}
                                <span>{isCameraOff ? 'Cam On' : 'Cam Off'}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
