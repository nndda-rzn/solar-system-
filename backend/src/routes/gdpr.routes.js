const express = require('express');
const router = express.Router();
const gdprController = require('../controllers/gdpr.controller');
const { authenticate } = require('../middleware/auth');

router.get('/export', authenticate, gdprController.exportData);

router.delete('/data', authenticate, gdprController.deleteData);

router.get('/agreement', gdprController.getDataAgreement);

router.post('/revoke-tokens', authenticate, gdprController.revokeTokens);

router.post('/anonymize', authenticate, gdprController.anonymizeData);

module.exports = router;