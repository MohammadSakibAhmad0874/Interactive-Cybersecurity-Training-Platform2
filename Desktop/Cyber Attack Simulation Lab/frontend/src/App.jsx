import { useEffect, useState, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from './store/index.js'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import ParticleField from './components/ParticleField.jsx'

// Lazy-loaded pages
const Home          = lazy(() => import('./pages/Home.jsx'))
const Simulator     = lazy(() => import('./pages/Simulator.jsx'))
const LearningCenter= lazy(() => import('./pages/LearningCenter.jsx'))
const LessonDetail  = lazy(() => import('./pages/LessonDetail.jsx'))
const Prevention    = lazy(() => import('./pages/Prevention.jsx'))
const Analytics     = lazy(() => import('./pages/Analytics.jsx'))
const Login         = lazy(() => import('./pages/Login.jsx'))
const Register      = lazy(() => import('./pages/Register.jsx'))
const Dashboard     = lazy(() => import('./pages/Dashboard.jsx'))
const AdminPanel    = lazy(() => import('./pages/AdminPanel.jsx'))
const About         = lazy(() => import('./pages/About.jsx'))
const Quiz          = lazy(() => import('./pages/Quiz.jsx'))
const Checklist     = lazy(() => import('./pages/Checklist.jsx'))
const NotFound      = lazy(() => import('./pages/NotFound.jsx'))

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center' }}>
        <div className="terminal-cursor" style={{ width:16, height:28, display:'inline-block' }} />
        <p className="text-muted text-sm mt-md font-mono">Loading module...</p>
      </div>
    </div>
  )
}

export default function App() {
  const [booting, setBooting] = useState(true)
  const { initTheme } = useThemeStore()
  const { logout } = useAuthStore()

  useEffect(() => {
    initTheme()
    // Listen for forced logout (401)
    const handler = () => logout()
    window.addEventListener('auth:logout', handler)
    const timer = setTimeout(() => setBooting(false), 2200)
    return () => {
      window.removeEventListener('auth:logout', handler)
      clearTimeout(timer)
    }
  }, [])

  if (booting) return <LoadingScreen />

  return (
    <>
      <div className="cyber-grid" aria-hidden="true" />
      <ParticleField />
      <Navbar />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/simulator"       element={<Simulator />} />
            <Route path="/simulator/:type" element={<Simulator />} />
            <Route path="/learning"        element={<LearningCenter />} />
            <Route path="/learning/:slug"  element={<LessonDetail />} />
            <Route path="/prevention"      element={<Prevention />} />
            <Route path="/analytics"       element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/quiz"            element={<Quiz />} />
            <Route path="/quiz/:category"  element={<Quiz />} />
            <Route path="/checklist"       element={<Checklist />} />
            <Route path="/about"           element={<About />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin"           element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
            <Route path="*"               element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
