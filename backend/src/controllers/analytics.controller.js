const analyticsService = require('../services/analytics.service');
const { successResponse, errorResponse } = require('../utils/response');

class AnalyticsController {
  async getOrganizationAnalytics(req, res) {
    try {
      const { organizationId } = req.params;
      const dateRange = req.query.dateRange || 'last-30-days';

      const result = await analyticsService.getOrganizationAnalytics(organizationId, dateRange);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async getStudentProgress(req, res) {
    try {
      const userId = req.user.id;

      const result = await analyticsService.getStudentProgress(userId);

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getStudentProgressById(req, res) {
    try {
      const { userId } = req.params;

      if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER' && req.user.id !== parseInt(userId)) {
        return errorResponse(res, 'Access denied', 403);
      }

      const result = await analyticsService.getStudentProgress(parseInt(userId));

      return successResponse(res, result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async exportReport(req, res) {
    try {
      const { organizationId } = req.params;
      const format = req.query.format || 'json';
      const dateRange = req.query.dateRange || 'last-30-days';

      const report = await analyticsService.exportReport(organizationId, format, dateRange);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.csv');
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.json');
      }

      return successResponse(res, report);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async getDashboardData(req, res) {
    try {
      const organizationId = req.user.organizationId;

      const [analytics, topStudents, recentActivity] = await Promise.all([
        analyticsService.getOrganizationAnalytics(organizationId, 'last-7-days'),
        this.getTopStudents(organizationId),
        this.getRecentActivity(organizationId)
      ]);

      return successResponse(res, {
        analytics,
        topStudents,
        recentActivity
      });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getTopStudents(organizationId) {
    const prisma = require('../config/database');
    
    return prisma.leaderboard.findMany({
      where: {
        user: {
          organizationId
        }
      },
      take: 10,
      orderBy: { totalScore: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            grade: true
          }
        }
      }
    });
  }

  async getRecentActivity(organizationId) {
    const prisma = require('../config/database');
    
    const users = await prisma.user.findMany({
      where: { organizationId },
      select: { id: true }
    });

    const userIds = users.map(u => u.id);

    return prisma.auditLog.findMany({
      where: {
        userId: { in: userIds }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }
}

module.exports = new AnalyticsController();