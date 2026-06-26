const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/response');

class UserController {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await userService.findAll(parseInt(page), parseInt(limit));
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.findById(req.params.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      return successResponse(res, user);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const user = await userService.update(req.params.id, req.body);
      return successResponse(res, user);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async updateRole(req, res) {
    try {
      const { role } = req.body;
      const user = await userService.updateRole(req.params.id, role);
      return successResponse(res, user);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      await userService.delete(req.params.id);
      return successResponse(res, { message: 'User deleted' });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new UserController();
