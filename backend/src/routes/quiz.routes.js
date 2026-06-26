const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { authenticate } = require('../middleware/auth');

router.post('/submit', authenticate, quizController.submit);
router.get('/history', authenticate, quizController.getHistory);

module.exports = router;
