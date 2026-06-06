/**
 * Admin Routes - Protected by admin role
 */

const express = require('express');
const { getDb } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

// GET overview stats
router.get('/stats', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const students = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'").get().c;
  const simulations = db.prepare('SELECT COUNT(*) as c FROM simulation_history').get().c;
  const lessons = db.prepare('SELECT COUNT(*) as c FROM lessons WHERE is_active = 1').get().c;
  const completions = db.prepare("SELECT COUNT(*) as c FROM user_progress WHERE completed = 1").get().c;
  const recentActivity = db.prepare(`
    SELECT event_type, COUNT(*) as count FROM analytics WHERE created_at >= datetime('now', '-7 days') GROUP BY event_type ORDER BY count DESC
  `).all();
  res.json({ users, students, simulations, lessons, completions, recentActivity });
});

// GET all users
router.get('/users', (req, res) => {
  const db = getDb();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const users = db.prepare(`
    SELECT id, username, email, role, score, streak, created_at, last_login FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  res.json({ users, total, page, limit });
});

// GET user detail
router.get('/users/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, email, role, score, streak, bio, created_at, last_login FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const sims = db.prepare('SELECT simulation_type, COUNT(*) as count FROM simulation_history WHERE user_id = ? GROUP BY simulation_type').all(req.params.id);
  const progress = db.prepare("SELECT COUNT(*) as c FROM user_progress WHERE user_id = ? AND completed = 1").get(req.params.id);
  res.json({ user, simulations: sims, lessonsCompleted: progress.c });
});

// DELETE user
router.delete('/users/:id', (req, res) => {
  const db = getDb();
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

// GET all simulations
router.get('/simulations', (req, res) => {
  const db = getDb();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const sims = db.prepare(`
    SELECT sh.*, u.username FROM simulation_history sh
    LEFT JOIN users u ON sh.user_id = u.id
    ORDER BY sh.created_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) as c FROM simulation_history').get().c;
  res.json({ simulations: sims, total, page, limit });
});

// GET analytics
router.get('/analytics', (req, res) => {
  const db = getDb();
  const days = parseInt(req.query.days) || 30;
  const daily = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as total, SUM(CASE WHEN event_type = 'simulation_run' THEN 1 ELSE 0 END) as simulations, SUM(CASE WHEN event_type = 'lesson_completed' THEN 1 ELSE 0 END) as lessons_completed, SUM(CASE WHEN event_type = 'user_registered' THEN 1 ELSE 0 END) as registrations
    FROM analytics WHERE created_at >= datetime('now', '-${days} days') GROUP BY DATE(created_at) ORDER BY date
  `).all();
  const events = db.prepare('SELECT event_type, COUNT(*) as count FROM analytics GROUP BY event_type ORDER BY count DESC').all();
  res.json({ daily, events });
});

// PUT toggle lesson active state
router.patch('/lessons/:id/toggle', (req, res) => {
  const db = getDb();
  const lesson = db.prepare('SELECT is_active FROM lessons WHERE id = ?').get(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  db.prepare('UPDATE lessons SET is_active = ? WHERE id = ?').run(lesson.is_active ? 0 : 1, req.params.id);
  res.json({ message: `Lesson ${lesson.is_active ? 'deactivated' : 'activated'}` });
});

module.exports = router;
