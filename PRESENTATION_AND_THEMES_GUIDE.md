# CIS046-3 Software For Enterprise
## Assignment 1: Distributed Banana Game Enterprise Implementation
### 10-Minute Video Presentation Script, Architecture & Critical Academic Themes Guide

> **Target Grade**: 70%+ (1st Class Honours)  
> **Unit Learning Outcomes Addressed**:
> 1. Differentiate and critically question the context and underpinning principles of collectively developing software to industry standards.
> 2. Develop, implement, and critically appraise software solutions that are tailored against specific professional enterprise requirements.

---

## Executive Summary & System Overview

This artifact is a distributed, full-stack enterprise web application built around **Marc Conrad's Banana Game API** (`https://marcconrad.com/uob/banana/`). The architecture consists of:
- **Frontend Client**: React 18 SPA bundled with Vite, styled with Tailwind CSS, utilizing Web Audio API for audio synthesis and the Web Vibration API for haptic error feedback.
- **Enterprise Backend**: Node.js & Express RESTful API acting as a secure intermediary gateway, rate limiter, and session manager.
- **Data Persistence**: MySQL 8.0 relational database (with automated resilience abstraction) storing users, audit trails, and dynamic leaderboards.

---

## The Four Core Themes (70%+ First-Class Critical Evaluation)

### Theme 1: Version Control & Component-Based Architecture

#### 1. Code Structure & Modularity
The codebase enforces strict **Separation of Concerns (SoC)** and **Layered Architecture**:
- `backend/src/config/`: Environment configuration and database connection pooling.
- `backend/src/controllers/`: HTTP request/response orchestrators (`authController`, `gameController`, `leaderboardController`, `profileController`).
- `backend/src/services/`: Pure business logic decoupled from HTTP frameworks (`bananaService`, `hintService`).
- `backend/src/middleware/`: Reusable interception pipes (`authMiddleware`, `rateLimiter`, `errorHandler`).
- `backend/src/db/`: Database schemas (`schema.sql`), migration scripts, and seeders.
- `frontend/src/components/`: Reusable atomic and composite React UI components (`GameBoard`, `HintModal`, `Leaderboard`, `Profile`, `AuthModal`, `Navbar`).
- `frontend/src/context/`: Centralized React state machines (`AuthContext`).

#### 2. Version Control Strategy
- **Granular Commits**: Follows the *Conventional Commits* specification (`feat:`, `fix:`, `refactor:`, `docs:`, `security:`), ensuring that every commit represents a single atomic, reversible change.
- **Branch Management**: Implements GitFlow/Trunk-Based hybrid workflows:
  - `main`: Production-ready, tagged releases.
  - `develop`: Nightly aggregation branch.
  - `feature/auth-jwt`, `feature/anti-cheat-proxy`, `feature/hint-system`: Isolated branches to prevent merge conflicts.
- **Dependency Management & Reproducibility**: Root and subproject `package-lock.json` guarantee deterministic builds across development and testing environments.

---

### Theme 2: Event-Driven Programming

Event-driven programming is implemented across both synchronous client interfaces and asynchronous server runtimes:

#### 1. Client-Side Event Architecture (React Synthetic & DOM Events)
- **Keyboard Event Dispatcher**: A global `keydown` event listener maps physical hardware strokes (`0`–`9`, `Enter`, `H`) directly into game state transitions.
- **Countdown Timer Events**: `setInterval` ticks generate temporal events, updating remaining time, dynamically adjusting score potential, and triggering automatic timeout failure events when expired.
- **Tactile & Visual Feedback Loop (Wrong Answer)**:
  - **Visual Shake**: State transition toggles the `@keyframes shake-mistake` CSS keyframe class, physically oscillating the puzzle container by $\pm 12\text{px}$.
  - **Haptic Vibration**: Employs the HTML5 **Web Vibration API** (`navigator.vibrate([180, 80, 220])`) to send tactile pulses to mobile/supported devices.
- **Web Audio Synthesis**: Rather than loading static audio files, user interaction events trigger the **Web Audio API** (`AudioContext`). Pure sine, triangle, and sawtooth waves are procedurally generated in real time to produce victory arpeggios or error buzzers with zero network latency.

#### 2. Server-Side Event Loop & Asynchronous I/O
- Node.js operates on the `libuv` non-blocking event loop. Incoming HTTP connections, external API fetches, and MySQL queries are scheduled as asynchronous promises, avoiding thread-locking and ensuring high enterprise throughput.

---

### Theme 3: Interoperability & Anti-Cheat Data Isolation

#### 1. External Third-Party Integration
The application consumes the external web service:
`GET https://marcconrad.com/uob/banana/api.php?out=json`
Which responds with:
```json
{
  "question": "https://www.sanfoh.com/uob/banana/data/tcb5d449818fca2ea6ae35c286dn36.png",
  "solution": 6
}
```

#### 2. Critical Evaluation: Data Leak Prevention (Anti-Cheat Proxy)
- **The Vulnerability**: If the frontend React client were to call Marc Conrad's API directly, the JSON response containing the answer `solution: 6` would be visible to any user via browser Developer Tools (F12) Network inspector or client state memory.
- **Enterprise Solution**: The Express backend acts as an isolating gateway:
  1. The backend fetches the puzzle from the external API server-to-server.
  2. The server creates an encrypted game round in the database, storing `solution` securely on the server.
  3. The response payload to the client is sanitized:
     ```json
     {
       "roundId": "273ecbf7-cfca-4696-81a2-b8e3dadc9150",
       "questionUrl": "https://www.sanfoh.com/uob/banana/data/tcb5d4...",
       "timeLimit": 30,
       "hintLevel": 0
     }
     ```
  4. The solution is **never leaked to the client**. When the user submits an answer, evaluation occurs strictly server-side.

