const prisma = require('../config/database');
const { hashPassword } = require('../utils/password');

class GDPRService {
  async exportUserData(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        scores: true,
        quizAttempts: {
          include: {
            answers: true
          }
        },
        auditLogs: true,
        leaderboard: true,
        refreshTokens: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    const sanitized = {
      user: {
        ...user,
        password: undefined,
        refreshTokens: user.refreshTokens.map(rt => ({
          ...rt,
          token: '***REDACTED***'
        }))
      },
      exportedAt: new Date().toISOString(),
      dataRetentionPolicy: {
        description: 'Your data is retained for active account management',
        retentionPeriod: '90 days after account deletion',
        deleteAfterDays: 90
      }
    };

    return sanitized;
  }

  async exportUserDataAsJSON(userId) {
    const data = await this.exportUserData(userId);
    return JSON.stringify(data, null, 2);
  }

  async exportUserDataAsCSV(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        scores: true,
        quizAttempts: true,
        auditLogs: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    let csv = 'Data Export for: ' + user.email + '\n';
    csv += 'Exported at: ' + new Date().toISOString() + '\n\n';

    csv += '=== USER INFORMATION ===\n';
    csv += 'ID,Email,Name,Role,Organization,Created,Last Login\n';
    csv += `${user.id},"${user.email}","${user.name}","${user.role}","${user.organizationId || 'N/A'}","${user.createdAt}","${user.lastLoginAt || 'N/A'}"\n\n`;

    csv += '=== QUIZ SCORES ===\n';
    csv += 'ID,Score,Total,Percentage,Time Taken,Date\n';
    user.scores.forEach(score => {
      csv += `${score.id},${score.score},${score.totalQuestions},${score.percentage},${score.timeTaken},"${score.createdAt}"\n`;
    });
    csv += '\n';

    csv += '=== QUIZ ATTEMPTS ===\n';
    csv += 'ID,Total Score,Max Score,Percentage,Time Spent,Status,Date\n';
    user.quizAttempts.forEach(attempt => {
      csv += `${attempt.id},${attempt.totalScore || 'N/A'},${attempt.maxScore || 'N/A'},${attempt.percentage || 'N/A'},${attempt.timeSpent || 'N/A'},"${attempt.status}","${attempt.createdAt}"\n`;
    });
    csv += '\n';

    csv += '=== ACTIVITY LOG ===\n';
    csv += 'Action,Entity Type,Entity ID,Date,IP Address\n';
    user.auditLogs.forEach(log => {
      csv += `"${log.action}","${log.entityType}","${log.entityId || 'N/A'}","${log.createdAt}","${log.ipAddress || 'N/A'}"\n`;
    });

    return csv;
  }

  async deleteUserData(userId, reason = 'User requested deletion') {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create audit log before deletion
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_DELETION_REQUESTED',
        entityType: 'USER',
        entityId: String(userId),
        newValues: JSON.stringify({ reason, deletedAt: new Date().toISOString() })
      }
    });

    // Delete all user data in transaction
    const result = await prisma.$transaction(async (tx) => {
      const deletedScores = await tx.score.deleteMany({
        where: { userId }
      });

      const deletedAnswers = await tx.quizAnswer.deleteMany({
        where: { attempt: { userId } }
      });

      const deletedAttempts = await tx.quizAttempt.deleteMany({
        where: { userId }
      });

      const deletedLogs = await tx.auditLog.deleteMany({
        where: { userId }
      });

      const deletedTokens = await tx.refreshToken.deleteMany({
        where: { userId }
      });

      await tx.leaderboard.deleteMany({
        where: { userId }
      });

      // Soft delete user
      const deletedUser = await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${userId}_${Date.now()}@deleted.local`,
          password: '***DELETED***',
          name: 'Deleted User',
          deletedAt: new Date()
        }
      });

      return {
        deletedUser,
        deletedScores: deletedScores.count,
        deletedAnswers: deletedAnswers.count,
        deletedAttempts: deletedAttempts.count,
        deletedLogs: deletedLogs.count,
        deletedTokens: deletedTokens.count
      };
    });

    return result;
  }

  async applyRetentionPolicy(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.$transaction(async (tx) => {
      const deletedLogs = await tx.auditLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          action: { notIn: ['USER_DELETION_REQUESTED'] }
        }
      });

      const deletedOldScores = await tx.score.deleteMany({
        where: {
          user: { deletedAt: { lt: cutoffDate } }
        }
      });

      const deletedOldUsers = await tx.user.deleteMany({
        where: {
          deletedAt: { lt: cutoffDate }
        }
      });

      return {
        deletedAuditLogs: deletedLogs.count,
        deletedScores: deletedOldScores.count,
        deletedUsers: deletedOldUsers.count
      };
    });

    return result;
  }

  async anonymizeUserData(userId) {
    const anonymized = await prisma.user.update({
      where: { id: userId },
      data: {
        name: `User_${userId}`,
        avatar: null,
        studentId: null,
        grade: null
      }
    });

    return anonymized;
  }

  async revokeAllTokens(userId) {
    const result = await prisma.refreshToken.updateMany({
      where: { userId },
      data: {
        revokedAt: new Date(),
        revokedBy: 'USER_REQUEST'
      }
    });

    return result;
  }

  async getDataProcessingAgreement() {
    return {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      dataController: 'Solar System Educational Platform',
      dataProcessors: [
        'AWS (Cloud hosting)',
        'Prisma (Database ORM)',
        'JWT (Authentication)'
      ],
      dataRetention: {
        active_users: 'Until account deletion',
        deleted_users: '90 days after deletion',
        audit_logs: '90 days',
        sessions: '7 days'
      },
      userRights: [
        'Right to access personal data',
        'Right to correction',
        'Right to erasure (right to be forgotten)',
        'Right to data portability',
        'Right to object to processing',
        'Right to restrict processing'
      ]
    };
  }
}

module.exports = new GDPRService();