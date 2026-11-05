const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', (req, res) => profileController.getProfile(req, res));
router.put('/avatar', (req, res) => profileController.updateAvatar(req, res));

module.exports = router;
