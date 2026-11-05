const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// Publicly visible real-time leaderboards
router.get('/top-scores', (req, res) => leaderboardController.getTopScorers(req, res));
router.get('/accuracy', (req, res) => leaderboardController.getTopAccuracy(req, res));

module.exports = router;
