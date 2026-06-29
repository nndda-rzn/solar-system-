const organizationService = require('../services/organization.service');
const { successResponse, errorResponse } = require('../utils/response');

class OrganizationController {
  async create(req, res) {
    try {
      const { name, slug, plan, maxUsers, adminEmail, adminName, adminPassword } = req.body;

      if (!name || !slug || !adminEmail || !adminName || !adminPassword) {
        return errorResponse(res, 'Missing required fields', 400);
      }

      const result = await organizationService.createOrganization({
        name,
        slug,
        plan,
        maxUsers,
        adminEmail,
        adminName,
        adminPassword
      });

      return successResponse(res, result, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await organizationService.getAllOrganizations(page, limit, search);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await organizationService.getOrganizationById(id);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const result = await organizationService.getOrganizationBySlug(slug);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await organizationService.updateOrganization(id, data);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async updateSettings(req, res) {
    try {
      const { id } = req.params;
      const settings = req.body;

      const result = await organizationService.updateOrganizationSettings(id, settings);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async getStats(req, res) {
    try {
      const { id } = req.params;
      const result = await organizationService.getOrganizationStats(id);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async suspend(req, res) {
    try {
      const { id } = req.params;
      const result = await organizationService.suspendOrganization(id);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async activate(req, res) {
    try {
      const { id } = req.params;
      const result = await organizationService.activateOrganization(id);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await organizationService.deleteOrganization(id);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
}

module.exports = new OrganizationController();