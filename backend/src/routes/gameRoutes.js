const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authenticateToken = require('../middleware/authMiddleware');

// All game endpoints require Virtual Identity authentication
router.use(authenticateToken);

// Start round (fetches puzzle from Marc Conrad API securely)
router.post('/start', (req, res) => gameController.startRound(req, res));

// Request 3-step progressive hint
router.post('/hint', (req, res) => gameController.requestHint(req, res));

// Submit answer for evaluation and scoring
router.post('/submit', (req, res) => gameController.submitAnswer(req, res));

module.exports = router;
