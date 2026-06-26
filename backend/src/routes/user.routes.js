const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', authenticate, authorize('ADMIN', 'TEACHER'), userController.getAll);
router.get('/:id', authenticate, userController.getById);
router.put('/:id', authenticate, userController.update);
router.put('/:id/role', authenticate, authorize('ADMIN'), userController.updateRole);
router.delete('/:id', authenticate, authorize('ADMIN'), userController.delete);

module.exports = router;
