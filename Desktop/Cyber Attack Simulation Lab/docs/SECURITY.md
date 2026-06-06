# 🔐 Security Considerations — Cyber Attack Simulation Lab

## Core Security Principle

> **This platform NEVER executes real attacks.** All simulations are educational demonstrations only.

---

## 1. No Real Attack Execution

Every "attack" route in `/api/simulations/` performs **static analysis only**:

- **SQL Injection**: The `vulnerableQuery` string is constructed for display purposes only — it is **never passed to a real database engine**. All actual DB queries use parameterized statements.
- **XSS**: The "unsafe" payload is returned as a plain JSON string — it is **never rendered as HTML** server-side. The frontend displays it inside `textContent`, not `innerHTML`.
- **Brute Force**: The attack timeline is **mathematically simulated** based on password entropy — no actual login attempts are made against any system.

---

## 2. Authentication Security

| Control | Implementation |
|---------|---------------|
| Password hashing | bcrypt with cost factor **12** |
| Token type | JWT HS256, signed with environment secret |
| Token expiry | Configurable (default: 7 days) |
| Token storage | localStorage (client-side) |
| Role enforcement | Middleware checks on every protected route |
| Login rate limiting | **20 requests per 15 minutes** per IP |
| Global rate limiting | **100 requests per 15 minutes** per IP |

---

## 3. Database Security

| Control | Implementation |
|---------|---------------|
| Query type | **100% parameterized** via better-sqlite3 |
| Foreign keys | `PRAGMA foreign_keys = ON` |
| WAL mode | `PRAGMA journal_mode = WAL` |
| Stored passwords | bcrypt hash only — no plaintext |
| DB file location | Local filesystem, not exposed via API |
| Privilege level | Application uses single local file — no network DB exposure |

---

## 4. HTTP Security Headers (via Helmet.js)

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 5. Input Validation

All mutation endpoints use `express-validator`:

- **Username**: 3–30 chars, alphanumeric + underscore only
- **Email**: RFC-compliant email format, normalized
- **Password**: ≥8 chars, requires letter + digit minimum
- **Request body**: size-limited to 10MB via Express body parser

---

## 6. CORS Policy

Strict origin allowlist — only the configured `FRONTEND_URL` is permitted:

```javascript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
})
```

---

## 7. Production Deployment Checklist

- [ ] Change `JWT_SECRET` to a cryptographically random 64-char string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (TLS termination at load balancer or Nginx)
- [ ] Add `Strict-Transport-Security` header
- [ ] Restrict SQLite volume permissions (mode 600)
- [ ] Set up log aggregation and alerting
- [ ] Review and tighten CSP directives
- [ ] Enable automated dependency vulnerability scanning (npm audit)
- [ ] Set `SameSite=Strict` on any cookies

---

## 8. Known Educational Limitations

Since this is an educational platform:

1. Tokens are stored in `localStorage` rather than `httpOnly` cookies for simplicity. Production apps should use `httpOnly` cookies.
2. There is no password reset flow (email infrastructure not included).
3. The admin default password (`Admin@123`) should be changed immediately in production.

---

## 9. Responsible Use

This platform is intended for:
- ✅ Cybersecurity students and learners
- ✅ Developer education and training
- ✅ Academic institutions and classrooms
- ✅ Security awareness programs

This platform must **NOT** be used to:
- ❌ Attack real websites or systems
- ❌ Develop real exploit tooling
- ❌ Bypass authentication on unauthorized systems
- ❌ Any activity that violates applicable law
