const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', questionController.getAll);
router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), questionController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), questionController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), questionController.delete);

module.exports = router;
