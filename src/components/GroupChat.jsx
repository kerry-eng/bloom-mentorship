import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import './GroupChat.css'

export default function GroupChat({ group, onBack, onLeave }) {
    const { user, profile } = useAuth()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [showEmojis, setShowEmojis] = useState(false)
    const scrollRef = useRef()
    const fileRef = useRef()

    useEffect(() => {
        if (!group?.id) return

        console.log('Chat active for group:', group.name)

        // 1. Fetch initial messages
        fetchMessages()

        // 2. Subscribe to real-time updates
        const channel = supabase
            .channel(`group-chat-${group.id}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'group_messages'
            }, (payload) => {
                console.log('Real-time event:', payload.eventType, payload)
                
                if (payload.eventType === 'INSERT') {
                    if (payload.new.group_id !== group.id) return
                    if (payload.new.user_id === user.id) {
                        setMessages(prev => [...prev, { ...payload.new, profiles: profile }])
                    } else {
                        supabase.from('profiles').select('full_name, avatar_url').eq('id', payload.new.user_id).single()
                            .then(({ data }) => {
                                setMessages(prev => [...prev, { ...payload.new, profiles: data }])
                            })
                    }
                } else if (payload.eventType === 'DELETE') {
                    // old payload contains only the id for deletions
                    const deletedId = payload.old.id
                    setMessages(prev => prev.filter(m => m.id !== deletedId))
                }
            })
            .subscribe((status) => {
                console.log('RT Subscription Status:', status)
            })

        return () => supabase.removeChannel(channel)
    }, [group?.id])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function fetchMessages() {
        console.log('Fetching messages for group:', group.id)
        // Attempting a simpler join. If this fails, we'll fetch without profiles first.
        const { data, error } = await supabase
            .from('group_messages')
            .select('*, profiles:user_id(full_name, avatar_url)')
            .eq('group_id', group.id)
            .order('created_at', { ascending: true })
            .limit(100)
        
        if (error) {
            console.error('Fetch messages error (Join):', error)
            // Fallback: Fetch without profiles to at least see messages
            const { data: simpleData, error: simpleError } = await supabase
                .from('group_messages')
                .select('*')
                .eq('group_id', group.id)
                .order('created_at', { ascending: true })
            
            if (!simpleError) {
                console.log('Simple fetch (no profiles) worked:', simpleData?.length)
                setMessages(simpleData || [])
            }
        } else {
            console.log('Messages fetched with profiles:', data?.length)
            setMessages(data || [])
        }
    }

    async function handleDeleteMessage(msgId) {
        console.log('Attempting to delete message:', msgId)
        if (!window.confirm('Delete this message?')) return
        
        // Use count: 'exact' to see if a row was actually deleted
        const { error, count } = await supabase
            .from('group_messages')
            .delete({ count: 'exact' })
            .eq('id', msgId)
            .eq('user_id', user.id)

        if (error) {
            console.error('Delete error:', error)
            alert('Failed to delete message: ' + error.message)
        } else if (count === 0) {
            console.warn('Delete successful but 0 rows affected. RLS Policy likely missing.')
            alert('Message not deleted. You might not have the "Delete" Policy set in Supabase!')
        } else {
            console.log('Delete successful in DB, rows affected:', count)
            setMessages(prev => prev.filter(m => m.id !== msgId))
        }
    }

    async function handleImageUpload(e) {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        console.log('Starting upload for file:', file.name)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${group.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('chat_uploads')
            .upload(filePath, file)

        if (uploadError) {
            console.error('Upload error:', uploadError)
            alert('Upload failed: ' + uploadError.message + '. Ensure you have set Storage Policies!')
            setUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('chat_uploads')
            .getPublicUrl(filePath)

        console.log('Image uploaded successfully. Public URL:', publicUrl)

        const { error: msgError } = await supabase
            .from('group_messages')
            .insert({
                group_id: group.id,
                user_id: user.id,
                content: '',
                image_url: publicUrl
            })

        if (msgError) {
            console.error('Message insert error (image):', msgError)
            alert('Failed to send image message. Ensure image_url column exists!')
        }
        setUploading(false)
    }

    const emojis = ['❤️', '😂', '😮', '😢', '😡', '👍', '🔥', '🌸', '✨', '🙌', '🎯', '🚀', '⭐', '💯']

    async function handleSendMessage(e) {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        console.log('Sending message:', newMessage)
        setSending(true)
        try {
            const { error } = await supabase
                .from('group_messages')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    content: newMessage.trim()
                })
            
            if (error) {
                console.error('Insert error details:', error)
                throw error
            }
            console.log('Message inserted successfully')
            setNewMessage('')
        } catch (e) {
            console.error('Send error:', e)
            alert('Failed to send message. Please check the SQL setup.')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="group-chat-arch fade-in">
            <div className="group-chat-arch-bg"></div>
            <header className="chat-header-arch">
                <button className="back-btn-arch" onClick={onBack}>
                    <span className="icon">←</span>
                </button>
                <div className="header-info-arch">
                    <div className="group-icon-small">{group.icon}</div>
                    <h3>{group.name}</h3>
                </div>
                <button className="leave-btn-arch" onClick={() => { if(window.confirm('Leave this group?')) onLeave(group.id) }}>
                    Leave Group
                </button>
            </header>

            <div className="chat-messages-arch">
                {messages.length === 0 && <div className="empty-chat-arch">Start the conversation...</div>}
                {messages.map(msg => {
                    const isMe = msg.user_id === user.id
                    return (
                        <div key={msg.id} className={`message-row-arch ${isMe ? 'me' : 'them'}`}>
                            <div className="message-content-arch">
                                {!isMe && <span className="sender-name-arch">{msg.profiles?.full_name}</span>}
                                {msg.image_url ? (
                                    <div className="message-image-container">
                                        <img src={msg.image_url} alt="Shared" className="message-image-arch" />
                                    </div>
                                ) : (
                                    <div className="bubble-text-arch">{msg.content}</div>
                                )}
                                <div className="message-footer-arch">
                                    <span className="time-arch">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                    {isMe && (
                                        <button className="delete-msg-btn-arch" onClick={() => handleDeleteMessage(msg.id)} title="Delete message">
                                            &times;
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={scrollRef} />
            </div>

            {showEmojis && (
                <div className="emoji-picker-arch">
                    {emojis.map(e => (
                        <button key={e} className="emoji-btn-arch" onClick={() => { setNewMessage(prev => prev + e); setShowEmojis(false); }}>
                            {e}
                        </button>
                    ))}
                </div>
            )}

            <form className="chat-input-row-arch" onSubmit={handleSendMessage}>
                <button type="button" className="tool-btn-arch" onClick={() => setShowEmojis(!showEmojis)}>
                    😊
                </button>
                <button type="button" className="tool-btn-arch" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? '...' : '📎'}
                </button>
                <input 
                    type="file" 
                    ref={fileRef} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                />
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    disabled={sending || uploading}
                    onFocus={() => setShowEmojis(false)}
                />
                <button type="submit" className="send-btn-arch" disabled={sending || !newMessage.trim()}>
                    {sending ? '...' : (
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                        </svg>
                    )}
                </button>
            </form>
        </div>
    )
}
