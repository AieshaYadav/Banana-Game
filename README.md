# 🍌 Banana Game - Enterprise Distributed Implementation
> **Course Unit**: CIS046-3 Software For Enterprise (University of Bedfordshire)  
> **Assignment**: Assignment 1 Artifact & 10-Minute Video Submission  
> **External API**: [Marc Conrad's Banana Game API](https://marcconrad.com/uob/banana/)

---

## 🌟 Key Highlights & Requirements Delivered

- **Full-Stack Architecture**: React 18 (Vite, Tailwind CSS, Lucide Icons) + Node.js (Express) + MySQL 8.0.
- **Zero Data Leak Anti-Cheat Proxy**:
  - The external Banana API returns `{ question, solution }`.
  - Calling this directly from a browser allows users to inspect DevTools and cheat.
  - Our Express backend acts as an isolating enterprise proxy that strips the `solution` from the payload sent to the client and evaluates answers strictly server-side.
- **Progressive 3-Step Tactical Hint System**:
  - **Hint 1**: Parity & Macro Range Clue (Even/Odd, High/Low) $\rightarrow$ Deducts 15 pts potential.
  - **Hint 2**: Candidate Elimination (Filters choices down to strictly 3 options) $\rightarrow$ Deducts 25 pts potential.
  - **Hint 3**: Tight Precision Boundary (Immediate numerical neighbors or algebraic relation) $\rightarrow$ Deducts 35 pts potential.
  - Hints **never** expose the raw solution.
- **Interactive Animations & Haptic Mistake Feedback**:
  - **Visual Shake**: CSS Keyframe `@keyframes shake-mistake` violently shakes the puzzle container on incorrect guesses.
  - **Haptic Vibration**: Uses the HTML5 **Web Vibration API** (`navigator.vibrate([180, 80, 220])`) for physical tactile feedback on mobile devices.
  - **Dynamic Scoring**: +100 base points + time speed bonus + combo streak multiplier ($1.2\times, 1.5\times, 2.0\times$) - hint penalties.
  - **Procedural Web Audio API**: Real-time sound synthesis for chimes, buzzers, and clicks without external audio files.
  - **Celebration Confetti**: Particle explosions on correct answers.
- **Virtual Identity & Security (Theme 4)**:
  - Mandatory registration and login to play the game and submit scores.
  - Passwords hashed using `bcryptjs` with salt rounds.
  - Stateless JSON Web Tokens (JWT) for authentication.
- **Dynamic MySQL Leaderboard (NOT Hardcoded)**:
  - Real SQL queries ranking players by Total Score and Accuracy (Win Rate %).
  - Top 3 Podium visualizations (🥇 Gold, 🥈 Silver, 🥉 Bronze).
- **Player Profile Option**:
  - Customizable avatar selection.
  - Lifetime statistics and telemetry (Total Score, Games, Win Rate, Highest Streak).
  - Audited recent match history timeline.
- **Academic Video Guide Included**:
  - Complete 10-minute presentation script in `PRESENTATION_AND_THEMES_GUIDE.md` structured for a 1st Class (70%+).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0 or higher (v20+ recommended)
- **MySQL Server**: (Optional / Supported: If MySQL is installed locally, the server connects automatically. If not configured, an automated fallback engine ensures continuous zero-crash operation).

### 2. Configuration (`backend/.env`)
Edit `backend/.env` with your MySQL database credentials:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_banana_jwt_enterprise_key_2026
JWT_EXPIRES_IN=7d

# MySQL Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=banana_game_db
```

### 3. Initialize MySQL Database
```bash
npm run init:db
```
*(Creates the `banana_game_db` database and tables: `users`, `user_stats`, `game_rounds`, `match_history`)*

### 4. Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
```
*Backend runs on: `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 🧪 Run Automated Integration Tests
An enterprise test suite is included in `backend/src/test/runAll.js` that verifies all 11 core criteria:
```bash
node backend/src/test/runAll.js
```

---

## 📁 Repository Structure

```
banana-game-enterprise/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection and app config
│   │   ├── controllers/     # Auth, Game, Leaderboard, Profile
│   │   ├── middleware/      # JWT verification, Error handlers
│   │   ├── routes/          # REST route handlers
│   │   ├── services/        # Banana API proxy and Hint logic
│   │   ├── db/              # schema.sql, initDb.js, seed.js
│   │   ├── test/            # runAll.js (E2E Verification suite)
│   │   └── server.js        # Express application entry
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # GameBoard, HintModal, Leaderboard, Profile, AuthModal, Navbar
│   │   ├── context/         # AuthContext
│   │   ├── services/        # api.js
│   │   ├── utils/           # soundEffects.js (Web Audio & Vibration API)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── tailwind.config.js
├── PRESENTATION_AND_THEMES_GUIDE.md  # 10-Minute Video Script & Marking Guide
└── package.json                      # Root orchestrator
```