#### 3. Fault-Tolerant Graceful Degradation
To satisfy enterprise resilience, `bananaService.js` includes timeout abort controllers (6s) and an automated procedural fallback generator. If the external server goes offline or suffers rate-limiting, the game seamlessly transitions to local math puzzle rendering without crashing.

---

### Theme 4: Virtual Identity & Enterprise Security

#### 1. Identity Establishment & Authentication
- **Virtual Identity**: Every player must register an authenticated identity to access game sessions and write to the leaderboard.
- **Password Security**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` (Cost Factor: 10). This protects user identities against dictionary attacks and precomputed rainbow table reversals.
- **Stateless Authorization via JWT**: Upon successful login, the server issues an HMAC-SHA256 signed JSON Web Token (JWT) containing the user's `id`, `username`, and `email`, valid for 7 days.
- **Protected Routes**: The `authMiddleware.js` verifies the token in the `Authorization: Bearer <token>` header for all gameplay, hint requests, score submissions, and profile updates.

#### 2. Relational Virtual Profile & Leaderboard
- User statistics (`user_stats`) track cumulative total score, win rate (accuracy %), highest streak, and hint usage.
- A full audit trail table (`match_history`) logs every round, answer, timestamp, and point breakdown.
- The leaderboard executes live SQL aggregations (`ORDER BY total_score DESC`) ensuring genuine, dynamic rankings rather than hardcoded mock data.

---

## 10-Minute Video Presentation Script & Timeline

You can follow this exact structure for your 10-minute video submission:

| Time | Phase | Video Action & On-Screen Demonstration | Spoken Script Outline |
|---|---|---|---|
| **0:00 - 1:30** | **Introduction & System Demo** | Screen shows browser running `http://localhost:5173`. Demonstrate login modal, avatar selection, starting a round, solving a puzzle, and unlocking hints. | *"Hello, my name is [Your Name], presenting my software artifact for CIS046-3 Software For Enterprise. Today I am demonstrating my distributed Banana Game application, engineered with React, Node.js, Express, and MySQL, which integrates Marc Conrad's Banana API while addressing the four core themes: Version Control, Event-Driven Programming, Interoperability, and Virtual Identity..."* |
| **1:30 - 3:00** | **Gameplay Feedback & Scoring** | Show deliberate wrong answer: demonstrate the visual screen shake and explain mobile vibration. Submit a correct answer: show confetti, audio fanfare, streak multiplier, and dynamic point addition. | *"Notice that when I submit an incorrect answer, the system triggers both visual vibration shaking and haptic vibration feedback on supported devices. When answered correctly, dynamic score computation takes place based on response speed, streak multiplier, and hint deductions..."* |
| **3:00 - 4:45** | **Theme 1: Version Control & Architecture** | Open VS Code / IDE. Show Git log (`git log --oneline`), package structure, and layered components. | *"In Theme 1, Version Control, I evaluated component modularity and separation of concerns. The system is split into distinct client and server tiers. In Git, commits follow granular semantic conventions. Modular isolation ensures that changing database drivers or UI components does not disrupt business logic..."* |
| **4:45 - 6:30** | **Theme 2: Event-Driven Programming** | Show `GameBoard.jsx` (keyboard events, timer interval, shake state) and `soundEffects.js` (Web Audio API oscillators and `navigator.vibrate`). | *"In Theme 2, Event-Driven Programming, our system orchestrates asynchronous events across client and server. On the client, React state handlers capture keystrokes, countdown timer ticks, and modal triggers. Rather than static sound files, user events trigger the Web Audio API to procedurally generate sound waves in real time..."* |
| **6:30 - 8:15** | **Theme 3: Interoperability & Data Leaks** | Open `bananaService.js` and show Network tab in Chrome DevTools. Demonstrate that the solution is NEVER sent to the browser. | *"In Theme 3, Interoperability, we connect with Marc Conrad's external Banana API. A critical enterprise vulnerability of this API is that it returns both question and solution. Directly calling it from the frontend would cause a fatal data leak, allowing anyone to inspect the answer in DevTools. We designed a secure backend proxy that withholds the solution server-side and manages 3-step progressive hints..."* |
| **8:15 - 9:45** | **Theme 4: Virtual Identity & MySQL** | Show MySQL Workbench or `schema.sql`, `authController.js` (bcrypt hashing, JWT), and the dynamic Leaderboard / Profile page. | *"In Theme 4, Virtual Identity, anonymous users cannot mutate game records. We establish cryptographic identity using bcrypt password hashing and signed JWT tokens. Player stats and match audit logs are persisted in a real MySQL relational schema, driving our dynamic Leaderboard..."* |
| **9:45 - 10:00** | **Conclusion & Reflection** | Show the final running dashboard and conclude. | *"To conclude, this system successfully implements a robust enterprise architecture that satisfies all four themes with industry-standard security and usability. Thank you for watching."* |

---

## Quick Start Commands

```bash
# 1. Install all dependencies
npm run install:all

# 2. Run Backend (Terminal 1)
cd backend
npm run dev

# 3. Run Frontend (Terminal 2)
cd frontend
npm run dev
```

Navigate to: `http://localhost:5173`
Test Server API Health: `http://localhost:5000/api/health`

