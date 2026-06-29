const prisma = require('../config/database');

class AuditLogService {
  async createLog(data) {
    const { userId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent } = data;

    const log = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      }
    });

    return log;
  }

  async getLogsByUser(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where: { userId } })
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLogsByEntity(entityType, entityId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { entityType, entityId: String(entityId) },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where: { entityType, entityId: String(entityId) } })
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLogsByOrganization(organizationId, page = 1, limit = 20, action = null) {
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: { organizationId },
      select: { id: true }
    });
    
    const userIds = users.map(u => u.id);

    const where = {
      userId: { in: userIds },
      ...(action && { action })
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLogsByAction(action, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { action },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where: { action } })
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getRecentLogs(organizationId, limit = 50) {
    const users = organizationId 
      ? await prisma.user.findMany({
          where: { organizationId },
          select: { id: true }
        })
      : [];
    
    const userIds = users.map(u => u.id);

    const where = organizationId 
      ? { userId: { in: userIds } }
      : {};

    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
  }

  async getActionStats(organizationId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = organizationId 
      ? await prisma.user.findMany({
          where: { organizationId },
          select: { id: true }
        })
      : [];
    
    const userIds = users.map(u => u.id);

    const where = {
      createdAt: { gte: startDate },
      ...(organizationId && { userId: { in: userIds } })
    };

    const stats = await prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: true,
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    });

    return stats.map(s => ({
      action: s.action,
      count: s._count
    }));
  }
}

module.exports = new AuditLogService();