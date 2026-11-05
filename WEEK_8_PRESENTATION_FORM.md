# CIS046-3 Software for Enterprise – AY 26/27

**Student Name:** ___________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Student Number:** ____________________  
**Student Signature:** ________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Date:** November 2026 (Week 8)

*Please answer the questions below, print this form and bring it to the presentation where it will be checked against reality and signed off by the tutor. Once signed off, scan this form and submit on BREO with all other deliverables (video, code). At this stage, Week 8, (at least) a working prototype should be presented plus some ideas on how to continue with the development.*

---

### Version Control
*How did you develop your code (e.g., what features have ben added after first version)?*

I developed the application in a decoupled multi-tier architecture (React client, Node/Express gateway, MySQL database) tracked under Git on GitHub (`AieshaYadav/Banana-Game`). I utilized semantic commit messages and isolated feature branches (`main`, `develop`, `feature/anti-cheat-proxy`) with a tagged release `v1.0.0`. After the initial prototype connecting to the external puzzle API, I iteratively implemented:
1. An anti-cheat proxy to intercept the API and withhold the raw solution from the client to prevent data leaks.
2. A progressive 3-step hint engine with tiered point penalties (-15, -25, -35 pts).
3. Mistake feedback coupling visual CSS keyframe shake animations with the HTML5 Web Vibration API.
4. Procedural Web Audio API sound synthesis (eliminating static audio files) and streak combo multipliers.
5. Persistent MySQL 8.0 schema for real-time dynamic leaderboard aggregation and player audit history.

---

### Event Driven Architectures
*What in your code triggers events (e.g., GUI, buttons, timeout …)?*

Events are managed across both synchronous client interfaces and asynchronous server runtimes:
- **Client GUI & Keystroke Events**: Click handlers on the interactive 0–9 keypad; a global `window.addEventListener('keydown')` mapping physical number keys (`0`–`9`), `Enter` (submission), and `H` (hint modal).
- **Temporal Interval Events**: A 30-second countdown timer implemented via `setInterval` firing state ticks every 1000ms. If the timer reaches 0, it dispatches an automatic timeout mistake event.
- **Sensory Feedback Events**: Mistake events toggle CSS `@keyframes shake-mistake` and trigger physical pulses via `navigator.vibrate([180, 80, 220])`; button interactions trigger real-time sine/sawtooth sound waves via `AudioContext` oscillators.
- **Server Asynchronous Events**: Node.js `libuv` event loop handling asynchronous REST API requests, rate-limiting windows, and MySQL connection pool query resolutions.

---

### Interoperability
*Do you use the API https://marcconrad.com/uob/tomato/api.php?*  
*If no, where in your code do you demonstrate interoperability? What protocols do you use?*

No. Instead of the Tomato API, I interoperate with Marc Conrad’s official **Banana API** (`https://marcconrad.com/uob/banana/api.php?out=json`) inside `backend/src/services/bananaService.js`.
- **Protocol**: HTTPS RESTful protocol exchanging JSON payloads.
- **Anti-Cheat Data Isolation**: The external web service returns both the puzzle image and the plain solution integer (`{ question, solution }`). Direct client-side calls would leak the answer in browser DevTools. My Express backend interoperates with the external API server-to-server, withholds the solution securely in the database, and serves only a sanitized round payload to the React client.
- **Fault Tolerance**: Includes an AbortController (6s timeout) and a local procedural SVG equation generator if the external web service is unreachable.

---

### Virtual Identity
*How did you implement virtual identity in your code? (e.g., Passwords, Cookies, IP Numbers …)*

Virtual identity is mandatory to access game sessions and record scores (enforced by `authMiddleware.js`):
- **Password Protection**: Passwords are never stored in plaintext; they are salted and hashed using `bcryptjs` (cost factor 10) to protect against rainbow table attacks.
- **Stateless Session Tokens**: Authenticated users receive an HMAC-SHA256 signed JSON Web Token (JWT) transmitted via HTTP `Authorization: Bearer <token>` headers.
- **Relational Persistence**: Identities are persisted in MySQL 8.0 (`users` table linked with `user_stats` and `match_history`), supporting custom avatars, win rates, high streaks, and audited match histories that power the dynamic leaderboard.

---

### Any other interesting features:

1. **Zero Data Leak Architecture**: Anti-cheat proxy withholds solutions; verification occurs strictly server-side.
2. **3-Step Tactical Hints**: Progressive clues (Parity/Range $\rightarrow$ Set Elimination $\rightarrow$ Boundary Clue) without revealing the solution.
3. **Dynamic Point Calculus**: Rewards speed (+time bonus) and accuracy ($\times$ streak multipliers up to 2.0x) while deducting hint penalties.
4. **Haptic Vibration & Confetti FX**: Combines physical mobile vibration (`navigator.vibrate`) with celebratory particle animations.
5. **Real-Time Dynamic MySQL Leaderboard**: Live SQL queries for Top Scorers and Accuracy % (not hardcoded).
6. **1-Click Launcher**: `start-game.bat` automatically launches the backend, frontend, and opens the browser in one step.
