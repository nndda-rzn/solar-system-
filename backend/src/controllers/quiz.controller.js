const quizService = require('../services/quiz.service');
const { successResponse, errorResponse } = require('../utils/response');

class QuizController {
  async submit(req, res) {
    try {
      const { answers, quizType } = req.body;
      const result = await quizService.submitQuiz(req.user.id, answers, quizType);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getHistory(req, res) {
    try {
      const history = await quizService.getHistory(req.user.id);
      return successResponse(res, history);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new QuizController();
