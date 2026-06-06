/**
 * Lessons / Learning Center Routes
 */

const express = require('express');
const { getDb } = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET all lessons (with optional category filter)
router.get('/', optionalAuth, (req, res) => {
  const db = getDb();
  const { category, difficulty, search } = req.query;

  let query = 'SELECT id, title, slug, category, difficulty, summary, order_index, duration, tags, is_active FROM lessons WHERE is_active = 1';
  const params = [];

  if (category) { query += ' AND category = ?'; params.push(category); }
  if (difficulty) { query += ' AND difficulty = ?'; params.push(difficulty); }
  if (search) { query += ' AND (title LIKE ? OR summary LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  query += ' ORDER BY category, order_index';
  const lessons = db.prepare(query).all(...params);

  // If authenticated, attach user progress
  let progressMap = {};
  if (req.user) {
    const progress = db.prepare('SELECT lesson_id, completed, progress FROM user_progress WHERE user_id = ?').all(req.user.id);
    progressMap = Object.fromEntries(progress.map(p => [p.lesson_id, p]));
  }

  const enriched = lessons.map(l => ({
    ...l,
    tags: JSON.parse(l.tags || '[]'),
    userProgress: progressMap[l.id] || { completed: 0, progress: 0 },
  }));

  res.json({ lessons: enriched, total: enriched.length });
});

// GET single lesson by slug
router.get('/:slug', optionalAuth, (req, res) => {
  const db = getDb();
  const lesson = db.prepare('SELECT * FROM lessons WHERE slug = ? AND is_active = 1').get(req.params.slug);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  let userProgress = null;
  if (req.user) {
    userProgress = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?').get(req.user.id, lesson.id);
    // Track lesson view in analytics
    db.prepare("INSERT INTO analytics (id, event_type, user_id, metadata) VALUES (?, 'lesson_viewed', ?, ?)")
      .run(uuidv4(), req.user.id, JSON.stringify({ lessonId: lesson.id, slug: lesson.slug }));
  }

  res.json({
    lesson: {
      ...lesson,
      content: JSON.parse(lesson.content || '{}'),
      tags: JSON.parse(lesson.tags || '[]'),
    },
    userProgress,
  });
});

// POST update progress
router.post('/:lessonId/progress', authenticate, (req, res) => {
  const db = getDb();
  const { progress, completed, timeSpent } = req.body;
  const { lessonId } = req.params;

  const lesson = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  const existing = db.prepare('SELECT id FROM user_progress WHERE user_id = ? AND lesson_id = ?').get(req.user.id, lessonId);

  if (existing) {
    db.prepare(`
      UPDATE user_progress SET progress = ?, completed = ?, time_spent = time_spent + ?, completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE completed_at END
      WHERE user_id = ? AND lesson_id = ?
    `).run(progress || 0, completed ? 1 : 0, timeSpent || 0, completed ? 1 : 0, req.user.id, lessonId);
  } else {
    db.prepare(`
      INSERT INTO user_progress (id, user_id, lesson_id, progress, completed, time_spent, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END)
    `).run(uuidv4(), req.user.id, lessonId, progress || 0, completed ? 1 : 0, timeSpent || 0, completed ? 1 : 0);
  }

  // Award score for completion
  if (completed) {
    db.prepare('UPDATE users SET score = score + 50 WHERE id = ?').run(req.user.id);
    db.prepare("INSERT INTO analytics (id, event_type, user_id, metadata) VALUES (?, 'lesson_completed', ?, ?)")
      .run(uuidv4(), req.user.id, JSON.stringify({ lessonId }));
    checkAndAwardBadges(req.user.id, db);
  }

  res.json({ success: true, message: completed ? 'Lesson completed! +50 XP' : 'Progress saved' });
});

// GET user's overall learning progress
router.get('/progress/summary', authenticate, (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as c FROM lessons WHERE is_active = 1').get();
  const completed = db.prepare("SELECT COUNT(*) as c FROM user_progress WHERE user_id = ? AND completed = 1").get(req.user.id);
  const inProgress = db.prepare("SELECT COUNT(*) as c FROM user_progress WHERE user_id = ? AND completed = 0 AND progress > 0").get(req.user.id);
  const categories = db.prepare(`
    SELECT l.category, COUNT(*) as total, SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as completed_count
    FROM lessons l LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = ?
    WHERE l.is_active = 1 GROUP BY l.category
  `).all(req.user.id);

  res.json({
    totalLessons: total.c,
    completedLessons: completed.c,
    inProgressLessons: inProgress.c,
    completionPercentage: total.c > 0 ? Math.round((completed.c / total.c) * 100) : 0,
    categoryProgress: categories,
  });
});

function checkAndAwardBadges(userId, db) {
  const { v4: uuidv4 } = require('uuid');
  const completedCount = db.prepare("SELECT COUNT(*) as c FROM user_progress WHERE user_id = ? AND completed = 1").get(userId).c;
  const badges = [
    { id: 'first_lesson', name: '🎯 First Steps', threshold: 1 },
    { id: 'five_lessons', name: '⚡ On a Roll', threshold: 5 },
    { id: 'all_lessons', name: '🏆 Cyber Scholar', threshold: 6 },
  ];
  for (const badge of badges) {
    if (completedCount >= badge.threshold) {
      try {
        db.prepare('INSERT OR IGNORE INTO achievements (id, user_id, badge_id, badge_name) VALUES (?, ?, ?, ?)')
          .run(uuidv4(), userId, badge.id, badge.name);
      } catch (_) { /* already awarded */ }
    }
  }
}

module.exports = router;
