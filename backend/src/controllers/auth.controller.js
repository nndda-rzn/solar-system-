const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, errors.array()[0].msg, 400);
      }

      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);
      return successResponse(res, result, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, errors.array()[0].msg, 400);
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 401);
    }
  }

  async getMe(req, res) {
    return successResponse(res, { user: req.user });
  }
}

module.exports = new AuthController();
