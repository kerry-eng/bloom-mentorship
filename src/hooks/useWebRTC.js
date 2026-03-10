import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

// Free STUN servers from Google — help discover public IP addresses for P2P
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
}

// Helper hook to detect if someone is speaking based on audio stream volume
function useAudioLevel(stream) {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const audioContextRef = useRef(null)
    const analyzerRef = useRef(null)
    const dataArrayRef = useRef(null)
    const animationRef = useRef(null)

    useEffect(() => {
        if (!stream) {
            setIsSpeaking(false)
            return
        }

        // Only analyze if the stream actually has an audio track
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length === 0) return

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            audioContextRef.current = new AudioContext()

            analyzerRef.current = audioContextRef.current.createAnalyser()
            analyzerRef.current.fftSize = 256

            const source = audioContextRef.current.createMediaStreamSource(stream)
            source.connect(analyzerRef.current)

            const bufferLength = analyzerRef.current.frequencyBinCount
            dataArrayRef.current = new Uint8Array(bufferLength)

            const checkAudioLevel = () => {
                if (!analyzerRef.current || !dataArrayRef.current) return

                analyzerRef.current.getByteFrequencyData(dataArrayRef.current)

                // Calculate average volume
                let sum = 0
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArrayRef.current[i]
                }
                const average = sum / bufferLength

                // Threshold for speaking (0-255 scale)
                setIsSpeaking(average > 15)

                animationRef.current = requestAnimationFrame(checkAudioLevel)
            }

            checkAudioLevel()

        } catch (e) {
            console.error('Error setting up audio visualizer:', e)
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(console.error)
            }
        }
    }, [stream])

    return isSpeaking
}

