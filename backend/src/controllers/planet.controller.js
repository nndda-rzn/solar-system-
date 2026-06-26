const planetService = require('../services/planet.service');
const { successResponse, errorResponse } = require('../utils/response');

class PlanetController {
  async getAll(req, res) {
    try {
      const planets = await planetService.findAll();
      return successResponse(res, planets);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getById(req, res) {
    try {
      const planet = await planetService.findById(req.params.id);
      if (!planet) {
        return errorResponse(res, 'Planet not found', 404);
      }
      return successResponse(res, planet);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const planet = await planetService.create(req.body);
      return successResponse(res, planet, 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async update(req, res) {
    try {
      const planet = await planetService.update(req.params.id, req.body);
      return successResponse(res, planet);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async delete(req, res) {
    try {
      await planetService.delete(req.params.id);
      return successResponse(res, { message: 'Planet deleted' });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new PlanetController();
