import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { useWebRTC } from '../hooks/useWebRTC'
import VideoCallModal from '../components/VideoCallModal'
import './Session.css'

export default function Session({ forceMentor = false, mentorHomePath = '/' }) {
    const { sessionId } = useParams()
    const [searchParams] = useSearchParams()
    const isMentor = forceMentor || searchParams.get('role') === 'mentor'

    const { user } = useAuth()
    const navigate = useNavigate()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [elapsed, setElapsed] = useState(0)
    const [hasLeft, setHasLeft] = useState(false)  // "Left" screen with Rejoin option
    const timerRef = useRef(null)

    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)

    const {
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        isScreenSharing,
        messages,
        callStatus,
        startCall,
        toggleMic,
        toggleCamera,
        toggleScreenShare,
        sendMessage,
        endCall: endWebRTC,
        error: webRTCError
    } = useWebRTC(sessionId, isMentor)

    // Warn user before refresh/close while in a live call
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (callStatus === 'connected' || callStatus === 'connecting') {
                e.preventDefault()
                e.returnValue = 'You are in an active session. Are you sure you want to leave?'
                return e.returnValue
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [callStatus])

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
                setError('Session not found or access denied.')
                return
            }

            // Payment verification check for clients
            if (!isMentor && data && !['active', 'confirmed'].includes(data.status)) {
                setError('Payment awaiting confirmation. Please wait for an admin or mentor to approve your access.')
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
        // Show "left session" screen instead of navigating away
        setHasLeft(true)
    }

    async function handleFullyExit() {
        try {
            if (!isMentor) {
                await supabase.from('sessions').update({ status: 'completed' }).eq('id', sessionId)
            }
        } catch (e) {
            console.error(e)
        }
        navigate(isMentor ? mentorHomePath : '/dashboard')
    }

    function handleRejoin() {
        setHasLeft(false)
        setElapsed(0)
        // startCall will re-initialise the WebRTC connection
        startCall()
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

    // "You've left" interstitial screen
    if (hasLeft) return (
        <div className="session-page">
            <div className="session__topbar">
                <div className="session__topbar-left">
                    <span className="session__logo figma-script-title" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <img src="/LOGO.png" alt="Bloom" style={{ height: '45px', width: 'auto' }} />
                    </span>
                </div>
            </div>
            <div className="session__room">
                <div className="figma-panel" style={{ maxWidth: '500px', margin: 'auto', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👋</div>
                    <h2 className="figma-script-title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
                        You've Left the Session
                    </h2>
                    <p style={{ color: 'var(--color-text-mid)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Did you leave by accident? You can rejoin right now — the session is still active.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="btn figma-btn-primary"
                            style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
                            onClick={handleRejoin}
                        >
                            🔄 Rejoin Session
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
                            onClick={handleFullyExit}
                        >
                            Exit to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="session-page">
            {/* Lobby View (Standard Bloom Theme) */}
            {(callStatus === 'idle' || callStatus === 'error' || callStatus === 'ended' || callStatus === 'permissions') ? (
                <>
                    <div className="session__topbar">
                        <div className="session__topbar-left">
                            <span className="session__logo figma-script-title" style={{ margin: 0, display: 'flex', alignItems: 'center' }}><img src="/LOGO.png" alt="Bloom" style={{ height: '45px', width: 'auto' }} /></span>
                        </div>
                        <Link to="/dashboard" className="btn btn-secondary btn-sm">Exit</Link>
                    </div>
                    
                    <div className="session__room">
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
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                /* Premium Video Call UI */
                <VideoCallModal 
                    session={session}
                    onClose={handleEndCall}
                    localStream={localStream}
                    remoteStream={remoteStream}
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    toggleMic={toggleMic}
                    toggleCamera={toggleCamera}
                    toggleScreenShare={toggleScreenShare}
                    isScreenSharing={isScreenSharing}
                    messages={messages}
                    sendMessage={sendMessage}
                    callStatus={callStatus}
                    isMentor={isMentor}
                />
            )}
        </div>
    )
}