export function useWebRTC(sessionId, isMentor = false) {
    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isCameraOff, setIsCameraOff] = useState(false)
    const [callStatus, setCallStatus] = useState('idle') // idle | permissions | connecting | connected | ended
    const [permissionsGranted, setPermissionsGranted] = useState(false)

    const peerRef = useRef(null)
    const channelRef = useRef(null)
    const localStreamRef = useRef(null)

    // Request Permissions explicitly before starting
    const requestPermissions = useCallback(async () => {
        try {
            setCallStatus('permissions')
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            })
            setPermissionsGranted(true)
            localStreamRef.current = stream
            setLocalStream(stream)
            setCallStatus('idle')
            return true
        } catch (e) {
            console.error('Permission denied or camera not found:', e)
            setCallStatus('error')
            return false
        }
    }, [])

    // Start the call — show SweetAlert first, then request camera/mic, then enter room
    const startCall = useCallback(async () => {
        if (!sessionId) return

        try {
            // Always show the SweetAlert permission dialog
            const result = await Swal.fire({
                title: '📹 Camera & Microphone',
                html: `
                    <p style="margin-bottom: 1rem; color: #555;">To join the session, your browser needs access to your:</p>
                    <div style="display: flex; gap: 1.5rem; justify-content: center; margin: 1rem 0;">
                        <div style="text-align:center">
                            <div style="font-size:2rem">📷</div>
                            <div style="font-size:0.85rem; color:#666; margin-top:0.3rem">Camera</div>
                        </div>
                        <div style="text-align:center">
                            <div style="font-size:2rem">🎤</div>
                            <div style="font-size:0.85rem; color:#666; margin-top:0.3rem">Microphone</div>
                        </div>
                    </div>
                    <p style="font-size:0.85rem; color:#888;">Click <strong>Allow</strong> in the next browser prompt to continue.</p>
                `,
                confirmButtonText: 'Continue →',
                confirmButtonColor: '#7c6b9e',
                showCancelButton: true,
                cancelButtonText: 'Not now',
                cancelButtonColor: '#aaa',
                width: 400,
            })

            if (!result.isConfirmed) return  // user cancelled

            // Request camera and microphone (triggers browser permission dialog)
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            console.log('useWebRTC: Got stream:', stream.getTracks().map(t => t.kind))
            localStreamRef.current = stream
            setLocalStream(stream)
            setPermissionsGranted(true)

            // Switch UI to video room NOW (after camera confirmed)
            setCallStatus('connecting')

            // 2. Create WebRTC Peer Connection
            const pc = new RTCPeerConnection(ICE_SERVERS)
            peerRef.current = pc

            // 3. Add local tracks to the peer connection
            stream.getTracks().forEach(track => pc.addTrack(track, stream))

            // 4. When remote track arrives, display it
            pc.ontrack = (event) => {
                setRemoteStream(event.streams[0])
                setCallStatus('connected')
            }

            // 5. Set up Supabase Realtime as our free signaling channel
            const channel = supabase.channel(`session-room-${sessionId}`)
            channelRef.current = channel

            // 6. Send ICE candidates to the other peer via Supabase
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    channel.send({
                        type: 'broadcast',
                        event: 'ice-candidate',
                        payload: {
                            candidate: event.candidate,
                            from: isMentor ? 'mentor' : 'client'
                        }
                    })
                }
            }

            // 7. Listen for signaling messages (offer, answer, ICE candidates)
            channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
                if (isMentor) {
                    // Mentor receives the client's offer, creates answer
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
                    const answer = await pc.createAnswer()
                    await pc.setLocalDescription(answer)
                    channel.send({
                        type: 'broadcast',
                        event: 'answer',
                        payload: { sdp: answer }
                    })
                }
            })

            channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
                if (!isMentor) {
                    // Client receives the mentor's answer
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
                }
            })

            channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
                // Accept ICE candidates from the other party
                const fromOtherParty = isMentor
                    ? payload.from === 'client'
                    : payload.from === 'mentor'
                if (fromOtherParty && payload.candidate) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
                    } catch (e) {
                        console.error('Error adding ICE candidate:', e)
                    }
                }
            })

            // 8. Subscribe to the channel, then if client — create the initial offer
            await channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    if (!isMentor) {
                        // Client initiates the call by sending an offer
                        const offer = await pc.createOffer()
                        await pc.setLocalDescription(offer)
                        channel.send({
                            type: 'broadcast',
                            event: 'offer',
                            payload: { sdp: offer }
                        })
                    }
                }
            })

        } catch (e) {
            console.error('Error starting call:', e)
            setCallStatus('error')
        }
    }, [sessionId, isMentor])

    // Toggle Microphone
    const toggleMic = useCallback(() => {
        setIsMuted(m => {
            const willBeMuted = !m
            const stream = localStreamRef.current
            if (stream) {
                stream.getAudioTracks().forEach(track => {
                    track.enabled = !willBeMuted
                })
            }
            return willBeMuted
        })
    }, [])

    // Toggle Camera
    const toggleCamera = useCallback(() => {
        setIsCameraOff(c => {
            const willBeOff = !c
            const stream = localStreamRef.current
            if (stream) {
                stream.getVideoTracks().forEach(track => {
                    track.enabled = !willBeOff
                })
            }
            return willBeOff
        })
    }, [])

    // End Call — cleanup everything
    const endCall = useCallback(() => {
        const stream = localStreamRef.current
        if (stream) stream.getTracks().forEach(track => track.stop())
        if (peerRef.current) peerRef.current.close()
        if (channelRef.current) supabase.removeChannel(channelRef.current)
        setLocalStream(null)
        setRemoteStream(null)
        setCallStatus('ended')
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            endCall()
        }
    }, [endCall])

    // Audio level indicators
    const isLocalSpeaking = useAudioLevel(localStream)
    const isRemoteSpeaking = useAudioLevel(remoteStream)

    return {
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        isLocalSpeaking,
        callStatus,
        permissionsGranted,
        startCall,
        requestPermissions,
        toggleMic,
        toggleCamera,
        endCall,
    }
}
