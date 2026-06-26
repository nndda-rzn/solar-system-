const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const planetRoutes = require('./planet.routes');
const questionRoutes = require('./question.routes');
const quizRoutes = require('./quiz.routes');
const leaderboardRoutes = require('./leaderboard.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/planets', planetRoutes);
router.use('/questions', questionRoutes);
router.use('/quiz', quizRoutes);
router.use('/leaderboard', leaderboardRoutes);

module.exports = router;
