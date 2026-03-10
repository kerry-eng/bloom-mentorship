import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Booking from './pages/Booking'
import Dashboard from './pages/Dashboard'
import Personalization from './pages/Personalization'
import Session from './pages/Session'
import Reflections from './pages/Reflections'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import MusivePlayer from './components/MusivePlayer'
import About from './pages/About'
import Blogs from './pages/Blogs'
import Footer from './components/Footer'
import { MusicProvider } from './context/MusicContext'

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
        <MusicProvider>
            {!['/dashboard', '/auth'].includes(location.pathname) && <Navbar />}
            {!['/dashboard', '/auth'].includes(location.pathname) && <MusivePlayer />}
            <Routes>
                <Route path="/" element={<Home />} />
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
                <Route path="/session/:sessionId" element={<Session />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {!['/dashboard', '/auth'].includes(location.pathname) && <Footer />}
        </MusicProvider>
    )
}

export default App
