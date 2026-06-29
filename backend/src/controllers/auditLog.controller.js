const auditLogService = require('../services/auditLog.service');
const { successResponse, errorResponse } = require('../utils/response');

class AuditLogController {
  async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await auditLogService.getLogsByUser(parseInt(userId), page, limit);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getByEntity(req, res) {
    try {
      const { entityType, entityId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await auditLogService.getLogsByEntity(entityType, entityId, page, limit);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getByOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const action = req.query.action || null;

      const result = await auditLogService.getLogsByOrganization(organizationId, page, limit, action);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getByAction(req, res) {
    try {
      const { action } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await auditLogService.getLogsByAction(action, page, limit);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getRecent(req, res) {
    try {
      const organizationId = req.query.organizationId || null;
      const limit = parseInt(req.query.limit) || 50;

      const result = await auditLogService.getRecentLogs(organizationId, limit);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getActionStats(req, res) {
    try {
      const organizationId = req.query.organizationId || null;
      const days = parseInt(req.query.days) || 30;

      const result = await auditLogService.getActionStats(organizationId, days);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new AuditLogController();