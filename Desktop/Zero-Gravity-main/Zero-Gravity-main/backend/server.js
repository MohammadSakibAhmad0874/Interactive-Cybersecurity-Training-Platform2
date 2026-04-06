import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'devmatch-secret-key-2026'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,        // set true in production (HTTPS)
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}

// Middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())

// --- Data Storage Helpers ---
const DATA_DIR = path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const dataFile = (name) => path.join(DATA_DIR, `${name}.json`)

function readData(name) {
  const file = dataFile(name)
  if (!fs.existsSync(file)) { fs.writeFileSync(file, '[]'); return [] }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch { return [] }
}

function writeData(name, data) {
  fs.writeFileSync(dataFile(name), JSON.stringify(data, null, 2))
}

// --- Auth Middleware (supports Bearer token AND cookie) ---
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.cm_token
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      name, email, password, country, timezone, bio,
      skills, techStack, projectInterests, role, experienceLevel
    } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    const users = readData('users')
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      country: country || '',
      timezone: timezone || '',
      bio: bio || '',
      skills: skills || [],
      techStack: techStack || [],
      projectInterests: projectInterests || [],
      role: role || '',
      experienceLevel: experienceLevel || 'beginner',
      createdAt: new Date().toISOString()
    }

    users.push(user)
    writeData('users', users)

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...safeUser } = user

    res.cookie('cm_token', token, COOKIE_OPTIONS)
    res.status(201).json({ token, user: safeUser })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const users = readData('users')
    const user = users.find(u => u.email === email)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...safeUser } = user

    res.cookie('cm_token', token, COOKIE_OPTIONS)
    res.json({ token, user: safeUser })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// Google OAuth (Simulated)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { name, email, avatar } = req.body
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    const users = readData('users')
    let user = users.find(u => u.email === email)

    if (user) {
      // Existing user — log them in
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
      const { password: _, ...safeUser } = user
      res.cookie('cm_token', token, COOKIE_OPTIONS)
      return res.json({ token, user: safeUser })
    }

    // New user — auto-register with Google profile
    user = {
      id: uuidv4(),
      name,
      email,
      password: await bcrypt.hash(uuidv4(), 10),  // random password (won't be used)
      avatar: avatar || '',
      country: '',
      timezone: '',
      bio: '',
      skills: [],
      techStack: [],
      projectInterests: [],
      role: '',
      experienceLevel: 'beginner',
      authProvider: 'google',
      availability: 'open',
      createdAt: new Date().toISOString()
    }

    users.push(user)
    writeData('users', users)

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...safeUser } = user

    res.cookie('cm_token', token, COOKIE_OPTIONS)
    res.status(201).json({ token, user: safeUser, isNew: true })
  } catch (err) {
    res.status(500).json({ error: 'Google auth failed' })
  }
})

// Logout (clears cookie)
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('cm_token')
  res.json({ status: 'ok' })
})

// ==================== USER ROUTES ====================

// Get current user
app.get('/api/users/me', authMiddleware, (req, res) => {
  const users = readData('users')
  const user = users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password, ...safeUser } = user
  res.json({ user: safeUser })
})

// Update current user
app.put('/api/users/me', authMiddleware, (req, res) => {
  const users = readData('users')
  const idx = users.findIndex(u => u.id === req.userId)
  if (idx === -1) return res.status(404).json({ error: 'User not found' })

  const allowedFields = [
    'name', 'country', 'timezone', 'bio',
    'skills', 'techStack', 'projectInterests', 'role', 'experienceLevel',
    'availability'
  ]
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) users[idx][field] = req.body[field]
  })

  writeData('users', users)
  const { password, ...safeUser } = users[idx]
  res.json({ user: safeUser })
})

// Get user by ID
app.get('/api/users/:id', authMiddleware, (req, res) => {
  const users = readData('users')
  const user = users.find(u => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password, ...safeUser } = user
  res.json({ user: safeUser })
})

// ==================== MATCHES ========================

