const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { authenticate } = require('../middleware/auth');

router.get('/user/:userId', authenticate, auditLogController.getByUser);

router.get('/entity/:entityType/:entityId', authenticate, auditLogController.getByEntity);

router.get('/organization/:organizationId', authenticate, auditLogController.getByOrganization);

router.get('/action/:action', authenticate, auditLogController.getByAction);

router.get('/recent', authenticate, auditLogController.getRecent);

router.get('/stats', authenticate, auditLogController.getActionStats);

module.exports = router;