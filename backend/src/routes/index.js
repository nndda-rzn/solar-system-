const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const planetRoutes = require('./planet.routes');
const questionRoutes = require('./question.routes');
const quizRoutes = require('./quiz.routes');
const leaderboardRoutes = require('./leaderboard.routes');
const organizationRoutes = require('./organization.routes');
const auditLogRoutes = require('./auditLog.routes');
const analyticsRoutes = require('./analytics.routes');
const gdprRoutes = require('./gdpr.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/planets', planetRoutes);
router.use('/questions', questionRoutes);
router.use('/quiz', quizRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/organizations', organizationRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/gdpr', gdprRoutes);

module.exports = router;
