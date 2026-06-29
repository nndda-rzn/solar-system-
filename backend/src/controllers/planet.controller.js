const planetService = require('../services/planet.service');
const { successResponse, errorResponse } = require('../utils/response');
const { getPaginationParams } = require('../utils/pagination');

class PlanetController {
  async getAll(req, res) {
    try {
      const { page, limit } = getPaginationParams(req.query);
      const search = req.query.search || '';

      const result = await planetService.findAll(page, limit, search);
      return successResponse(res, result);
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

  async getByName(req, res) {
    try {
      const planet = await planetService.findByName(req.params.name);
      if (!planet) {
        return errorResponse(res, 'Planet not found', 404);
      }
      return successResponse(res, planet);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async search(req, res) {
    try {
      const { page, limit } = getPaginationParams(req.query);
      const search = req.query.q || '';

      if (!search) {
        return errorResponse(res, 'Search query required', 400);
      }

      const result = await planetService.searchPlanets(search, page, limit);
      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getByDifficulty(req, res) {
    try {
      const { difficulty } = req.params;
      const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];

      if (!validDifficulties.includes(difficulty)) {
        return errorResponse(res, 'Invalid difficulty level', 400);
      }

      const planets = await planetService.getPlanetsByDifficulty(difficulty);
      return successResponse(res, planets);
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

  async getStats(req, res) {
    try {
      const count = await planetService.getPlanetCount();
      return successResponse(res, { totalPlanets: count });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new PlanetController();