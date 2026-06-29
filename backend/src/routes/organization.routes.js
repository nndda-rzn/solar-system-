const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

router.post('/', 
  authenticate,
  [
    body('name').notEmpty().withMessage('Organization name is required'),
    body('slug').notEmpty().withMessage('Slug is required').matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with hyphens'),
    body('adminEmail').isEmail().withMessage('Valid admin email is required'),
    body('adminName').notEmpty().withMessage('Admin name is required'),
    body('adminPassword').isLength({ min: 8 }).withMessage('Admin password must be at least 8 characters')
  ],
  organizationController.create
);

router.get('/', authenticate, organizationController.getAll);

router.get('/:id', authenticate, organizationController.getById);

router.get('/slug/:slug', organizationController.getBySlug);

router.patch('/:id', authenticate, organizationController.update);

router.patch('/:id/settings', authenticate, organizationController.updateSettings);

router.get('/:id/stats', authenticate, organizationController.getStats);

router.post('/:id/suspend', authenticate, organizationController.suspend);

router.post('/:id/activate', authenticate, organizationController.activate);

router.delete('/:id', authenticate, organizationController.delete);

module.exports = router;