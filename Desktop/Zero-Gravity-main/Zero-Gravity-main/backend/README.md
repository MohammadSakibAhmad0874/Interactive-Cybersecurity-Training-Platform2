<p align="center">
  <img src="https://img.shields.io/badge/DevMatch-AI_Powered-blueviolet?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwb2x5bGluZSBwb2ludHM9IjE2IDEwIDIwIDYgMjQgMTAiLz48cG9seWxpbmUgcG9pbnRzPSI4IDE0IDQgMTggMCAxNCIvPjxsaW5lIHgxPSIyMCIgeTE9IjYiIHgyPSI0IiB5Mj0iMTgiLz48L3N2Zz4=" alt="DevMatch" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/AI-Fuzzy_Logic_%2B_Neural_Net-FF6F00?style=for-the-badge&logo=tensorflow" alt="AI" />
</p>

<h1 align="center">🚀 DevMatch</h1>
<h3 align="center">AI-Powered Hackathon Team Formation Platform</h3>

<p align="center">
  <em>Find your dream hackathon team using fuzzy logic + neural network intelligence.</em>
  <br/>
  <em>Smart matching • Real-time chat with auto-replies • Google OAuth • Scroll-animated UI</em>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [AI Matching Engine](#-ai-matching-engine)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**DevMatch** is a full-stack web platform that uses **artificial intelligence** to match hackathon developers into optimal teams. Instead of randomly forming groups, DevMatch analyzes each developer's **skills, tech stack, role, experience level, and project interests** to compute compatibility scores using a dual AI engine: **Fuzzy Logic** for nuanced similarity scoring and a **Neural Network** for adaptive, feedback-trained predictions.

The platform features **real-time chat** with intelligent auto-replies, **Google OAuth authentication**, **scroll-based UI animations**, and a **meetup scheduler** — everything a hackathon organizer or participant needs to form the strongest possible team.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **AI-Powered Matching** | Dual engine: Fuzzy Logic membership functions + NumPy neural network with backpropagation |
| 🔐 **Google OAuth** | Simulated Google sign-in with account picker, plus traditional email/password auth |
| 🍪 **Cookie-Based Sessions** | Secure `httpOnly` cookies for persistent authentication across browser sessions |
| 💬 **Smart Auto-Reply Chat** | Automated replies with profile stats, skills summary, and collaboration availability |
| ⌨️ **Typing Indicator** | Bouncing dot animation simulates natural conversation flow before auto-replies |
| 🎯 **Role-Based Matching** | Frontend, Backend, Full Stack, ML/AI, DevOps, Design — find the exact role your team needs |
| 📊 **Match Scoring** | Weighted scoring: 50% skills, 30% tech stack, 20% role compatibility |
| 🔄 **Adaptive AI** | Rate your matches to continuously train the neural network over time |
| ✨ **Scroll Reveal Animations** | Sections animate into view using IntersectionObserver with staggered timing |
| 🧭 **Contextual Navigation** | Navbar buttons smooth-scroll to relevant sections based on page context |
| 📅 **Meetup Scheduler** | Schedule pre-hackathon planning sessions with your matched teammates |
| 🌙 **Dark Mode Glass UI** | Premium glassmorphism design with gradient accents and micro-animations |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│   React 18 + Vite + React Router                               │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│   │ Landing  │ │Dashboard │ │ Discover │ │  Chat + AutoReply│  │
│   │  Page    │ │   Page   │ │   Page   │ │     System       │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│        │              │            │               │            │
│        └──────────────┴────────────┴───────────────┘            │
│                            │                                    │
│                   Vite Dev Proxy (:5173)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │  /api/*
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                    NODE.JS BACKEND (:5000)                      │
│                                                                 │
│   Express.js + JWT + bcrypt + cookie-parser                    │
│   ┌────────────────┐ ┌──────────────┐ ┌─────────────────────┐  │
│   │  Auth Module   │ │ Chat Module  │ │   Meetup Module     │  │
│   │ • Login/Signup │ │ • Messages   │ │ • Create/Join       │  │
│   │ • Google OAuth │ │ • Auto-Reply │ │ • Schedule          │  │
│   │ • Cookie Auth  │ │ • Typing Sim │ │ • RSVP              │  │
│   └────────────────┘ └──────────────┘ └─────────────────────┘  │
│                  │                                              │
│         JSON File Storage (./data/)                            │
│         users.json │ chats.json │ meetups.json                 │
│                  │                                              │
│          /api/ai/match (proxy)                                 │
└──────────────────┬─────────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────┐
│               PYTHON AI SERVICE (:5001)                        │
│                                                                 │
│   Flask + NumPy + scikit-fuzzy                                 │
│   ┌─────────────────────┐  ┌─────────────────────────────┐    │
│   │   Fuzzy Logic Engine│  │   Neural Network Engine      │    │
│   │ • Triangular MF     │  │ • 3-layer feedforward        │    │
│   │ • Trapezoidal MF    │  │ • Sigmoid activation         │    │
│   │ • Gaussian MF       │  │ • Backpropagation training   │    │
│   │ • Skill similarity  │  │ • Adaptive from user ratings │    │
│   └─────────────────────┘  └─────────────────────────────┘    │
│                                                                 │
│   Scoring Formula:                                             │
│   match_score = 0.5 × skills + 0.3 × tech_stack + 0.2 × role │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action          → Frontend            → Backend             → AI Service
──────────           ──────────            ──────────            ──────────
Register/Login       → POST /api/auth/*    → JWT + Cookie        
Google Sign-In       → POST /api/auth/google → Auto-create user  
View Matches         → GET /api/matches    → Proxy to AI service → Compute scores
Send Chat Message    → POST /api/chat/send → Store + Auto-reply  
Rate Match           → POST /api/feedback  → Proxy to AI service → Retrain neural net
Schedule Meetup      → POST /api/meetups   → Store in JSON       
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | Component-based UI framework |
| **Vite** | 6.0 | Lightning-fast build tool & dev server |
| **React Router** | 6.28 | Client-side routing & navigation |
| **Lucide React** | 0.468 | Modern icon library |
| **Vanilla CSS** | — | Custom design system with CSS variables, glassmorphism |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Server runtime |
| **Express** | 4.21 | HTTP framework |
| **JWT** | 9.0 | Token-based authentication |
| **bcryptjs** | 2.4 | Password hashing |
| **cookie-parser** | 1.4 | Cookie-based session persistence |
| **uuid** | 11.0 | Unique ID generation |

### AI Service
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.9+ | AI service runtime |
| **Flask** | 3.1 | Lightweight HTTP server |
| **NumPy** | 2.2 | Neural network matrix operations |
| **scikit-fuzzy** | 0.5 | Fuzzy logic membership functions |
| **TensorFlow** | 2.18 | ML framework (optional, for extended models) |

---

## 📂 Project Structure

```
devmatch/
├── 📁 frontend/                     # React + Vite SPA
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── Navbar.jsx           # Context-aware navigation (section links / app links)
│   │   │   ├── Navbar.css
│   │   │   └── FeedbackModal.jsx    # Star rating feedback for AI training
│   │   ├── 📁 hooks/
│   │   │   └── useScrollReveal.js   # IntersectionObserver scroll animation hook
│   │   ├── 📁 pages/
│   │   │   ├── LandingPage.jsx/css  # Hero + Features + How It Works + CTA
│   │   │   ├── LoginPage.jsx        # Email/password + Google OAuth login
│   │   │   ├── RegisterPage.jsx     # Multi-step registration + Google OAuth
│   │   │   ├── AuthPages.css        # Shared auth styles + Google picker modal
│   │   │   ├── Dashboard.jsx/css    # Stats overview + recent matches + profile
│   │   │   ├── DiscoverPage.jsx/css # AI-matched developer cards
│   │   │   ├── ChatPage.jsx/css     # Real-time chat + typing indicator + auto-reply
│   │   │   ├── ProfilePage.jsx/css  # View/edit developer profile
│   │   │   └── MeetupPage.jsx/css   # Create & join team sync sessions
│   │   ├── App.jsx                  # Root app with AuthContext provider
│   │   ├── index.css                # Global design system (colors, animations, glass)
│   │   └── main.jsx                 # Vite entry point
│   ├── vite.config.js               # Vite config with API proxy
│   └── package.json
│
├── 📁 backend/                      # Node.js + Express REST API
│   ├── server.js                    # All routes: auth, users, matches, chat, meetups
│   ├── 📁 data/                     # JSON file storage (auto-created)
│   │   ├── users.json
│   │   ├── chats.json
│   │   └── meetups.json
│   └── package.json
│
├── 📁 ai-service/                   # Python Flask AI engine
│   ├── app.py                       # Fuzzy Logic + Neural Network matching
│   └── requirements.txt
│
├── package.json                     # Root-level scripts (install:all, dev)
├── setup.bat                        # Windows one-click setup script
└── .gitignore
```

---

## 🧠 AI Matching Engine

DevMatch uses a **dual AI engine** that combines two complementary approaches:

### 1. Fuzzy Logic Engine
Computes similarity between developers using **membership functions**:

```
Triangular MF:    /\        Trapezoidal MF:   ___
                 /  \                        /   \
                /    \                      /     \
               /      \                   /       \
```

- **Skill Overlap**: Jaccard similarity of skill sets → fuzzified to membership grade
- **Tech Stack Alignment**: Language/framework overlap → weighted by stack depth
- **Role Compatibility**: Role-pair scoring matrix (Frontend ↔ Backend = high, same role = lower)

### 2. Neural Network Engine
A 3-layer feedforward network trained via backpropagation:

```
Input Layer (12 neurons)     Hidden Layer (8 neurons)     Output Layer (1 neuron)
[skill_overlap]              [sigmoid activation]         [match_score 0-100]
[tech_overlap]                     ...
[role_compat]                      ...
[exp_diff]                         ...
[interest_overlap]                 ...
...
```

- **Activation**: Sigmoid function for non-linear scoring
- **Training**: User feedback (1–5 star ratings) continuously retrains the network
- **Weights**: Stored in-memory, persist across requests within a session

### Scoring Formula
```
final_score = (0.50 × skill_similarity) +
              (0.30 × tech_stack_alignment) +
              (0.20 × role_compatibility)
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Check Command |
|---|---|---|
| **Node.js** | 18.0+ | `node --version` |
| **npm** | 9.0+ | `npm --version` |
| **Python** | 3.9+ | `python --version` |
| **pip** | 21.0+ | `pip --version` |

### Option 1: Quick Setup (Windows)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/devmatch.git
cd devmatch

# Run the setup script
setup.bat
```

This will install all dependencies for frontend, backend, and AI service automatically.

### Option 2: Manual Setup (All Platforms)

#### Step 1 — Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/devmatch.git
cd devmatch
```

#### Step 2 — Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 3 — Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

#### Step 4 — Install AI Service Dependencies
```bash
cd ../ai-service
pip install -r requirements.txt
```

> **Note**: If you encounter issues with `scikit-fuzzy` or `tensorflow`, you can install them separately:
> ```bash
> pip install scikit-fuzzy==0.5.0
> pip install tensorflow==2.18.0
> ```
> On Apple Silicon (M1/M2), use `tensorflow-macos` instead.

#### Step 5 — Start All Services

Open **3 separate terminals** and run each service:

**Terminal 1 — Backend (Port 5000)**
```bash
cd backend
npm run dev
```
> Expected output: `⚡ DevMatch Backend running on http://localhost:5000`

**Terminal 2 — Frontend (Port 5173)**
```bash
cd frontend
npm run dev
```
> Expected output: `VITE v6.x ready in X ms → http://localhost:5173/`

**Terminal 3 — AI Service (Port 5001)**
```bash
cd ai-service
python app.py
```
> Expected output: `🧠 DevMatch AI Service running on http://localhost:5001`

#### Step 6 — Open the App

Navigate to **http://localhost:5173** in your browser.

### Option 3: Using Root Scripts
```bash
# Install all dependencies at once
npm run install:all

# Start backend + frontend (AI service needs separate terminal)
npm run dev

# In a separate terminal:
npm run dev:ai
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register with email/password + profile | ❌ |
| `POST` | `/api/auth/login` | Login with email/password | ❌ |
| `POST` | `/api/auth/google` | Simulated Google OAuth login | ❌ |
| `POST` | `/api/auth/logout` | Clear auth cookie | ❌ |

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/users/me` | Get current user profile | ✅ |
| `PUT` | `/api/users/me` | Update profile (skills, bio, availability) | ✅ |
| `GET` | `/api/users/:id` | Get any user's public profile | ✅ |

### Matching & Discovery

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/matches` | Get AI-ranked matches for current user | ✅ |
| `POST` | `/api/feedback` | Rate a match (trains neural network) | ✅ |

### Chat & Auto-Reply

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/chat/send` | Send message + receive auto-reply | ✅ |
| `GET` | `/api/chat/:userId` | Get chat history with a user | ✅ |

> **Auto-Reply Behavior**:
> - **First message** → Full profile auto-reply (greeting, skills, tech stack, availability)
> - **Subsequent messages** → Short acknowledgment reply

### Meetups

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/meetups` | List all meetups | ✅ |
| `POST` | `/api/meetups` | Create a new meetup | ✅ |
| `POST` | `/api/meetups/:id/join` | Join/RSVP to a meetup | ✅ |
| `DELETE` | `/api/meetups/:id` | Delete a meetup (creator only) | ✅ |

---

## 📸 Screenshots

### Landing Page
The landing page features a hero section with animated floating cards, scroll-reveal feature sections, a 3-step "How It Works" guide, and a CTA. The navbar shows context-aware section links (Features, How It Works, Get Started) that smooth-scroll to their respective sections.

### Login with Google OAuth
The login page offers both traditional email/password and **"Continue with Google"** authentication. Clicking Google opens a sleek account picker modal with simulated Google accounts.

### Dashboard
A personalized overview with stat cards (matches found, conversations, meetups, feedback), recent matches with compatibility scores, and a developer profile summary — all sections animate in on scroll.

### Discover Matches
Browse AI-matched developers with detailed cards showing their name, country, role badge, experience level, skills, tech stack, and match score. Each card reveals with a staggered scroll animation.

### Chat with Auto-Reply
Select a contact and start chatting. The system features:
- **Typing indicator** (3 bouncing dots) before auto-replies
- **Full profile auto-reply** on first message (skills, experience, availability)
- **Short contextual replies** on subsequent messages
- **"AUTO-REPLY"** badge with bot icon on automated messages
- **"OPEN FOR COLLABORATION"** availability badge in header

### Profile Page
View and edit your developer profile including name, country, bio, skills, tech stack, project interests, role, and experience level.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "Add my feature"`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Development Tips

- **Backend hot-reload**: `npm run dev` uses `--watch` flag for auto-restart
- **Frontend HMR**: Vite provides instant hot module replacement
- **AI service**: Restart manually after changes (`Ctrl+C` → `python app.py`)
- **Data reset**: Delete files in `backend/data/` to reset all users, chats, and meetups

---

## 🔮 Future Roadmap

- [ ] **Real Google OAuth** — Integrate with Google Cloud Console OAuth 2.0
- [ ] **WebSocket Chat** — Replace polling with real-time WebSocket communication
- [ ] **MongoDB/PostgreSQL** — Replace JSON file storage with a proper database
- [ ] **Profile Pictures** — Upload and display user avatars
- [ ] **Team Management** — Create persistent teams, invite members, manage projects
- [ ] **Hackathon Events** — Browse and register for upcoming hackathons
- [ ] **Export Teams** — Export team rosters to Devpost, MLH, or other platforms

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with 💜 by the DevMatch Team</strong>
  <br/>
  <em>Making hackathon team formation smarter, one match at a time.</em>
</p>
