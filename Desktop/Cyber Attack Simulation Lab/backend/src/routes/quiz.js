/**
 * Quiz Routes
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET quiz questions by category
router.get('/:category', optionalAuth, (req, res) => {
  const db = getDb();
  const { category } = req.params;
  const questions = db.prepare(`
    SELECT id, question, options, difficulty FROM quiz_questions WHERE category = ? ORDER BY RANDOM() LIMIT 10
  `).all(category);

  if (!questions.length) return res.status(404).json({ error: 'No questions found for this category' });

  res.json({
    category,
    questions: questions.map(q => ({ ...q, options: JSON.parse(q.options) })),
    total: questions.length,
  });
});

// POST submit quiz answers
router.post('/:category/submit', authenticate, (req, res) => {
  const db = getDb();
  const { category } = req.params;
  const { answers } = req.body; // { questionId: selectedIndex }

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Answers object required' });
  }

  const questions = db.prepare('SELECT id, question, options, answer, explanation FROM quiz_questions WHERE id IN (' +
    Object.keys(answers).map(() => '?').join(',') + ')'
  ).all(...Object.keys(answers));

  let correct = 0;
  const results = questions.map(q => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.answer;
    if (isCorrect) correct++;
    return {
      questionId: q.id,
      question: q.question,
      userAnswer,
      correctAnswer: q.answer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const score = Math.round((correct / questions.length) * 100);

  // Save attempt
  const attemptId = uuidv4();
  db.prepare(`
    INSERT INTO quiz_attempts (id, user_id, category, score, total, answers)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(attemptId, req.user.id, category, score, questions.length, JSON.stringify(results));

  // Award XP
  const xpAwarded = correct * 10;
  db.prepare('UPDATE users SET score = score + ? WHERE id = ?').run(xpAwarded, req.user.id);

  // Perfect score badge
  if (score === 100) {
    try {
      db.prepare('INSERT OR IGNORE INTO achievements (id, user_id, badge_id, badge_name) VALUES (?, ?, ?, ?)')
        .run(uuidv4(), req.user.id, `quiz_perfect_${category}`, `🎯 Quiz Master: ${category}`);
    } catch (_) {}
  }

  db.prepare("INSERT INTO analytics (id, event_type, user_id, metadata) VALUES (?, 'quiz_completed', ?, ?)")
    .run(uuidv4(), req.user.id, JSON.stringify({ category, score, correct, total: questions.length }));

  res.json({
    attemptId,
    score,
    correct,
    total: questions.length,
    xpAwarded,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
    results,
    passedQuiz: score >= 70,
  });
});

// GET user quiz history
router.get('/history/me', authenticate, (req, res) => {
  const db = getDb();
  const attempts = db.prepare(`
    SELECT id, category, score, total, completed_at FROM quiz_attempts WHERE user_id = ? ORDER BY completed_at DESC LIMIT 20
  `).all(req.user.id);
  res.json({ attempts });
});

module.exports = router;
