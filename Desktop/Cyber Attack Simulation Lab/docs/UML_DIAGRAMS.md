# 🏗️ UML Diagrams — Cyber Attack Simulation Lab

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               React SPA (Vite)                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Pages   │ │Components│ │  Store   │ │ API Lib  │  │   │
│  │  │ (Router) │ │(Reusable)│ │(Zustand) │ │  (Axios) │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────┬─────┘  │   │
│  └───────────────────────────────────────────────┼─────────┘   │
└──────────────────────────────────────────────────┼─────────────┘
                                                   │ HTTP/REST
┌──────────────────────────────────────────────────┼─────────────┐
│                         API LAYER                │             │
│  ┌────────────────────────────────────────────────▼─────────┐  │
│  │                    Express.js Server                     │  │
│  │  ┌─────────┐  ┌────────────┐  ┌──────────────────────┐  │  │
│  │  │  Helmet │  │Rate Limiter│  │    CORS Policy       │  │  │
│  │  │ (Headers)│  │(Auth: 20/m)│  │ (origin allowlist)   │  │  │
│  │  └─────────┘  └────────────┘  └──────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │                  Route Handlers                  │   │  │
│  │  │  /auth  /users  /simulations  /lessons           │   │  │
│  │  │  /analytics  /admin  /quiz                       │   │  │
│  │  └──────────────┬───────────────────────────────────┘   │  │
│  └─────────────────┼─────────────────────────────────────────  │
└────────────────────┼────────────────────────────────────────────┘
                     │ SQL (parameterized)
┌────────────────────┼────────────────────────────────────────────┐
│                DATA LAYER │                                     │
│  ┌─────────────────▼────────────────────────────────────────┐  │
│  │              SQLite Database (better-sqlite3)            │  │
│  │  users · lessons · user_progress · simulation_history   │  │
│  │  analytics · quiz_questions · achievements · settings   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Flow (Sequence Diagram)

```
Browser          Frontend         Backend          SQLite
   │                │                │                │
   │  Click Login   │                │                │
   │───────────────►│                │                │
   │                │ POST /auth/login│                │
   │                │───────────────►│                │
   │                │                │ SELECT user     │
   │                │                │───────────────►│
   │                │                │◄───────────────│
   │                │                │ bcrypt.compare  │
   │                │                │ jwt.sign(id)    │
   │                │◄───────────────│                │
   │                │ Store token     │                │
   │                │ (localStorage)  │                │
   │◄───────────────│                │                │
   │  Redirect      │                │                │
   │  /dashboard    │                │                │
   │                │                │                │
   │  [Later]       │                │                │
   │  GET /api/me   │                │                │
   │───────────────►│                │                │
   │                │ Authorization:  │                │
   │                │ Bearer <token>  │                │
   │                │───────────────►│                │
   │                │                │ jwt.verify()    │
   │                │                │ SELECT user     │
   │                │                │───────────────►│
   │                │                │◄───────────────│
   │                │◄───────────────│                │
   │◄───────────────│                │                │
```

---

## 3. Simulation Flow (Activity Diagram)

```
                    ┌─────────────┐
                    │ User Input  │
                    │ (payload)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Validate   │
                    │  Input      │
                    └──────┬──────┘
                           │
               ┌───────────▼──────────┐
               │  Analyze for Attack  │
               │  Patterns (Regex)    │
               └───────────┬──────────┘
                           │
            ┌──────────────▼──────────────┐
            │                             │
      ┌─────▼─────┐                 ┌─────▼──────┐
      │ Injection │                 │  Safe      │
      │ Detected  │                 │  Input     │
      └─────┬─────┘                 └─────┬──────┘
            │                             │
      ┌─────▼─────┐                 ┌─────▼──────┐
      │ Build     │                 │  Show      │
      │ Vulnerable│                 │  Secure    │
      │ Query Sim │                 │  Result    │
      └─────┬─────┘                 └─────┬──────┘
            │                             │
            └──────────────┬──────────────┘
                           │
                    ┌──────▼──────┐
                    │  Log to     │
                    │  SQLite     │
                    │  (History + │
                    │  Analytics) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Return     │
                    │  Educational│
                    │  Response   │
                    └─────────────┘
```

---

## 4. Component Architecture (Frontend)

```
App.jsx
├── Navbar.jsx           ← Sticky navigation, theme toggle, auth state
├── ParticleField.jsx    ← Canvas particle animation (global)
│
├── Pages/
│   ├── Home.jsx         ← Hero, stats counter, features, timeline
│   ├── Simulator.jsx    ← Tab container for all labs
│   │   ├── SQLInjectionLab.jsx
│   │   ├── XSSLab.jsx
│   │   └── BruteForceLab.jsx
│   ├── LearningCenter.jsx  ← Search/filter lesson grid
│   ├── LessonDetail.jsx    ← Section reader with progress tracking
│   ├── Prevention.jsx      ← Attack prevention guide
│   ├── Analytics.jsx       ← Chart.js dashboard
│   ├── Dashboard.jsx       ← User profile, progress, badges
│   ├── AdminPanel.jsx      ← Admin tables and analytics
│   ├── Quiz.jsx            ← Interactive quiz with XP
│   ├── About.jsx           ← Platform info, tech stack, roadmap
│   ├── Login.jsx           ← JWT login form
│   ├── Register.jsx        ← Registration with pw strength
│   └── NotFound.jsx        ← 404 with terminal style
│
├── LoadingScreen.jsx    ← Boot animation (2.2s)
└── Footer.jsx           ← Multi-column links + safety badges
```

---

## 5. Role-Based Access Control

```
┌────────────────────────────────────────────────┐
│                   Routes                       │
├──────────────────┬─────────────────────────────┤
│  Public          │  Authenticated    │  Admin   │
├──────────────────┼───────────────────┼──────────┤
│  /               │  /dashboard       │  /admin  │
│  /simulator      │  /analytics       │          │
│  /learning       │  /quiz (submit)   │          │
│  /prevention     │  /lessons/progress│          │
│  /about          │                   │          │
│  /login          │                   │          │
│  /register       │                   │          │
└──────────────────┴───────────────────┴──────────┘
         │                   │               │
  No token OK        JWT required      JWT + role='admin'
```

---

## 6. State Management (Zustand Stores)

```
useAuthStore {
  user:            User | null
  token:           string | null
  isAuthenticated: boolean
  ─────────────────────────────
  login(user, token)   → persists to localStorage
  logout()             → clears localStorage
  updateUser(updates)  → merges + persists
}

useThemeStore {
  theme: 'dark' | 'light'
  ─────────────────────────
  toggleTheme()   → flips + saves to localStorage
  initTheme()     → reads localStorage on boot
}
```
