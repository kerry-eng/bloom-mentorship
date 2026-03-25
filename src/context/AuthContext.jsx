import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id, session.user)
            else setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id, session.user)
            else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId, userData = null) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
            
            if (error && error.code === 'PGRST116') { // Row not found
                console.log('Profile not found, creating from metadata...')
                const meta = userData?.user_metadata || user?.user_metadata
                if (meta) {
                    const { data: newProfile, error: insertError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: userId,
                            full_name: meta.full_name || meta.name || 'User',
                            email: userData?.email || user?.email,
                            role: meta.role || 'client'
                        })
                        .select()
                        .single()
                    
                    if (!insertError) setProfile(newProfile)
                }
            } else {
                setProfile(data)
                
                // Aggressive check: If metadata says mentor but profile says client, AUTO-HEAL
                const meta = userData?.user_metadata || user?.user_metadata
                if (meta?.role === 'mentor' && data.role === 'client') {
                    console.log('Detected role mismatch! Upgrading to mentor...')
                    const { data: updatedProfile } = await supabase
                        .from('profiles')
                        .update({ role: 'mentor' })
                        .eq('id', userId)
                        .select()
                        .single()
                    if (updatedProfile) setProfile(updatedProfile)
                }
            }
        } catch (err) {
            console.error('Profile fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function signUp(email, password, fullName, role = 'client') {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role } }
        })
        if (error) throw error
        // Insert profile row
        if (data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: fullName,
                email,
                role: role,
                created_at: new Date().toISOString()
            })
        }
        return data
    }

    async function signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    async function signOut() {
        await supabase.auth.signOut()
    }

    async function signInWithGoogle(role = 'client') {
        const target = role === 'mentor' ? '/mentor-dashboard' : '/dashboard'
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}${target}`,
                data: { role }
            }
        })
        if (error) throw error
    }

    async function signInWithFacebook(role = 'client') {
        const target = role === 'mentor' ? '/mentor-dashboard' : '/dashboard'
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: `${window.location.origin}${target}`,
                data: { role }
            }
        })
        if (error) throw error
    }

    const isMentor = profile?.role === 'mentor'

    return (
        <AuthContext.Provider value={{ 
            user, 
            profile, 
            loading, 
            signUp, 
            signIn, 
            signOut, 
            signInWithGoogle,
            signInWithFacebook,
            isMentor: profile?.role === 'mentor' || profile?.role === 'admin' || profile?.is_super_admin,
            isSuperAdmin: profile?.is_super_admin,
            refreshProfile: fetchProfile 
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
