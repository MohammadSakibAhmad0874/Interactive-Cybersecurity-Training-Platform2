/**
 * Authentication Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 * POST /api/auth/logout
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { getDb } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

// ─── Register ──────────────────────────────────────────────────────────────────
router.post('/register',
  authLimiter,
  [
    body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Za-z])(?=.*\d)/),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }

      const { username, email, password } = req.body;
      const db = getDb();

      // Check uniqueness
      const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
      if (existing) {
        return res.status(409).json({ error: 'Username or email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      db.prepare(`
        INSERT INTO users (id, username, email, password, role)
        VALUES (?, ?, ?, ?, 'student')
      `).run(userId, username, email, hashedPassword);

      // Log analytics
      db.prepare("INSERT INTO analytics (id, event_type, user_id, metadata) VALUES (?, 'user_registered', ?, ?)")
        .run(uuidv4(), userId, JSON.stringify({ username }));

      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: { id: userId, username, email, role: 'student', score: 0, streak: 0 },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Login ─────────────────────────────────────────────────────────────────────
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid credentials format' });
      }

      const { email, password } = req.body;
      const db = getDb();

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        // Log failed attempt
        db.prepare("INSERT INTO analytics (id, event_type, metadata) VALUES (?, 'login_failed', ?)")
          .run(uuidv4(), JSON.stringify({ email }));
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

      // Log analytics
      db.prepare("INSERT INTO analytics (id, event_type, user_id, metadata) VALUES (?, 'user_login', ?, ?)")
        .run(uuidv4(), user.id, JSON.stringify({ username: user.username }));

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role, score: user.score, streak: user.streak },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Get Current User ──────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, email, role, avatar, bio, score, streak, created_at, last_login FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// ─── Logout (client-side token deletion; invalidate server-side if needed) ─────
router.post('/logout', authenticate, (req, res) => {
  const db = getDb();
  db.prepare("INSERT INTO analytics (id, event_type, user_id) VALUES (?, 'user_logout', ?)")
    .run(uuidv4(), req.user.id);
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
