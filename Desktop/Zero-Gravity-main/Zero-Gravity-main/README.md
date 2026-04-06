<p align="center">
  <img src="https://img.shields.io/badge/DevMatch-AI_Powered-00E5FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwb2x5bGluZSBwb2ludHM9IjE2IDEwIDIwIDYgMjQgMTAiLz48cG9seWxpbmUgcG9pbnRzPSI4IDE0IDQgMTggMCAxNCIvPjxsaW5lIHgxPSIyMCIgeTE9IjYiIHgyPSI0IiB5Mj0iMTgiLz48L3N2Zz4=" alt="DevMatch" />
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
  <em>Smart matching • Real-time chat • Google OAuth • Premium Glassmorphism UI</em>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Design System](#-design-system)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [AI Matching Engine](#-ai-matching-engine)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**DevMatch** is a full-stack web platform that uses **artificial intelligence** to match hackathon developers into optimal teams. Instead of randomly forming groups, DevMatch analyzes each developer's **skills, tech stack, role, experience level, and project interests** to compute compatibility scores using a dual AI engine: **Fuzzy Logic** for nuanced similarity scoring and a **Neural Network** for adaptive, feedback-trained predictions.

The platform features **real-time chat** with intelligent auto-replies, **Google OAuth authentication**, **scroll-based UI animations**, a **meetup scheduler**, and a **brand-level visual design** built to impress — all in a cohesive, futuristic glassmorphism interface.

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
| 🧭 **Contextual Navigation** | Floating glass navbar with smooth transitions |
| 📅 **Meetup Scheduler** | Timeline-based scheduling for pre-hackathon planning sessions |
| 🌊 **Premium Glass UI** | Iconic brand-level design with Teal + Electric Blue gradient system |

---

## 🎨 Design System

DevMatch v3.0 introduces a completely new, brand-level visual identity — built to be **memorable, premium, and unique**.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#080B14` | Deep space base |
| `--bg-secondary` | `#0C1020` | Panel backgrounds |
| `--primary` | `#00C8FF` | Electric teal |
| `--secondary` | `#0070FF` | Electric blue |
| `--gradient-primary` | `teal → electric blue` | CTAs, accents, highlights |

### Typography

| Role | Font | Weight |
|---|---|---|
| Display / Headings | **Space Grotesk** | 700–800 |
| Body | **DM Sans** | 400–500 |
| Brand Logo only | **Kalam** | 700 |

### Design Principles

- **Glassmorphism** with deep blur (24px) and teal-tinted panels
- **2-color gradient system** — only Teal → Electric Blue, used sparingly
- **Asymmetric layouts** — floating panels, staggered grids, diagonal sections
- **Depth hierarchy** — 3 layers: background → mid-glass → elevated foreground
- **Micro-interactions** — hover glow, scale, smooth transitions across all elements

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

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | Component-based UI framework |
| **Vite** | 6.0 | Lightning-fast build tool & dev server |
| **React Router** | 6.28 | Client-side routing & navigation |
| **Lucide React** | 0.468 | Modern icon library |
| **Space Grotesk** | Google Fonts | Premium display typography |
| **DM Sans** | Google Fonts | Clean body typography |
| **Vanilla CSS** | — | Custom design system — glassmorphism, gradients, animations |

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
│   │   │   ├── Navbar.jsx           # Floating glass navbar with gradient brand
│   │   │   ├── Navbar.css
│   │   │   └── FeedbackModal.jsx    # Star rating feedback for AI training
│   │   ├── 📁 hooks/
│   │   │   └── useScrollReveal.js   # IntersectionObserver scroll animation hook
│   │   ├── 📁 pages/
│   │   │   ├── LandingPage.jsx/css  # Cinematic hero + bento features + CTA
│   │   │   ├── LoginPage.jsx        # Email/password + Google OAuth login
│   │   │   ├── RegisterPage.jsx     # Multi-step registration + Google OAuth
│   │   │   ├── AuthPages.css        # Split-layout auth styles
│   │   │   ├── Dashboard.jsx/css    # 3-panel layout (identity|content|insights)
│   │   │   ├── DiscoverPage.jsx/css # Staggered AI-matched developer cards
│   │   │   ├── ChatPage.jsx/css     # Cinematic chat with gradient bubbles
│   │   │   ├── ProfilePage.jsx/css  # Hero banner + skill grid profile
│   │   │   └── MeetupPage.jsx/css   # Timeline-based meetup scheduler
│   │   ├── App.jsx                  # Root app with AuthContext provider
│   │   ├── index.css                # Brand design system — Space Grotesk + Teal/Blue palette
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
git clone https://github.com/MohammadSakibAhmad0874/Zero-Gravity.git
cd Zero-Gravity

# Run the setup script
setup.bat
```

### Option 2: Manual Setup

#### Step 1 — Clone
```bash
git clone https://github.com/MohammadSakibAhmad0874/Zero-Gravity.git
cd Zero-Gravity
```

#### Step 2 — Install Backend Dependencies
```bash
cd backend && npm install
```

#### Step 3 — Install Frontend Dependencies
```bash
cd ../frontend && npm install
```

#### Step 4 — Install AI Service Dependencies
```bash
cd ../ai-service && pip install -r requirements.txt
```

#### Step 5 — Start All Services

Open **3 separate terminals**:

**Terminal 1 — Backend (Port 5000)**
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend (Port 5173)**
```bash
cd frontend && npm run dev
```

**Terminal 3 — AI Service (Port 5001)**
```bash
cd ai-service && python app.py
```

#### Step 6 — Open the App

Navigate to **http://localhost:5173** in your browser.

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

### Meetups

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/meetups` | List all meetups | ✅ |
| `POST` | `/api/meetups` | Create a new meetup | ✅ |
| `POST` | `/api/meetups/:id/join` | Join/RSVP to a meetup | ✅ |
| `DELETE` | `/api/meetups/:id` | Delete a meetup (creator only) | ✅ |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "feat: add my feature"`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

---

## 🔮 Future Roadmap

- [ ] **Real Google OAuth** — Integrate with Google Cloud Console OAuth 2.0
- [ ] **WebSocket Chat** — Replace polling with real-time WebSocket communication
- [ ] **MongoDB/PostgreSQL** — Replace JSON file storage with a proper database
- [ ] **Profile Pictures** — Upload and display user avatars
- [ ] **Team Management** — Create persistent teams, invite members, manage projects
- [ ] **Hackathon Events** — Browse and register for upcoming hackathons

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with 💙 by Team Zero-Gravity</strong>
  <br/>
  <em>DevMatch — Because the best teams aren't random.</em>
  <br/>
  <em>Desh Bhagat University · 2026</em>
</p>
