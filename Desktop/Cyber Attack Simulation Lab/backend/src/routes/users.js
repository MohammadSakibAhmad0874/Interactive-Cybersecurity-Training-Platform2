/**
 * User Profile Routes
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// GET current user full profile
router.get('/profile', authenticate, (req, res) => {
  const db = getDb();
  const user = db.prepare(`
    SELECT id, username, email, role, avatar, bio, score, streak, created_at, last_login FROM users WHERE id = ?
  `).get(req.user.id);

  const achievements = db.prepare('SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC').all(req.user.id);
  const quizAttempts = db.prepare('SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY completed_at DESC LIMIT 10').all(req.user.id);
  const recentSims = db.prepare(`
    SELECT id, simulation_type, created_at, prevented FROM simulation_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
  `).all(req.user.id);

  res.json({ user, achievements, quizAttempts, recentSimulations: recentSims });
});

// PUT update profile
router.put('/profile', authenticate,
  [
    body('username').optional().trim().isLength({ min: 3, max: 30 }),
    body('bio').optional().isLength({ max: 500 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });

    const { username, bio, avatar } = req.body;
    const db = getDb();

    if (username) {
      const taken = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user.id);
      if (taken) return res.status(409).json({ error: 'Username already taken' });
    }

    db.prepare(`
      UPDATE users SET username = COALESCE(?, username), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar), updated_at = datetime('now')
      WHERE id = ?
    `).run(username || null, bio || null, avatar || null, req.user.id);

    const updated = db.prepare('SELECT id, username, email, role, avatar, bio, score, streak FROM users WHERE id = ?').get(req.user.id);
    res.json({ user: updated });
  }
);

// PUT change password
router.put('/password', authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[A-Za-z])(?=.*\d)/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });

    const { currentPassword, newPassword } = req.body;
    const db = getDb();
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?").run(hashed, req.user.id);
    res.json({ message: 'Password updated successfully' });
  }
);

// GET user leaderboard
router.get('/leaderboard', (req, res) => {
  const db = getDb();
  const leaders = db.prepare(`
    SELECT username, score, streak, role FROM users ORDER BY score DESC LIMIT 20
  `).all();
  res.json({ leaderboard: leaders });
});

module.exports = router;
