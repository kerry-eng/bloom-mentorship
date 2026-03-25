import React, { useState, useEffect, useRef } from 'react'
import './VideoCallModal.css'

export default function VideoCallModal({ 
    session, 
    onClose, 
    localStream, 
    remoteStream, 
    isMuted, 
    isCameraOff, 
    toggleMic, 
    toggleCamera,
    callStatus,
    isMentor
}) {
    const [timer, setTimer] = useState(0)
    const [micLevel, setMicLevel] = useState(0)
    const [soundTest, setSoundTest] = useState(false)
    
    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const audioContextRef = useRef(null)
    const analyzerRef = useRef(null)
    const animationFrameRef = useRef(null)

    useEffect(() => {
        let timerId
        if (callStatus === 'connected') {
            timerId = setInterval(() => setTimer(t => t + 1), 1000)
        }
        return () => clearInterval(timerId)
    }, [callStatus])

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
            setupAudioAnalysis(localStream)
        }
    }, [localStream])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    function setupAudioAnalysis(stream) {
        try {
            if (audioContextRef.current) audioContextRef.current.close()
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const source = audioContext.createMediaStreamSource(stream)
            const analyzer = audioContext.createAnalyser()
            analyzer.fftSize = 256
            source.connect(analyzer)
            
            audioContextRef.current = audioContext
            analyzerRef.current = analyzer

            const updateLevel = () => {
                if (!analyzerRef.current) return
                const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
                analyzerRef.current.getByteFrequencyData(dataArray)
                let sum = 0
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
                setMicLevel(sum / dataArray.length)
                animationFrameRef.current = requestAnimationFrame(updateLevel)
            }
            updateLevel()
        } catch (e) { console.warn(e) }
    }

    function playTestSound() {
        if (!audioContextRef.current) return
        const osc = audioContextRef.current.createOscillator()
        const gain = audioContextRef.current.createGain()
        osc.connect(gain)
        gain.connect(audioContextRef.current.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, audioContextRef.current.currentTime)
        gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 1)
        osc.start()
        osc.stop(audioContextRef.current.currentTime + 1)
        setSoundTest(true)
        setTimeout(() => setSoundTest(false), 1000)
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="video-overlay">
            <div className="video-container">
                <div className="active-call-view">
                    <div className="main-video-feed">
                        {/* Always render the video feed backplane */}
                        <video 
                            ref={remoteVideoRef} 
                            autoPlay 
                            playsInline 
                            className={`main-video-element ${!remoteStream ? 'hidden' : ''}`}
                        />

                        {/* If NOT connected to remote, show the "Waiting" or "Placeholder" overlay */}
                        {!remoteStream && (
                             <div className="connecting-view-overlay">
                                <div className="bloom-logo-pulse">🌸</div>
                                <h2>{callStatus === 'connecting' ? 'Preparing Your Safe Space...' : 'Waiting for connection...'}</h2>
                                <p>Waiting for {isMentor ? 'client' : 'mentor'} to join the room</p>
                                
                                <div className="mentee-avatar-placeholder" style={{ marginTop: '2rem' }}>
                                    <div className="placeholder-circle">
                                        <span>{isMentor ? 'C' : (session?.mentor?.full_name?.[0] || 'M')}</span>
                                    </div>
                                    <p>Ready for {isMentor ? 'client' : (session?.mentor?.full_name || 'Mentor')}</p>
                                </div>
                            </div>
                        )}

                        {/* Self View Overlay (Always visible if localStream exists) */}
                        {localStream && (
                            <div className="self-preview">
                                <span className="video-label">YOU (LIVE)</span>
                                <video 
                                    ref={localVideoRef} 
                                    autoPlay 
                                    muted={!soundTest} 
                                    playsInline 
                                    className={`self-video-element ${isCameraOff ? 'hidden' : ''}`} 
                                />
                                {isCameraOff && <div className="video-off-placeholder">CAMERA OFF</div>}
                                
                                {!isMuted && (
                                    <div className="mic-meter-container">
                                        <div className="mic-meter-fill" style={{ height: `${Math.min(micLevel * 1.5, 100)}%` }}></div>
                                    </div>
                                )}
                                
                                <button className="test-audio-chip" onClick={playTestSound}>
                                    {soundTest ? '🔊 TESTING...' : '🔈 TEST SPEAKERS'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer with Controls (Always Visible) */}
                    <div className="call-footer">
                        <div className="call-info">
                            <span className="session-tag">{session?.session_label || 'Mentorship Session'}</span>
                            <span className="call-timer">{formatTime(timer)}</span>
                        </div>
                        
                        <div className="call-controls">
                            <div className="control-group">
                                <button className={`control-btn ${isMuted ? 'disabled' : ''}`} onClick={toggleMic}>
                                    <span className="icon">{isMuted ? '🔇' : '🎤'}</span>
                                </button>
                                <button className={`control-btn ${isCameraOff ? 'disabled' : ''}`} onClick={toggleCamera}>
                                    <span className="icon">{isCameraOff ? '📵' : '📹'}</span>
                                </button>
                            </div>

                            <button className="control-btn end-call" onClick={onClose}>
                                <span className="icon">📞</span>
                                <span>LEAVE SESSION</span>
                            </button>

                            <div className="control-group">
                                <button className="control-btn"><span className="icon">💬</span></button>
                                <button className="control-btn"><span className="icon">⚙️</span></button>
                            </div>
                        </div>

                        <div className="security-badge">
                            🔒 End-to-End Encrypted
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
