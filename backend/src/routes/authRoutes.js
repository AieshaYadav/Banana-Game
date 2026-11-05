const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));

// Protected session validation
router.get('/me', authenticateToken, (req, res) => authController.getMe(req, res));
router.put('/profile', authenticateToken, (req, res) => authController.updateProfile(req, res));

module.exports = router;
