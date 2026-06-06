/**
 * Analytics Routes
 */

const express = require('express');
const { getDb } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET dashboard analytics (public stats + private if authenticated)
router.get('/dashboard', authenticate, (req, res) => {
  const db = getDb();

  const totalSimulations = db.prepare('SELECT COUNT(*) as c FROM simulation_history').get().c;
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalLessons = db.prepare('SELECT COUNT(*) as c FROM lessons WHERE is_active = 1').get().c;
  const completedLessons = db.prepare("SELECT COUNT(*) as c FROM user_progress WHERE completed = 1").get().c;

  const simByType = db.prepare(`
    SELECT simulation_type, COUNT(*) as count FROM simulation_history GROUP BY simulation_type ORDER BY count DESC
  `).all();

  const dailyActivity = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM analytics
    WHERE created_at >= datetime('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY date
  `).all();

  const topEvents = db.prepare(`
    SELECT event_type, COUNT(*) as count FROM analytics GROUP BY event_type ORDER BY count DESC LIMIT 10
  `).all();

  // User-specific analytics
  const userSimulations = db.prepare(`
    SELECT simulation_type, COUNT(*) as count FROM simulation_history WHERE user_id = ? GROUP BY simulation_type
  `).all(req.user.id);

  const userProgress = db.prepare(`
    SELECT COUNT(*) as completed FROM user_progress WHERE user_id = ? AND completed = 1
  `).get(req.user.id);

  const userScore = db.prepare('SELECT score, streak FROM users WHERE id = ?').get(req.user.id);

  const userAchievements = db.prepare(`
    SELECT badge_id, badge_name, earned_at FROM achievements WHERE user_id = ? ORDER BY earned_at DESC
  `).all(req.user.id);

  res.json({
    global: {
      totalSimulations,
      totalUsers,
      totalLessons,
      completedLessons,
      simByType,
      dailyActivity,
      topEvents,
    },
    user: {
      simulations: userSimulations,
      lessonsCompleted: userProgress.completed,
      score: userScore.score,
      streak: userScore.streak,
      achievements: userAchievements,
    }
  });
});

// GET public stats for landing page
router.get('/public', (req, res) => {
  const db = getDb();
  const totalSimulations = db.prepare('SELECT COUNT(*) as c FROM simulation_history').get().c;
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalLessons = db.prepare('SELECT COUNT(*) as c FROM lessons WHERE is_active = 1').get().c;
  res.json({ totalSimulations, totalUsers, totalLessons, threatCategories: 3 });
});

// POST track custom event
router.post('/event', authenticate, (req, res) => {
  const { eventType, metadata } = req.body;
  if (!eventType) return res.status(400).json({ error: 'eventType required' });
  const db = getDb();
  const { v4: uuidv4 } = require('uuid');
  db.prepare('INSERT INTO analytics (id, event_type, user_id, metadata) VALUES (?, ?, ?, ?)')
    .run(uuidv4(), eventType, req.user.id, metadata ? JSON.stringify(metadata) : null);
  res.json({ success: true });
});

module.exports = router;