// Get AI matches — calls Python service or falls back to local matching
app.get('/api/matches', authMiddleware, async (req, res) => {
  try {
    const users = readData('users')
    const currentUser = users.find(u => u.id === req.userId)
    if (!currentUser) return res.status(404).json({ error: 'User not found' })

    const limit = parseInt(req.query.limit) || 10

    // Try Python AI service first
    try {
      const aiRes = await fetch('http://localhost:5001/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: req.userId, users: users.map(u => ({ ...u, password: undefined })) })
      })
      if (aiRes.ok) {
        const aiData = await aiRes.json()
        return res.json({ matches: aiData.matches.slice(0, limit) })
      }
    } catch {
      // AI service not available, fall back to local scoring
    }

    // Local fallback matching — DevMatch weights: 50% skills, 30% tech stack, 20% role
    const otherUsers = users.filter(u => u.id !== req.userId)
    const matches = otherUsers.map(other => {
      const { password, ...safeOther } = other

      const skillOverlap = (currentUser.skills || []).filter(s => (other.skills || []).includes(s)).length
      const techOverlap = (currentUser.techStack || []).filter(t => (other.techStack || []).includes(t)).length
      const roleMatch = currentUser.role && other.role && currentUser.role !== other.role ? 1 : 0

      const maxSkills = Math.max((currentUser.skills || []).length, (other.skills || []).length, 1)
      const maxTech = Math.max((currentUser.techStack || []).length, (other.techStack || []).length, 1)

      const score = Math.round(
        ((skillOverlap / maxSkills) * 0.50 +
         (techOverlap / maxTech) * 0.30 +
         roleMatch * 0.20) * 100
      )

      return { ...safeOther, matchScore: Math.max(score, 15) }
    })

    matches.sort((a, b) => b.matchScore - a.matchScore)
    res.json({ matches: matches.slice(0, limit) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get matches' })
  }
})

// ==================== CHAT ===========================

// --- Auto-Reply Generator ---
function generateAutoReply(sender, recipient) {
  const users = readData('users')
  const recipientUser = users.find(u => u.id === recipient)
  const senderUser = users.find(u => u.id === sender)

  if (!recipientUser) return null

  const name = recipientUser.name || 'Developer'
  const firstName = name.split(' ')[0]
  const senderFirst = senderUser?.name?.split(' ')[0] || 'there'
  const role = recipientUser.role?.replace(/_/g, ' ') || 'Developer'
  const skills = recipientUser.skills || []
  const techStack = recipientUser.techStack || []
  const experience = recipientUser.experienceLevel || 'beginner'
  const interests = recipientUser.projectInterests || []
  const availability = recipientUser.availability || 'open'
  const country = recipientUser.country || ''

  // Varied greetings
  const greetings = [
    `Hey ${senderFirst}! 👋 Thanks for reaching out!`,
    `Hi ${senderFirst}! Great to connect with you! 🙌`,
    `Hello ${senderFirst}! Glad you messaged me! ✨`,
    `Hey there ${senderFirst}! 🚀 Nice to hear from you!`,
    `Hi ${senderFirst}! Excited to connect! 💡`
  ]
  const greeting = greetings[Math.floor(Math.random() * greetings.length)]

  // Build profile summary
  const expEmoji = { beginner: '🌱', intermediate: '⚡', advanced: '🚀' }
  const expLabel = experience.charAt(0).toUpperCase() + experience.slice(1)

  let profileLines = []
  profileLines.push(`I'm ${firstName}, a ${role} developer${country ? ` based in ${country}` : ''}.`)
  profileLines.push(`${expEmoji[experience] || '⚡'} Experience: ${expLabel}`)

  if (skills.length > 0) {
    profileLines.push(`🛠️ Skills: ${skills.slice(0, 5).join(', ')}${skills.length > 5 ? ` +${skills.length - 5} more` : ''}`)
  }
  if (techStack.length > 0) {
    profileLines.push(`💻 Tech Stack: ${techStack.slice(0, 4).join(', ')}${techStack.length > 4 ? ` +${techStack.length - 4} more` : ''}`)
  }
  if (interests.length > 0) {
    profileLines.push(`🎯 Interested in: ${interests.slice(0, 3).join(', ')}`)
  }

  // Availability status
  const availabilityMessages = {
    open: `\n✅ I'm currently **open for collaboration** and looking to team up! Let's discuss ideas and see how we can build something great together.`,
    busy: `\n⏳ I'm currently a bit busy with other projects, but feel free to share your idea — I'll get back to you soon!`,
    unavailable: `\n🔴 I'm not available right now for new projects, but I appreciate you reaching out! Let's stay connected.`
  }
  const availMsg = availabilityMessages[availability] || availabilityMessages.open

  // Closing lines
  const closings = [
    `Looking forward to chatting more! 🤝`,
    `Let me know what project you have in mind! 🎯`,
    `Would love to hear about your hackathon idea! 💡`,
    `Let's make something amazing together! 🔥`,
    `Feel free to share more about your project! 🌟`
  ]
  const closing = closings[Math.floor(Math.random() * closings.length)]

  const fullReply = `${greeting}\n\n${profileLines.join('\n')}${availMsg}\n\n${closing}`

  return fullReply
}

// Send message (with auto-reply)
app.post('/api/chat/send', authMiddleware, (req, res) => {
  const { recipientId, text } = req.body
  if (!recipientId || !text) return res.status(400).json({ error: 'recipientId and text are required' })

  const chats = readData('chats')
  const message = {
    id: uuidv4(),
    senderId: req.userId,
    recipientId,
    text,
    timestamp: new Date().toISOString()
  }

  chats.push(message)

  // --- Generate auto-reply ---
  // Check if this is the first message in the conversation
  const existingMessages = chats.filter(m =>
    (m.senderId === req.userId && m.recipientId === recipientId) ||
    (m.senderId === recipientId && m.recipientId === req.userId)
  )
  // Auto-reply if it's the first message from the sender, or if no auto-reply has been sent yet
  const autoReplies = existingMessages.filter(m => m.isAutoReply && m.senderId === recipientId)

  let autoReply = null
  if (autoReplies.length === 0) {
    // First interaction  — send full profile auto-reply
    const replyText = generateAutoReply(req.userId, recipientId)
    if (replyText) {
      autoReply = {
        id: uuidv4(),
        senderId: recipientId,
        recipientId: req.userId,
        text: replyText,
        timestamp: new Date(Date.now() + 2000).toISOString(), // 2s delay
        isAutoReply: true
      }
      chats.push(autoReply)
    }
  } else {
    // Subsequent messages — send a shorter contextual response
    const quickReplies = [
      `Thanks for the message! I'll review this and get back to you shortly 📩`,
      `Got it! Let me think about this and respond properly soon 🤔`,
      `Noted! I appreciate you sharing that — let's sync up on this 🤝`,
      `Thanks! I'm excited about this — will respond in detail soon ✨`,
      `Received! Looking forward to diving deeper into this 🚀`
    ]
    autoReply = {
      id: uuidv4(),
      senderId: recipientId,
      recipientId: req.userId,
      text: quickReplies[Math.floor(Math.random() * quickReplies.length)],
      timestamp: new Date(Date.now() + 2000).toISOString(),
      isAutoReply: true
    }
    chats.push(autoReply)
  }

  writeData('chats', chats)
  res.status(201).json({ message, autoReply })
})

// Get chat history
app.get('/api/chat/:userId', authMiddleware, (req, res) => {
  const chats = readData('chats')
  const otherUserId = req.params.userId

  const messages = chats.filter(m =>
    (m.senderId === req.userId && m.recipientId === otherUserId) ||
    (m.senderId === otherUserId && m.recipientId === req.userId)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  res.json({ messages })
})

// ==================== MEETUPS ========================

// Create meetup
app.post('/api/meetups', authMiddleware, (req, res) => {
  const { partnerId, title, date, time, duration, notes } = req.body

  const meetups = readData('meetups')
  const meetup = {
    id: uuidv4(),
    organizerId: req.userId,
    partnerId: partnerId || null,
    title: title || 'Team Sync Session',
    date,
    time,
    duration: duration || '30',
    notes: notes || '',
    createdAt: new Date().toISOString()
  }

  meetups.push(meetup)
  writeData('meetups', meetups)
  res.status(201).json({ meetup })
})

// Get meetups
app.get('/api/meetups', authMiddleware, (req, res) => {
  const meetups = readData('meetups')
  const userMeetups = meetups.filter(m =>
    m.organizerId === req.userId || m.partnerId === req.userId
  ).sort((a, b) => new Date(a.date) - new Date(b.date))

  res.json({ meetups: userMeetups })
})

// ==================== FEEDBACK =======================

// Submit feedback
app.post('/api/feedback', authMiddleware, (req, res) => {
  const { targetUserId, rating, comment } = req.body

  const feedbacks = readData('feedback')
  const feedback = {
    id: uuidv4(),
    fromUserId: req.userId,
    targetUserId,
    rating,
    comment: comment || '',
    createdAt: new Date().toISOString()
  }

  feedbacks.push(feedback)
  writeData('feedback', feedbacks)

  // Forward to Python AI service for model training
  fetch('http://localhost:5001/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback)
  }).catch(() => {}) // Non-blocking

  res.status(201).json({ feedback })
})

// ==================== HEALTH =========================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'devmatch-backend', timestamp: new Date().toISOString() })
})

// ==================== START ==========================

app.listen(PORT, () => {
  console.log(`⚡ DevMatch Backend running on http://localhost:${PORT}`)
})
