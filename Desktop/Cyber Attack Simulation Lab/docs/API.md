# 📡 API Documentation — Cyber Attack Simulation Lab

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Bearer token in `Authorization` header  
**Content-Type:** `application/json`

---

## Authentication

### POST /auth/register
Create a new student account.

**Request Body:**
```json
{
  "username": "cyberUser42",
  "email": "user@example.com",
  "password": "SecurePass1"
}
```
**Validation:** username 3–30 chars (alphanumeric/_), email valid, password ≥8 chars with letter+digit.

**Response 201:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGci...",
  "user": { "id": "uuid", "username": "cyberUser42", "email": "user@example.com", "role": "student", "score": 0 }
}
```

---

### POST /auth/login
**Request Body:**
```json
{ "email": "admin@cyberlab.local", "password": "Admin@123" }
```
**Response 200:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "uuid", "username": "admin", "role": "admin", "score": 0 }
}
```
**Errors:** 401 Invalid credentials · 429 Rate limited (20 req/15min)

---

### GET /auth/me
**Auth:** Required  
Returns current authenticated user.

---

### POST /auth/logout
**Auth:** Required  
Logs the logout event; token invalidation is client-side.

---

## Simulations

> All simulations are **educational only** — no real attacks are executed.

### POST /simulations/sql-injection
**Auth:** Optional

**Request:**
```json
{
  "username": "' OR '1'='1",
  "password": "anything",
  "mode": "vulnerable"
}
```
`mode`: `"vulnerable"` | `"secure"`

**Response:**
```json
{
  "simulationId": "uuid",
  "attackType": "SQL Injection",
  "educationalOnly": true,
  "inputAnalysis": {
    "isInjectionDetected": true,
    "detectedPatterns": ["Boolean-based injection (OR 1=1)"],
    "riskLevel": "CRITICAL"
  },
  "queries": {
    "vulnerable": "SELECT * FROM users WHERE username = '' OR '1'='1'...",
    "secure": "SELECT * FROM users WHERE username = ? AND password = ?"
  },
  "result": { "bypassedAuth": true, "explanation": "..." },
  "prevention": { "methods": ["..."], "severity": "CVSS Score: 9.8" }
}
```

---

### POST /simulations/xss
**Request:**
```json
{ "payload": "<script>alert('XSS')</script>", "mode": "vulnerable" }
```
**Response:**
```json
{
  "inputAnalysis": { "isXSSDetected": true, "xssType": "Reflected XSS", "detectedPatterns": ["Script tag injection"] },
  "rendering": { "unsafe": "<script>...", "safe": "&lt;script&gt;..." },
  "prevention": { "methods": ["..."] }
}
```

---

### POST /simulations/brute-force
**Request:**
```json
{ "targetPassword": "password123", "attackType": "dictionary", "speed": "medium" }
```
`attackType`: `"dictionary"` | `"bruteforce"` | `"hybrid"`  
`speed`: `"slow"` | `"medium"` | `"fast"`

**Response:**
```json
{
  "passwordAnalysis": { "strengthScore": 25, "strengthLabel": "Weak", "foundInCommonList": true },
  "crackEstimate": { "averageCase": "2 seconds", "worstCase": "5 seconds", "attackSpeed": "1,000 attempts/sec" },
  "attemptTimeline": [{ "attempt": 1, "password": "password", "success": false }],
  "lockoutSimulation": { "maxAttempts": 5, "lockoutDuration": "15 minutes", "triggered": true }
}
```

---

### GET /simulations/history
**Auth:** Required  
Returns authenticated user's simulation history.

**Query Params:** `page` (default: 1), `limit` (default: 20)

---

### GET /simulations/stats
Public simulation statistics.

---

## Lessons

### GET /lessons
**Query Params:** `category`, `difficulty`, `search`

**Response:**
```json
{
  "lessons": [
    {
      "id": "uuid", "title": "SQL Injection Intro", "slug": "sql-injection-intro",
      "category": "sql-injection", "difficulty": "beginner", "duration": 15,
      "summary": "...", "tags": ["sql", "database"],
      "userProgress": { "completed": 0, "progress": 0 }
    }
  ],
  "total": 6
}
```

---

### GET /lessons/:slug
Returns full lesson content with sections.

---

### POST /lessons/:lessonId/progress
**Auth:** Required

**Request:**
```json
{ "progress": 80, "completed": false, "timeSpent": 300 }
```

---

### GET /lessons/progress/summary
**Auth:** Required  
Returns overall learning progress: completed count, total, percentage, category breakdown.

---

## Analytics

### GET /analytics/dashboard
**Auth:** Required  
Returns global platform stats + user-specific data including achievements.

### GET /analytics/public
Public counters: total simulations, users, lessons (for homepage).

### POST /analytics/event
**Auth:** Required  
Track a custom event: `{ "eventType": "page_view", "metadata": { "page": "/simulator" } }`

---

## Quiz

### GET /quiz/:category
**Categories:** `sql-injection` | `xss` | `brute-force` | `authentication` | `web-security`

Returns 10 randomized questions (without answers).

---

### POST /quiz/:category/submit
**Auth:** Required

**Request:**
```json
{ "answers": { "question-uuid-1": 1, "question-uuid-2": 0 } }
```

**Response:**
```json
{
  "score": 80, "correct": 8, "total": 10, "grade": "B",
  "xpAwarded": 80, "passedQuiz": true,
  "results": [{ "questionId": "...", "isCorrect": true, "explanation": "..." }]
}
```

---

### GET /quiz/history/me
**Auth:** Required  
Last 20 quiz attempts for the authenticated user.

---

## Users

### GET /users/profile
**Auth:** Required  
Full profile with achievements, quiz history, recent simulations.

### PUT /users/profile
**Auth:** Required  
`{ "username": "newName", "bio": "About me..." }`

### PUT /users/password
**Auth:** Required  
`{ "currentPassword": "old", "newPassword": "new8chars1" }`

### GET /users/leaderboard
Public. Top 20 users by score.

---

## Admin

> All admin endpoints require `Authorization: Bearer <admin-token>`

### GET /admin/stats
Platform overview: user counts, simulation total, lesson count, completions, recent events.

### GET /admin/users
`?page=1&limit=20` — Paginated user list.

### DELETE /admin/users/:id
Delete a non-admin user.

### GET /admin/simulations
`?limit=50` — Recent simulation history with usernames.

### GET /admin/analytics
`?days=30` — Daily breakdown of events (simulations, lessons, registrations).

### PATCH /admin/lessons/:id/toggle
Toggle lesson active/hidden status.

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request / Validation failure |
| 401 | Unauthorized — invalid or expired token |
| 403 | Forbidden — insufficient role |
| 404 | Resource not found |
| 409 | Conflict — duplicate username/email |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Rate Limits

| Endpoint Group | Window | Max Requests |
|---------------|--------|-------------|
| `/api/auth/*` | 15 min | 20 |
| All other endpoints | 15 min | 100 |
