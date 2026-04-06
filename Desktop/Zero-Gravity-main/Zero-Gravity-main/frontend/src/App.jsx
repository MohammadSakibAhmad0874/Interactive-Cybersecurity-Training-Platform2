import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import DiscoverPage from './pages/DiscoverPage'
import ProfilePage from './pages/ProfilePage'
import ChatPage from './pages/ChatPage'
import MeetupPage from './pages/MeetupPage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'
import PrivacyPage from './pages/PrivacyPage'
import ContactPage from './pages/ContactPage'
import { users as usersApi } from './services/api'

export const AuthContext = createContext(null)
export const ThemeContext = createContext(null)

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('cm_token'))
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('dm_theme') || 'dark')

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dm_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    if (token) {
      usersApi.getMe()
        .then(data => { setUser(data.user); setLoading(false) })
        .catch(() => { setToken(null); localStorage.removeItem('cm_token'); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = (newToken, userData) => {
    localStorage.setItem('cm_token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('cm_token')
    setToken(null)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading DevMatch...</p>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/"          element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
                <Route path="/login"     element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                <Route path="/register"  element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
                <Route path="/dashboard" element={user ? <Dashboard />    : <Navigate to="/login" />} />
                <Route path="/discover"  element={user ? <DiscoverPage /> : <Navigate to="/login" />} />
                <Route path="/profile"   element={user ? <ProfilePage />  : <Navigate to="/login" />} />
                <Route path="/profile/:id" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
                <Route path="/chat"      element={user ? <ChatPage />     : <Navigate to="/login" />} />
                <Route path="/chat/:userId" element={user ? <ChatPage />  : <Navigate to="/login" />} />
                <Route path="/meetups"   element={user ? <MeetupPage />   : <Navigate to="/login" />} />
                <Route path="/settings"  element={user ? <SettingsPage /> : <Navigate to="/login" />} />
                <Route path="/about"     element={<AboutPage />} />
                <Route path="/privacy"   element={<PrivacyPage />} />
                <Route path="/contact"   element={<ContactPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  )
}

export default App
