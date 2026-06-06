/**
 * Database Configuration & Initialization
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses sql.js (SQLite compiled to WebAssembly) instead of a native addon.
 * This means ZERO native compilation — works on any Node.js version on any OS.
 *
 * API COMPATIBILITY: DbWrapper exposes the same synchronous interface as
 * better-sqlite3 (.prepare().run() / .get() / .all() / .exec() / .pragma())
 * so all existing route handlers work without modification.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/cyber_lab.db');

let db; // Singleton DbWrapper

// ═══════════════════════════════════════════════════════════════════════════════
// DbWrapper — better-sqlite3 compatible API on top of sql.js
// ═══════════════════════════════════════════════════════════════════════════════
class DbWrapper {
  constructor(sqlDb, resolvedPath) {
    this._db   = sqlDb;        // sql.js Database instance
    this._path = resolvedPath; // File path for persistence
  }

  /** Flush in-memory WASM database to the local SQLite file */
  _save() {
    try {
      const data = this._db.export();
      const dir  = path.dirname(this._path);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this._path, Buffer.from(data));
    } catch (err) {
      console.error('[DB] Persist error:', err.message);
    }
  }

  /** Normalise variadic / array bind-parameters to a plain array or null */
  _norm(args) {
    if (!args || args.length === 0) return null;
    if (args.length === 1 && Array.isArray(args[0])) return args[0];
    return Array.from(args);
  }

  // ─── better-sqlite3 compatible methods ──────────────────────────────────────

  /** Execute multi-statement DDL (CREATE TABLE, etc.)  No bind params. */
  exec(sql) {
    this._db.exec(sql);
    this._save();
    return this;
  }

  /** PRAGMA helper — silently ignores unsupported pragmas (e.g. WAL in WASM) */
  pragma(pragma) {
    try { this._db.run(`PRAGMA ${pragma}`); } catch (_) {}
    return this;
  }

  /**
   * Prepare a statement.
   * Returns { run(...), get(...), all(...) } matching the better-sqlite3 API.
   */
  prepare(sql) {
    const self = this;
    return {
      /** Execute a write statement (INSERT / UPDATE / DELETE) */
      run(...args) {
        const p = self._norm(args);
        self._db.run(sql, p ?? undefined);
        self._save();
        return { changes: self._db.getRowsModified() };
      },

      /** Fetch the first matching row as a plain object, or undefined */
      get(...args) {
        const p    = self._norm(args);
        const stmt = self._db.prepare(sql);
        if (p) stmt.bind(p);
        let row;
        if (stmt.step()) row = stmt.getAsObject();
        stmt.free();
        return row;
      },

      /** Fetch all matching rows as an array of plain objects */
      all(...args) {
        const p    = self._norm(args);
        const stmt = self._db.prepare(sql);
        if (p) stmt.bind(p);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton accessor
// ═══════════════════════════════════════════════════════════════════════════════
function getDb() {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initialise (called once at server startup)
// ═══════════════════════════════════════════════════════════════════════════════
async function initializeDatabase() {
  // Boot the WASM engine
  const SQL = await initSqlJs();

  const resolvedPath = path.resolve(DB_PATH);
  const dbDir = path.dirname(resolvedPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  // Load from file if it exists, otherwise create fresh
  let sqlDb;
  if (fs.existsSync(resolvedPath)) {
    const buf = fs.readFileSync(resolvedPath);
    sqlDb = new SQL.Database(buf);
    console.log('📂 Loaded existing database from disk');
  } else {
    sqlDb = new SQL.Database();
    console.log('🆕 Creating new SQLite database (sql.js WASM)');
  }

  db = new DbWrapper(sqlDb, resolvedPath);
  db.pragma('foreign_keys = ON');

  // ─── Create Tables ───────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      username    TEXT UNIQUE NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'student',
      avatar      TEXT,
      bio         TEXT,
      score       INTEGER NOT NULL DEFAULT 0,
      streak      INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      last_login  TEXT
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      category    TEXT NOT NULL,
      difficulty  TEXT NOT NULL,
      content     TEXT NOT NULL,
      summary     TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      duration    INTEGER NOT NULL DEFAULT 10,
      tags        TEXT,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id           TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL,
      lesson_id    TEXT NOT NULL,
      completed    INTEGER NOT NULL DEFAULT 0,
      progress     INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      time_spent   INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS simulation_history (
      id              TEXT PRIMARY KEY,
      user_id         TEXT,
      simulation_type TEXT NOT NULL,
      payload         TEXT,
      result          TEXT,
      detection_time  INTEGER,
      prevented       INTEGER NOT NULL DEFAULT 1,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id          TEXT PRIMARY KEY,
      event_type  TEXT NOT NULL,
      user_id     TEXT,
      metadata    TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id          TEXT PRIMARY KEY,
      lesson_id   TEXT,
      category    TEXT NOT NULL,
      question    TEXT NOT NULL,
      options     TEXT NOT NULL,
      answer      INTEGER NOT NULL,
      explanation TEXT,
      difficulty  TEXT NOT NULL DEFAULT 'beginner',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id           TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL,
      category     TEXT NOT NULL,
      score        INTEGER NOT NULL DEFAULT 0,
      total        INTEGER NOT NULL DEFAULT 0,
      answers      TEXT,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      badge_id    TEXT NOT NULL,
      badge_name  TEXT NOT NULL,
      earned_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id          TEXT PRIMARY KEY DEFAULT 'global',
      theme       TEXT NOT NULL DEFAULT 'dark',
      maintenance INTEGER NOT NULL DEFAULT 0,
      config      TEXT
    );
  `);

  // ─── Seed Data ───────────────────────────────────────────────────────────────
  await seedAdmin();
  await seedLessons();
  await seedQuizQuestions();
  await seedSettings();

  db._save();
  console.log('✅ Database initialized successfully');
  return db;
}

// ─── Seed: Admin user ────────────────────────────────────────────────────────
async function seedAdmin() {
  const { v4: uuidv4 } = require('uuid');
  const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!adminExists) {
    const hash = await bcrypt.hash('Admin@123', 12);
    db.prepare(`INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)`)
      .run(uuidv4(), 'admin', 'admin@cyberlab.local', hash, 'admin');
    console.log('✅ Default admin created  →  admin@cyberlab.local / Admin@123');
  }
}

// ─── Seed: Lessons ───────────────────────────────────────────────────────────
async function seedLessons() {
  const { v4: uuidv4 } = require('uuid');
  const count = db.prepare('SELECT COUNT(*) as c FROM lessons').get();
  if (count.c > 0) return;

  const lessons = [
    {
      id: uuidv4(), title: 'Introduction to SQL Injection', slug: 'sql-injection-intro',
      category: 'sql-injection', difficulty: 'beginner', order_index: 1, duration: 15,
      summary: 'Learn the fundamentals of SQL Injection attacks and how they exploit database vulnerabilities.',
      tags: JSON.stringify(['sql', 'database', 'injection']),
      content: JSON.stringify({
        sections: [
          { heading: 'What is SQL Injection?', body: 'SQL Injection (SQLi) is a web security vulnerability that allows an attacker to interfere with the queries that an application makes to its database. It generally allows an attacker to view data that they are not normally able to retrieve.' },
          { heading: 'How Does It Work?', body: "When user input is not properly sanitized and is directly concatenated into SQL queries, an attacker can modify the query logic. For example: SELECT * FROM users WHERE username = '\" + username + \"' AND password = '\" + password + \"'" },
          { heading: 'Types of SQL Injection', body: 'In-band SQLi (Classic), Inferential SQLi (Blind), and Out-of-band SQLi are the three main categories. Each has different detection and exploitation techniques.' },
          { heading: 'Real-World Impact', body: 'SQL injection has been responsible for some of the largest data breaches in history. The 2009 Heartland Payment Systems breach exposed 130 million credit card numbers via SQL injection.' },
          { heading: 'OWASP Rating', body: 'SQL Injection is consistently ranked in OWASP Top 10 Web Application Security Risks, making it one of the most critical vulnerabilities to understand and prevent.' },
        ],
      }),
    },
    {
      id: uuidv4(), title: 'Advanced SQL Injection Techniques', slug: 'sql-injection-advanced',
      category: 'sql-injection', difficulty: 'advanced', order_index: 2, duration: 25,
      summary: 'Explore blind SQL injection, time-based attacks, and advanced exploitation strategies.',
      tags: JSON.stringify(['sql', 'blind-injection', 'advanced']),
      content: JSON.stringify({
        sections: [
          { heading: 'Blind SQL Injection', body: 'Blind SQLi occurs when the application does not return query results directly. Attackers use boolean conditions and time delays to extract data one bit at a time.' },
          { heading: 'Time-Based Attacks', body: 'Using SLEEP() or WAITFOR DELAY commands, attackers can infer information based on how long the server takes to respond.' },
          { heading: 'Second-Order Injection', body: 'The payload is stored in the database and executed later when retrieved and used in another query — often bypassing basic input sanitization.' },
          { heading: 'Union-Based Extraction', body: 'UNION SELECT allows attackers to append additional SELECT statements to retrieve data from other tables.' },
          { heading: 'Prevention Strategies', body: 'Parameterized queries, stored procedures, input validation, WAF deployment, and least-privilege database accounts are the key defenses.' },
        ],
      }),
    },
    {
      id: uuidv4(), title: 'Cross-Site Scripting (XSS) Fundamentals', slug: 'xss-fundamentals',
      category: 'xss', difficulty: 'beginner', order_index: 1, duration: 20,
      summary: 'Understand how XSS attacks inject malicious scripts into web pages viewed by other users.',
      tags: JSON.stringify(['xss', 'javascript', 'client-side']),
      content: JSON.stringify({
        sections: [
          { heading: 'What is XSS?', body: 'Cross-Site Scripting (XSS) attacks are a type of injection in which malicious scripts are injected into otherwise benign and trusted websites.' },
          { heading: 'Reflected XSS', body: 'The malicious script comes from the current HTTP request. The script is embedded in a link and only affects users who click on that link.' },
          { heading: 'Stored XSS', body: "Also known as persistent XSS, the script is stored on the target server's database and executed every time the stored content is retrieved." },
          { heading: 'DOM-Based XSS', body: 'The vulnerability exists in client-side code rather than server-side. The payload is executed as a result of modifying the DOM environment in the victim browser.' },
          { heading: 'Impact', body: 'XSS can lead to session hijacking, credential theft, malware distribution, and website defacement.' },
        ],
      }),
    },
    {
      id: uuidv4(), title: 'Brute Force Attack Defense', slug: 'brute-force-defense',
      category: 'brute-force', difficulty: 'beginner', order_index: 1, duration: 12,
      summary: 'Learn how brute force attacks work and how to protect authentication systems against them.',
      tags: JSON.stringify(['brute-force', 'authentication', 'password']),
      content: JSON.stringify({
        sections: [
          { heading: 'What is Brute Force?', body: 'A brute force attack consists of systematically checking all possible passwords or passphrases until the correct one is found.' },
          { heading: 'Dictionary Attacks', body: 'Instead of random characters, dictionary attacks use common words, phrases, and previously leaked passwords for much faster cracking.' },
          { heading: 'Credential Stuffing', body: 'Using large databases of leaked username/password pairs to gain unauthorized access to user accounts through large-scale automated login requests.' },
          { heading: 'Rate Limiting', body: 'Implement delays between login attempts, account lockouts after N failures, and CAPTCHA challenges to slow automated attacks.' },
          { heading: 'Multi-Factor Authentication', body: 'MFA is the single most effective defense against brute force and credential stuffing attacks. Even if the password is compromised, the account remains secure.' },
        ],
      }),
    },
    {
      id: uuidv4(), title: 'Password Security Best Practices', slug: 'password-security',
      category: 'authentication', difficulty: 'beginner', order_index: 1, duration: 10,
      summary: 'Master password hashing, salting, and secure storage techniques.',
      tags: JSON.stringify(['password', 'hashing', 'bcrypt']),
      content: JSON.stringify({
        sections: [
          { heading: 'Never Store Plaintext', body: 'Passwords must always be hashed using a one-way function. Never store passwords in plaintext or using reversible encryption.' },
          { heading: 'Use Strong Hashing Algorithms', body: 'Use bcrypt, Argon2, or scrypt — algorithms designed specifically for password hashing that are intentionally slow to prevent brute force attacks.' },
          { heading: 'Salting', body: 'A salt is random data added to the password before hashing. This prevents rainbow table attacks and ensures identical passwords produce different hashes.' },
          { heading: 'Password Policies', body: 'Enforce minimum length (12+ characters), complexity requirements, and check against known breached password databases using services like HaveIBeenPwned.' },
          { heading: 'Secure Reset Flows', body: 'Password reset links must be time-limited, single-use, and sent over a secure channel. Never send passwords in email.' },
        ],
      }),
    },
    {
      id: uuidv4(), title: 'Web Security Fundamentals', slug: 'web-security-basics',
      category: 'web-security', difficulty: 'beginner', order_index: 1, duration: 18,
      summary: 'A comprehensive overview of core web security principles every developer must know.',
      tags: JSON.stringify(['https', 'headers', 'cors', 'csp']),
      content: JSON.stringify({
        sections: [
          { heading: 'HTTPS Everywhere', body: 'Always use HTTPS to encrypt data in transit. HTTP Strict Transport Security (HSTS) ensures browsers always use HTTPS even if the user types HTTP.' },
          { heading: 'Security Headers', body: 'Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers provide powerful browser-enforced security controls.' },
          { heading: 'CORS Policy', body: 'Cross-Origin Resource Sharing must be carefully configured to only allow trusted origins to access your API endpoints.' },
          { heading: 'OWASP Top 10', body: 'The OWASP Top 10 is the standard awareness document for web application security. Understanding these 10 risks is essential for every developer.' },
          { heading: 'Principle of Least Privilege', body: 'Every component — users, services, applications — should have only the minimum permissions required to perform their function.' },
        ],
      }),
    },
  ];

  const insert = db.prepare(`
    INSERT INTO lessons (id, title, slug, category, difficulty, content, summary, order_index, duration, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const l of lessons) {
    insert.run(l.id, l.title, l.slug, l.category, l.difficulty, l.content, l.summary, l.order_index, l.duration, l.tags);
  }
  console.log(`✅ Seeded ${lessons.length} lessons`);
}

// ─── Seed: Quiz Questions ─────────────────────────────────────────────────────
async function seedQuizQuestions() {
  const { v4: uuidv4 } = require('uuid');
  const count = db.prepare('SELECT COUNT(*) as c FROM quiz_questions').get();
  if (count.c > 0) return;

  const questions = [
    { category: 'sql-injection', question: 'Which SQL keyword is most commonly used in SQL injection attacks to append additional queries?', options: JSON.stringify(['DROP', 'UNION', 'SELECT', 'INSERT']), answer: 1, difficulty: 'beginner', explanation: 'UNION is used to combine the results of two SELECT statements, allowing attackers to retrieve data from other tables.' },
    { category: 'sql-injection', question: 'What is the most effective defense against SQL injection?', options: JSON.stringify(['Input length limits', 'Parameterized queries / Prepared statements', 'Blocking special characters', 'Using stored procedures only']), answer: 1, difficulty: 'beginner', explanation: 'Parameterized queries ensure user input is always treated as data, never as SQL code.' },
    { category: 'sql-injection', question: "What does the payload: ' OR '1'='1 do in a vulnerable login form?", options: JSON.stringify(['Crashes the database', 'Logs in without a valid password', 'Deletes all records', 'Creates a new user']), answer: 1, difficulty: 'beginner', explanation: 'This payload makes the WHERE clause always evaluate to true, bypassing the password check.' },
    { category: 'xss', question: "Which type of XSS stores the malicious script in the target's database?", options: JSON.stringify(['Reflected XSS', 'DOM-based XSS', 'Stored XSS', 'Blind XSS']), answer: 2, difficulty: 'beginner', explanation: 'Stored (persistent) XSS stores the payload in the database and executes it for every user who views the infected content.' },
    { category: 'xss', question: 'Which HTTP header best prevents XSS attacks?', options: JSON.stringify(['X-Frame-Options', 'Content-Security-Policy', 'Strict-Transport-Security', 'X-XSS-Protection']), answer: 1, difficulty: 'intermediate', explanation: 'Content-Security-Policy (CSP) defines which scripts are allowed to execute, effectively blocking XSS payloads.' },
    { category: 'brute-force', question: 'What mechanism automatically locks an account after multiple failed login attempts?', options: JSON.stringify(['Rate limiting', 'Account lockout policy', 'CAPTCHA', 'MFA']), answer: 1, difficulty: 'beginner', explanation: 'Account lockout policies temporarily or permanently disable accounts after a threshold of failed attempts.' },
    { category: 'brute-force', question: 'Which attack uses previously leaked username/password pairs against multiple sites?', options: JSON.stringify(['Dictionary attack', 'Rainbow table attack', 'Credential stuffing', 'Password spraying']), answer: 2, difficulty: 'intermediate', explanation: 'Credential stuffing leverages the fact that many users reuse passwords across multiple services.' },
    { category: 'authentication', question: 'What does MFA stand for?', options: JSON.stringify(['Multiple Factor Authentication', 'Multi-Factor Authentication', 'Managed Firewall Authentication', 'Multi-File Authorization']), answer: 1, difficulty: 'beginner', explanation: 'Multi-Factor Authentication requires users to provide two or more verification factors to gain access.' },
    { category: 'web-security', question: 'What does HTTPS provide that HTTP does not?', options: JSON.stringify(['Faster speeds', 'Encrypted data transmission', 'Better SEO rankings only', 'Larger file transfers']), answer: 1, difficulty: 'beginner', explanation: 'HTTPS uses TLS/SSL to encrypt data in transit, protecting against man-in-the-middle attacks.' },
    { category: 'web-security', question: 'What is the OWASP Top 10?', options: JSON.stringify(['A list of 10 programming languages', 'The 10 most critical web application security risks', 'Ten firewall rules', 'Ten coding best practices']), answer: 1, difficulty: 'beginner', explanation: 'OWASP Top 10 is the standard awareness document representing the most critical security risks to web applications.' },
  ];

  const insertQ = db.prepare(`
    INSERT INTO quiz_questions (id, category, question, options, answer, difficulty, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const q of questions) {
    insertQ.run(uuidv4(), q.category, q.question, q.options, q.answer, q.difficulty, q.explanation);
  }
  console.log(`✅ Seeded ${questions.length} quiz questions`);
}

// ─── Seed: Global Settings ────────────────────────────────────────────────────
async function seedSettings() {
  const exists = db.prepare("SELECT id FROM settings WHERE id = 'global'").get();
  if (!exists) {
    db.prepare("INSERT INTO settings (id) VALUES ('global')").run();
  }
}

module.exports = { getDb, initializeDatabase };
