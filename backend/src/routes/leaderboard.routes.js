const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', leaderboardController.getTopUsers);
router.get('/me', authenticate, leaderboardController.getUserRank);

module.exports = router;
