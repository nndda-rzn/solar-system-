const quizService = require('../services/quiz.service');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

class QuizController {
  async getQuestions(req, res) {
    try {
      const orgId = req.user.organizationId;
      const difficulty = req.query.difficulty;
      const planetId = req.query.planetId;

      let questions;

      if (difficulty) {
        questions = await quizService.getQuestionsByDifficulty(difficulty);
      } else if (planetId) {
        questions = await quizService.getQuestionsByPlanet(planetId);
      } else {
        questions = await quizService.getQuestionsByOrganization(orgId);
      }

      return successResponse(res, questions);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async submit(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, errors.array()[0].msg, 400);
      }

      const { answers, quizType = 'GENERAL', templateId } = req.body;

      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return errorResponse(res, 'Answers are required', 400);
      }

      const result = await quizService.submitQuiz(req.user.id, answers, quizType, templateId);

      return successResponse(res, result, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await quizService.getQuizHistory(userId, page, limit);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getStats(req, res) {
    try {
      const userId = req.user.id;
      const result = await quizService.getQuizStats(userId);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getOrganizationStats(req, res) {
    try {
      const organizationId = req.params.organizationId;
      const dateRange = req.query.dateRange || 'last-30-days';

      const result = await quizService.getOrganizationQuizStats(organizationId, dateRange);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async getQuizTemplate(req, res) {
    try {
      const { id } = req.params;
      
      const template = await prisma.quizTemplate.findUnique({
        where: { id },
        include: {
          questions: {
            include: {
              question: true
            }
          },
          createdBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!template) {
        return errorResponse(res, 'Quiz template not found', 404);
      }

      return successResponse(res, template);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new QuizController();