# 🗄️ Entity-Relationship Diagram — Cyber Attack Simulation Lab

## ER Diagram (Text Notation)

```
┌─────────────────────────────┐
│           USERS             │
├─────────────────────────────┤
│ PK  id          TEXT        │
│     username    TEXT UNIQUE │
│     email       TEXT UNIQUE │
│     password    TEXT        │  ← bcrypt hash, never plaintext
│     role        TEXT        │  ← 'student' | 'admin'
│     avatar      TEXT        │
│     bio         TEXT        │
│     score       INTEGER     │  ← XP points
│     streak      INTEGER     │
│     created_at  TEXT        │
│     updated_at  TEXT        │
│     last_login  TEXT        │
└──────────────┬──────────────┘
               │ 1
               │ has many
      ┌────────┴────────┐
      │                 │
      ▼ N               ▼ N
┌─────────────┐   ┌──────────────────────────┐
│USER_PROGRESS│   │    SIMULATION_HISTORY    │
├─────────────┤   ├──────────────────────────┤
│PK id   TEXT │   │ PK id          TEXT      │
│FK user_id   │   │ FK user_id     TEXT      │ ← nullable (guest)
│FK lesson_id │   │    sim_type    TEXT      │
│   progress  │   │    payload     TEXT      │ ← JSON
│   completed │   │    result      TEXT      │ ← JSON
│   time_spent│   │    prevented   INTEGER   │
│completed_at │   │    created_at  TEXT      │
└──────┬──────┘   └──────────────────────────┘
       │ N
       │ references
       ▼ 1
┌───────────────────────────────┐
│           LESSONS             │
├───────────────────────────────┤
│ PK  id          TEXT          │
│     title       TEXT          │
│     slug        TEXT UNIQUE   │
│     category    TEXT          │ ← sql-injection|xss|brute-force...
│     difficulty  TEXT          │ ← beginner|intermediate|advanced
│     content     TEXT          │ ← JSON (sections array)
│     summary     TEXT          │
│     order_index INTEGER        │
│     duration    INTEGER        │ ← minutes
│     tags        TEXT          │ ← JSON array
│     is_active   INTEGER        │ ← 0|1
│     created_at  TEXT          │
└────────────────┬──────────────┘
                 │ 1
                 │ has many
                 ▼ N
┌───────────────────────────────┐
│         QUIZ_QUESTIONS        │
├───────────────────────────────┤
│ PK  id          TEXT          │
│ FK  lesson_id   TEXT (opt)    │
│     category    TEXT          │
│     question    TEXT          │
│     options     TEXT          │ ← JSON array of strings
│     answer      INTEGER        │ ← index into options
│     explanation TEXT          │
│     difficulty  TEXT          │
│     created_at  TEXT          │
└───────────────────────────────┘

┌─────────────────────────────┐
│        QUIZ_ATTEMPTS        │
├─────────────────────────────┤
│ PK  id           TEXT       │
│ FK  user_id      TEXT       │ → USERS
│     category     TEXT       │
│     score        INTEGER    │ ← 0-100
│     total        INTEGER    │
│     answers      TEXT       │ ← JSON
│     completed_at TEXT       │
└─────────────────────────────┘

┌─────────────────────────────┐
│         ACHIEVEMENTS        │
├─────────────────────────────┤
│ PK  id         TEXT         │
│ FK  user_id    TEXT         │ → USERS
│     badge_id   TEXT         │
│     badge_name TEXT         │
│     earned_at  TEXT         │
│ UNIQUE(user_id, badge_id)   │
└─────────────────────────────┘

┌─────────────────────────────┐
│          ANALYTICS          │
├─────────────────────────────┤
│ PK  id         TEXT         │
│     event_type TEXT         │ ← user_login|simulation_run|...
│ FK  user_id    TEXT (opt)   │ → USERS (nullable)
│     metadata   TEXT         │ ← JSON
│     created_at TEXT         │
└─────────────────────────────┘

┌─────────────────────────────┐
│           SETTINGS          │
├─────────────────────────────┤
│ PK  id          TEXT        │ ← 'global'
│     theme       TEXT        │
│     maintenance INTEGER     │
│     config      TEXT        │ ← JSON
└─────────────────────────────┘
```

## Relationships Summary

| From | Relationship | To |
|------|-------------|-----|
| USERS | 1 → N | USER_PROGRESS |
| USERS | 1 → N | SIMULATION_HISTORY |
| USERS | 1 → N | QUIZ_ATTEMPTS |
| USERS | 1 → N | ACHIEVEMENTS |
| USERS | 1 → N | ANALYTICS |
| LESSONS | 1 → N | USER_PROGRESS |
| LESSONS | 1 → N | QUIZ_QUESTIONS |

## Constraints

- All passwords stored as **bcrypt hash** (cost 12) — never plaintext
- `simulation_history.user_id` is **nullable** — supports guest simulations
- `analytics.user_id` is **nullable** — public events tracked without login
- `achievements` has **UNIQUE(user_id, badge_id)** — prevents duplicate badges
- SQLite WAL mode enabled for concurrent read performance
- Foreign keys enforced at DB level: `PRAGMA foreign_keys = ON`
