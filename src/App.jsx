import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import HomePink from './pages/HomePink'
import Auth from './pages/Auth'
import Booking from './pages/Booking'
import Dashboard from './pages/Dashboard'
import Personalization from './pages/Personalization'
import Session from './pages/Session'
import Reflections from './pages/Reflections'
import Navbar from './components/Navbar'
import MobileNavbar from './components/MobileNavbar'
import ProtectedRoute from './components/ProtectedRoute'
import MusivePlayer from './components/MusivePlayer'
import About from './pages/About'
import Blogs from './pages/Blogs'
import BlogDetail from './pages/BlogDetail'
import EditProfile from './pages/EditProfile'
import Footer from './components/Footer'
import { MusicProvider } from './context/MusicContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { getMentorAppUrl } from './config/appUrls'
import MentorDashboard from './pages/MentorDashboard'

function App() {
    const { loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-hero)' }}>
                <div className="spinner" />
            </div>
        )
    }

    return (
        <ThemeProvider>
            <MusicProvider>
                {!['/dashboard', '/mentor-dashboard', '/auth', '/reflections'].includes(location.pathname) && <Navbar />}
                {['/dashboard', '/mentor-dashboard', '/', '/about', '/reflections', '/blogs'].includes(location.pathname) && <MobileNavbar />}
                <Routes>
                    <Route path="/" element={<HomeLoader />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/booking" element={
                        <ProtectedRoute><Booking /></ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/personalization" element={
                        <ProtectedRoute><Personalization /></ProtectedRoute>
                    } />
                    <Route path="/reflections" element={
                        <ProtectedRoute><Reflections /></ProtectedRoute>
                    } />
                    <Route path="/about" element={<About />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/:blogId" element={<BlogDetail />} />
                    <Route path="/edit-profile" element={
                        <ProtectedRoute><EditProfile /></ProtectedRoute>
                    } />
                    <Route path="/mentor-dashboard" element={<MentorPortalRedirect />} />
                    <Route path="/mentor" element={
                        <ProtectedRoute mentorOnly><MentorDashboard /></ProtectedRoute>
                    } />
                    <Route path="/session/:sessionId" element={<Session />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                {!['/dashboard', '/mentor-dashboard', '/auth', '/reflections', '/edit-profile'].includes(location.pathname) && <Footer />}
            </MusicProvider>
        </ThemeProvider>
    )
}

function MentorPortalRedirect() {
    useEffect(() => {
        window.location.href = getMentorAppUrl('/dashboard')
    }, [])

    return null
}

function HomeLoader() {
    const { theme } = useTheme()
    if (theme === 'pink') return <HomePink />
    return <Home />
}

export default App
