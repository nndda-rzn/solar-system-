const gdprService = require('../services/gdpr.service');
const { successResponse, errorResponse } = require('../utils/response');

class GDPRController {
  async exportData(req, res) {
    try {
      const userId = req.user.id;
      const format = req.query.format || 'json';

      let data;
      let contentType;
      let filename;

      if (format === 'csv') {
        data = await gdprService.exportUserDataAsCSV(userId);
        contentType = 'text/csv';
        filename = `user-data-${userId}-${Date.now()}.csv`;
      } else {
        data = await gdprService.exportUserDataAsJSON(userId);
        contentType = 'application/json';
        filename = `user-data-${userId}-${Date.now()}.json`;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');

      return res.send(data);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async deleteData(req, res) {
    try {
      const userId = req.user.id;
      const { confirmDelete, reason } = req.body;

      if (confirmDelete !== true) {
        return errorResponse(res, 'Confirmation required to delete data', 400);
      }

      const result = await gdprService.deleteUserData(userId, reason || 'User requested deletion');

      return successResponse(res, {
        message: 'All user data has been deleted successfully',
        deletionSummary: result,
        note: 'Your account has been soft-deleted and will be permanently removed after 90 days'
      });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getDataAgreement(req, res) {
    try {
      const agreement = await gdprService.getDataProcessingAgreement();

      return successResponse(res, agreement);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async revokeTokens(req, res) {
    try {
      const userId = req.user.id;

      const result = await gdprService.revokeAllTokens(userId);

      return successResponse(res, {
        message: 'All refresh tokens have been revoked',
        revokedCount: result.count,
        note: 'You will need to log in again'
      });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async anonymizeData(req, res) {
    try {
      const userId = req.user.id;

      const result = await gdprService.anonymizeUserData(userId);

      return successResponse(res, {
        message: 'User data has been anonymized',
        anonymized: {
          name: result.name,
          avatar: result.avatar,
          studentId: result.studentId
        }
      });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new GDPRController();