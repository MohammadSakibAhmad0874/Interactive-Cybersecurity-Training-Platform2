/**
 * Simulation Routes
 * Educational sandbox simulations ONLY - no real attacks executed
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ─── SQL Injection Simulation ──────────────────────────────────────────────────
router.post('/sql-injection', optionalAuth, (req, res) => {
  const { username, password, mode } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const safeUsername = username.replace(/'/g, "''");
  const isInjection = /('|--|;|OR\s+\d+=\d+|UNION|DROP|SELECT|INSERT|DELETE|UPDATE|EXEC|SLEEP)/i.test(username + password);

  // Build educational query representations (NEVER executed against real DB)
  const vulnerableQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const secureQuery = `SELECT * FROM users WHERE username = ? AND password = ?`;

  // Simulate what would happen
  let simulationResult;
  if (isInjection && mode === 'vulnerable') {
    simulationResult = {
      success: true,
      bypassedAuth: true,
      rowsAffected: 1,
      explanation: "⚠️ Authentication bypassed! The injected payload altered the SQL query logic, making the WHERE clause always evaluate to TRUE.",
      simulatedData: [{ id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' }]
    };
  } else if (mode === 'vulnerable') {
    simulationResult = {
      success: false,
      bypassedAuth: false,
      rowsAffected: 0,
      explanation: "Login failed. No matching user found.",
      simulatedData: []
    };
  } else {
    simulationResult = {
      success: false,
      bypassedAuth: false,
      explanation: "✅ Secure query used. Even with injection payload, the parameterized query treats the input as literal data, not SQL code.",
      parameterized: true
    };
  }

  // Detect specific attack patterns
  const detectedPatterns = [];
  if (/'\s*OR\s*'?\d+'?\s*=\s*'?\d+/i.test(username + password)) detectedPatterns.push("Boolean-based injection (OR 1=1)");
  if (/UNION\s+SELECT/i.test(username + password)) detectedPatterns.push("UNION-based data extraction");
  if (/--/.test(username + password)) detectedPatterns.push("Comment-based query truncation");
  if (/;\s*(DROP|DELETE|UPDATE|INSERT)/i.test(username + password)) detectedPatterns.push("Stacked queries / Destructive commands");
  if (/SLEEP\s*\(|WAITFOR\s+DELAY/i.test(username + password)) detectedPatterns.push("Time-based blind injection");

  // Log simulation
  const db = getDb();
  const simId = uuidv4();
  db.prepare(`
    INSERT INTO simulation_history (id, user_id, simulation_type, payload, result, prevented)
    VALUES (?, ?, 'sql-injection', ?, ?, ?)
  `).run(simId, req.user?.id || null, JSON.stringify({ username, password, mode }), JSON.stringify(simulationResult), mode !== 'vulnerable' ? 1 : 0);

  db.prepare("INSERT INTO analytics (id, event_type, user_id, metadata) VALUES (?, 'simulation_run', ?, ?)")
    .run(uuidv4(), req.user?.id || null, JSON.stringify({ type: 'sql-injection', isInjection, mode }));

  res.json({
    simulationId: simId,
    attackType: 'SQL Injection',
    educationalOnly: true,
    inputAnalysis: {
      username,
      password,
      isInjectionDetected: isInjection,
      detectedPatterns,
      riskLevel: isInjection ? 'CRITICAL' : 'SAFE',
    },
    queries: {
      vulnerable: vulnerableQuery,
      secure: secureQuery,
      sanitizedInput: safeUsername,
    },
    result: simulationResult,
    prevention: {
      methods: [
        "Use parameterized queries / prepared statements",
        "Implement input validation and sanitization",
        "Apply the principle of least privilege for DB accounts",
        "Use ORM frameworks that handle parameterization automatically",
        "Deploy a Web Application Firewall (WAF)",
        "Enable database activity monitoring",
      ],
      owasp: "https://owasp.org/www-community/attacks/SQL_Injection",
      severity: "CVSS Score: 9.8 (Critical)"
    }
  });
});

// ─── XSS Simulation ────────────────────────────────────────────────────────────
router.post('/xss', optionalAuth, (req, res) => {
  const { payload, mode } = req.body;
  if (!payload) {
    return res.status(400).json({ error: 'Payload is required' });
  }

  // Safe HTML encoding (never actually rendered as HTML in response)
  const encoded = payload
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
  const eventPattern = /on\w+\s*=/gi;
  const jsProtocol = /javascript:/gi;
  const iframePattern = /<iframe[\s\S]*?>/gi;

  const isXSS = scriptPattern.test(payload) || eventPattern.test(payload) || jsProtocol.test(payload) || iframePattern.test(payload);

  const detectedPatterns = [];
  if (/<script/i.test(payload)) detectedPatterns.push("Script tag injection");
  if (/on\w+\s*=/i.test(payload)) detectedPatterns.push("Event handler injection (onclick, onload, etc.)");
  if (/javascript:/i.test(payload)) detectedPatterns.push("JavaScript protocol in href/src");
  if (/<iframe/i.test(payload)) detectedPatterns.push("Iframe injection");
  if (/document\.cookie/i.test(payload)) detectedPatterns.push("Cookie theft attempt");
  if (/eval\s*\(/i.test(payload)) detectedPatterns.push("eval() injection");

  // Detect XSS type
  let xssType = 'None';
  if (isXSS) {
    if (payload.includes('document.cookie') || payload.includes('localStorage')) xssType = 'Stored XSS (Data Theft)';
    else if (payload.includes('fetch(') || payload.includes('XMLHttpRequest')) xssType = 'Reflected XSS (Exfiltration)';
    else xssType = 'Reflected XSS';
  }

  const db = getDb();
  const simId = uuidv4();
  db.prepare(`
    INSERT INTO simulation_history (id, user_id, simulation_type, payload, result, prevented)
    VALUES (?, ?, 'xss', ?, ?, ?)
  `).run(simId, req.user?.id || null, JSON.stringify({ payload, mode }), JSON.stringify({ isXSS, xssType }), mode === 'secure' ? 1 : 0);

  db.prepare("INSERT INTO analytics (id, event_type, user_id, metadata) VALUES (?, 'simulation_run', ?, ?)")
    .run(uuidv4(), req.user?.id || null, JSON.stringify({ type: 'xss', isXSS, mode }));

  res.json({
    simulationId: simId,
    attackType: 'Cross-Site Scripting (XSS)',
    educationalOnly: true,
    inputAnalysis: {
      originalPayload: payload,
      isXSSDetected: isXSS,
      xssType,
      detectedPatterns,
      riskLevel: isXSS ? 'HIGH' : 'SAFE',
    },
    rendering: {
      unsafe: payload,
      safe: encoded,
      mode,
    },
    prevention: {
      methods: [
        "Encode all user-supplied output (HTML entity encoding)",
        "Implement Content Security Policy (CSP) headers",
        "Use modern frameworks with auto-escaping (React, Vue, Angular)",
        "Validate and sanitize input on both client and server side",
        "Use HTTPOnly cookies to prevent JavaScript cookie access",
        "Implement Subresource Integrity (SRI) for external scripts",
      ],
      owasp: "https://owasp.org/www-community/attacks/xss/",
      severity: "CVSS Score: 6.1 (Medium) to 8.8 (High)"
    }
  });
});

// ─── Brute Force Simulation ────────────────────────────────────────────────────
router.post('/brute-force', optionalAuth, (req, res) => {
  const { targetPassword, attackType = 'dictionary', speed = 'medium' } = req.body;
  if (!targetPassword) {
    return res.status(400).json({ error: 'Target password is required for simulation' });
  }

  const speedConfig = {
    slow: { attemptsPerSecond: 10, delay: 100 },
    medium: { attemptsPerSecond: 1000, delay: 1 },
    fast: { attemptsPerSecond: 1000000, delay: 0.001 },
  };

  const config = speedConfig[speed] || speedConfig.medium;

  // Common passwords dictionary
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'letmein', 'admin', 'welcome', 'monkey', 'dragon', 'master'];
  const foundInDictionary = commonPasswords.includes(targetPassword.toLowerCase());

  // Calculate crack time based on entropy
  const charset = /[a-z]/.test(targetPassword) ? 26 : 0
    + (/[A-Z]/.test(targetPassword) ? 26 : 0)
    + (/[0-9]/.test(targetPassword) ? 10 : 0)
    + (/[^a-zA-Z0-9]/.test(targetPassword) ? 32 : 0);

  const totalCombinations = Math.pow(charset || 62, targetPassword.length);
  const secondsToCrack = totalCombinations / config.attemptsPerSecond;
  const avgSecondsToCrack = secondsToCrack / 2;

  function humanizeDuration(seconds) {
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000)} years`;
    return 'Centuries';
  }

  // Password strength score
  let strength = 0;
  if (targetPassword.length >= 8) strength += 20;
  if (targetPassword.length >= 12) strength += 20;
  if (targetPassword.length >= 16) strength += 10;
  if (/[a-z]/.test(targetPassword)) strength += 10;
  if (/[A-Z]/.test(targetPassword)) strength += 15;
  if (/[0-9]/.test(targetPassword)) strength += 10;
  if (/[^a-zA-Z0-9]/.test(targetPassword)) strength += 15;
  if (foundInDictionary) strength = Math.min(strength, 5);

  // Generate simulated attempt timeline (educational only)
  const attemptTimeline = [];
  const sampleAttempts = Math.min(10, commonPasswords.length);
  for (let i = 0; i < sampleAttempts; i++) {
    attemptTimeline.push({
      attempt: i + 1,
      password: commonPasswords[i],
      success: commonPasswords[i] === targetPassword.toLowerCase(),
      timeMs: (i + 1) * (1000 / config.attemptsPerSecond) * 1000,
    });
  }

  const db = getDb();
  const simId = uuidv4();
  db.prepare(`
    INSERT INTO simulation_history (id, user_id, simulation_type, payload, result, prevented)
    VALUES (?, ?, 'brute-force', ?, ?, 1)
  `).run(simId, req.user?.id || null,
    JSON.stringify({ targetPassword: '***REDACTED***', attackType, speed }),
    JSON.stringify({ strength, foundInDictionary, avgSecondsToCrack }));

  db.prepare("INSERT INTO analytics (id, event_type, user_id, metadata) VALUES (?, 'simulation_run', ?, ?)")
    .run(uuidv4(), req.user?.id || null, JSON.stringify({ type: 'brute-force', attackType, speed }));

  res.json({
    simulationId: simId,
    attackType: 'Brute Force Attack',
    educationalOnly: true,
    passwordAnalysis: {
      length: targetPassword.length,
      hasLowercase: /[a-z]/.test(targetPassword),
      hasUppercase: /[A-Z]/.test(targetPassword),
      hasNumbers: /[0-9]/.test(targetPassword),
      hasSpecialChars: /[^a-zA-Z0-9]/.test(targetPassword),
      foundInCommonList: foundInDictionary,
      strengthScore: Math.min(strength, 100),
      strengthLabel: strength < 20 ? 'Very Weak' : strength < 40 ? 'Weak' : strength < 60 ? 'Fair' : strength < 80 ? 'Strong' : 'Very Strong',
    },
    crackEstimate: {
      charset,
      totalCombinations: totalCombinations > Number.MAX_SAFE_INTEGER ? 'Astronomical' : totalCombinations,
      attackSpeed: `${config.attemptsPerSecond.toLocaleString()} attempts/sec`,
      worstCase: humanizeDuration(secondsToCrack),
      averageCase: humanizeDuration(avgSecondsToCrack),
    },
    attemptTimeline,
    lockoutSimulation: {
      maxAttempts: 5,
      lockoutDuration: '15 minutes',
      triggered: foundInDictionary,
      captchaTriggered: true,
    },
    prevention: {
      methods: [
        "Implement account lockout after N failed attempts",
        "Add progressive delays between attempts (exponential backoff)",
        "Require CAPTCHA after suspicious activity",
        "Enable Multi-Factor Authentication (MFA)",
        "Monitor and alert on unusual login patterns",
        "Use strong, unique passwords (16+ characters with mixed types)",
        "Deploy IP-based rate limiting",
      ],
      passwordTips: [
        "Use a passphrase: 'correct-horse-battery-staple'",
        "Never reuse passwords across sites",
        "Use a password manager",
        "Enable MFA everywhere it's available",
      ],
      owasp: "https://owasp.org/www-community/attacks/Brute_force_attack",
    }
  });
});

// ─── Get Simulation History ────────────────────────────────────────────────────
router.get('/history', authenticate, (req, res) => {
  const db = getDb();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const simulations = db.prepare(`
    SELECT id, simulation_type, payload, created_at, prevented
    FROM simulation_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.id, limit, offset);

  const total = db.prepare('SELECT COUNT(*) as c FROM simulation_history WHERE user_id = ?').get(req.user.id);

  res.json({ simulations, total: total.c, page, limit });
});

// ─── Get Simulation Stats ──────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as c FROM simulation_history').get();
  const byType = db.prepare('SELECT simulation_type, COUNT(*) as count FROM simulation_history GROUP BY simulation_type').all();
  const recent = db.prepare(`
    SELECT simulation_type, created_at FROM simulation_history ORDER BY created_at DESC LIMIT 10
  `).all();
  res.json({ total: total.c, byType, recent });
});

module.exports = router;
