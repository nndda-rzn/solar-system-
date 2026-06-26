const express = require('express');
const router = express.Router();
const planetController = require('../controllers/planet.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', planetController.getAll);
router.get('/:id', planetController.getById);
router.post('/', authenticate, authorize('ADMIN'), planetController.create);
router.put('/:id', authenticate, authorize('ADMIN'), planetController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), planetController.delete);

module.exports = router;
