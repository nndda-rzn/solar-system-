const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');

router.get('/organization/:organizationId', authenticate, analyticsController.getOrganizationAnalytics);

router.get('/student/me', authenticate, analyticsController.getStudentProgress);

router.get('/student/:userId', authenticate, analyticsController.getStudentProgressById);

router.get('/dashboard', authenticate, analyticsController.getDashboardData);

router.get('/export/:organizationId', authenticate, analyticsController.exportReport);

module.exports = router;