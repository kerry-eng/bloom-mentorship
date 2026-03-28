import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import MobileNavbar from './components/MobileNavbar'
import MusivePlayer from './components/MusivePlayer'
import Footer from './components/Footer'
import { MusicProvider } from './context/MusicContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { getMentorAppUrl } from './config/appUrls'
import InstallPWA from './components/InstallPWA'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const HomePink = lazy(() => import('./pages/HomePink'))
const Auth = lazy(() => import('./pages/Auth'))
const Booking = lazy(() => import('./pages/Booking'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Personalization = lazy(() => import('./pages/Personalization'))
const Session = lazy(() => import('./pages/Session'))
const Reflections = lazy(() => import('./pages/Reflections'))
const About = lazy(() => import('./pages/About'))
const Blogs = lazy(() => import('./pages/Blogs'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const Freedom = lazy(() => import('./pages/Freedom'))
const EditProfile = lazy(() => import('./pages/EditProfile'))
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'))

const LoadingSpinner = () => (
    <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
    </div>
)


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
                {['/dashboard', '/mentor-dashboard', '/', '/about', '/reflections', '/blogs', '/freedom', '/booking'].includes(location.pathname) && <MobileNavbar />}
                <InstallPWA />
                <Suspense fallback={<LoadingSpinner />}>
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
                        <Route path="/freedom" element={<Freedom />} />
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
                </Suspense>
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
