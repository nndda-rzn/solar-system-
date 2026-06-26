const questionService = require('../services/question.service');
const { successResponse, errorResponse } = require('../utils/response');

class QuestionController {
  async getAll(req, res) {
    try {
      const questions = await questionService.findAll(req.query);
      const parsed = questions.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }));
      return successResponse(res, parsed);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const question = await questionService.create(req.body);
      return successResponse(res, question, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const question = await questionService.update(req.params.id, req.body);
      return successResponse(res, question);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      await questionService.delete(req.params.id);
      return successResponse(res, { message: 'Question deleted' });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new QuestionController();
