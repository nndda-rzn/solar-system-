const prisma = require('../config/database');

class AnalyticsService {
  async getOrganizationAnalytics(orgId, dateRange = 'last-30-days') {
    const days = parseInt(dateRange.replace('last-', '').replace('-days', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: { id: true }
    });
    
    const userIds = users.map(u => u.id);

    const [activeUsers, quizStats, featureUsage, userGrowth] = await Promise.all([
      this.getActiveUsers(userIds, startDate),
      this.getQuizStats(userIds, startDate),
      this.getFeatureUsage(userIds, startDate),
      this.getUserGrowth(orgId, startDate)
    ]);

    return {
      activeUsers,
      quizStats,
      featureUsage,
      userGrowth,
      trends: this.calculateTrends(activeUsers, quizStats)
    };
  }

  async getActiveUsers(userIds, startDate) {
    const activeUserCount = await prisma.user.count({
      where: {
        id: { in: userIds },
        lastLoginAt: { gte: startDate }
      }
    });

    const loginsByDay = await prisma.auditLog.groupBy({
      by: ['createdAt'],
      where: {
        userId: { in: userIds },
        action: 'LOGIN',
        createdAt: { gte: startDate }
      },
      _count: true
    });

    const groupedByDay = {};
    loginsByDay.forEach(login => {
      const day = login.createdAt.toISOString().split('T')[0];
      groupedByDay[day] = (groupedByDay[day] || 0) + login._count;
    });

    return {
      total: activeUserCount,
      byDay: groupedByDay,
      avgPerDay: Object.values(groupedByDay).reduce((a, b) => a + b, 0) / Object.keys(groupedByDay).length || 0
    };
  }

  async getQuizStats(userIds, startDate) {
    const [totalAttempts, completedAttempts, avgScore, passRate] = await Promise.all([
      prisma.quizAttempt.count({
        where: {
          userId: { in: userIds },
          createdAt: { gte: startDate }
        }
      }),
      prisma.quizAttempt.count({
        where: {
          userId: { in: userIds },
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      }),
      prisma.quizAttempt.aggregate({
        where: {
          userId: { in: userIds },
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        _avg: { percentage: true }
      }),
      prisma.quizAttempt.count({
        where: {
          userId: { in: userIds },
          percentage: { gte: 70 },
          createdAt: { gte: startDate }
        }
      })
    ]);

    const quizzesByDay = await prisma.quizAttempt.groupBy({
      by: ['createdAt'],
      where: {
        userId: { in: userIds },
        createdAt: { gte: startDate }
      },
      _count: true
    });

    const groupedByDay = {};
    quizzesByDay.forEach(quiz => {
      const day = quiz.createdAt.toISOString().split('T')[0];
      groupedByDay[day] = (groupedByDay[day] || 0) + quiz._count;
    });

    return {
      totalAttempts,
      completedAttempts,
      avgScore: avgScore._avg.percentage || 0,
      passRate: totalAttempts > 0 ? (passRate / totalAttempts) * 100 : 0,
      completionRate: totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0,
      byDay: groupedByDay
    };
  }

  async getFeatureUsage(userIds, startDate) {
    const actions = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        userId: { in: userIds },
        createdAt: { gte: startDate }
      },
      _count: true,
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    });

    const featureMap = {
      'LOGIN': 'Authentication',
      'LOGOUT': 'Authentication',
      'QUIZ_START': 'Quiz',
      'QUIZ_SUBMIT': 'Quiz',
      'VIEW_PLANET': 'Exploration',
      'COMPARE_PLANETS': 'Comparison',
      'VIEW_TIMELINE': 'Timeline',
      'VIEW_LEADERBOARD': 'Leaderboard'
    };

    const featureUsage = {};
    actions.forEach(action => {
      const feature = featureMap[action.action] || 'Other';
      featureUsage[feature] = (featureUsage[feature] || 0) + action._count;
    });

    return featureUsage;
  }

  async getUserGrowth(orgId, startDate) {
    const usersByDay = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        organizationId: orgId,
        createdAt: { gte: startDate }
      },
      _count: true
    });

    const groupedByDay = {};
    usersByDay.forEach(user => {
      const day = user.createdAt.toISOString().split('T')[0];
      groupedByDay[day] = (groupedByDay[day] || 0) + user._count;
    });

    return groupedByDay;
  }

  calculateTrends(activeUsers, quizStats) {
    const avgActiveUsers = activeUsers.avgPerDay;
    const avgQuizzes = Object.values(quizStats.byDay).reduce((a, b) => a + b, 0) / Object.keys(quizStats.byDay).length || 0;

    return {
      userActivity: avgActiveUsers > 0 ? '+' + avgActiveUsers.toFixed(0) + ' users/day' : 'No activity',
      quizActivity: avgQuizzes > 0 ? '+' + avgQuizzes.toFixed(0) + ' quizzes/day' : 'No quizzes',
      performance: quizStats.avgScore > 70 ? 'Good' : quizStats.avgScore > 50 ? 'Average' : 'Needs Improvement'
    };
  }

  async getStudentProgress(userId) {
    const [quizHistory, overallStats, topicPerformance, timeSeriesData] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 20,
        select: {
          id: true,
          percentage: true,
          timeSpent: true,
          createdAt: true,
          template: {
            select: {
              name: true,
              subject: true
            }
          }
        }
      }),
      this.getUserOverallStats(userId),
      this.getTopicPerformance(userId),
      this.getTimeSeriesProgress(userId)
    ]);

    const improvement = this.calculateImprovement(quizHistory);

    return {
      quizHistory,
      overallStats,
      topicPerformance,
      timeSeriesData,
      improvement
    };
  }

  async getUserOverallStats(userId) {
    const [totalAttempts, avgScore, totalTimeSpent, strongestTopic, weakestTopic] = await Promise.all([
      prisma.quizAttempt.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.quizAttempt.aggregate({
        where: { userId, status: 'COMPLETED' },
        _avg: { percentage: true }
      }),
      prisma.quizAttempt.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { timeSpent: true }
      }),
      this.getStrongestTopic(userId),
      this.getWeakestTopic(userId)
    ]);

    return {
      totalAttempts,
      avgScore: avgScore._avg.percentage || 0,
      totalTimeSpent: totalTimeSpent._sum.timeSpent || 0,
      strongestTopic,
      weakestTopic
    };
  }

  async getTopicPerformance(userId) {
    const planetPerformance = await prisma.quizAnswer.groupBy({
      by: ['questionId'],
      where: {
        attempt: { userId }
      },
      _count: { isCorrect: true },
      _avg: { isCorrect: true }
    });

    return planetPerformance.map(p => ({
      topic: 'Planet Topic',
      correctRate: (p._avg.isCorrect || 0) * 100,
      attempts: p._count.isCorrect
    }));
  }

  async getTimeSeriesProgress(userId) {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'asc' },
      select: {
        percentage: true,
        createdAt: true
      }
    });

    return attempts.map(a => ({
      date: a.createdAt.toISOString().split('T')[0],
      score: a.percentage
    }));
  }

  calculateImprovement(quizHistory) {
    if (quizHistory.length < 2) {
      return { trend: 'Insufficient data', change: 0 };
    }

    const recent = quizHistory.slice(-5);
    const earlier = quizHistory.slice(0, 5);

    const recentAvg = recent.reduce((sum, q) => sum + q.percentage, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, q) => sum + q.percentage, 0) / earlier.length;

    const change = recentAvg - earlierAvg;

    return {
      trend: change > 5 ? 'Improving' : change < -5 ? 'Declining' : 'Stable',
      change: change.toFixed(2)
    };
  }

  async getStrongestTopic(userId) {
    const topicStats = await prisma.quizAnswer.groupBy({
      by: ['questionId'],
      where: {
        attempt: { userId },
        isCorrect: true
      },
      _count: true,
      orderBy: {
        _count: {
          questionId: 'desc'
        }
      },
      take: 1
    });

    return topicStats[0] ? 'Topic ' + topicStats[0].questionId : 'N/A';
  }

  async getWeakestTopic(userId) {
    const topicStats = await prisma.quizAnswer.groupBy({
      by: ['questionId'],
      where: {
        attempt: { userId },
        isCorrect: false
      },
      _count: true,
      orderBy: {
        _count: {
          questionId: 'desc'
        }
      },
      take: 1
    });

    return topicStats[0] ? 'Topic ' + topicStats[0].questionId : 'N/A';
  }

  async exportReport(orgId, format = 'json', dateRange = 'last-30-days') {
    const analytics = await this.getOrganizationAnalytics(orgId, dateRange);

    if (format === 'json') {
      return {
        organization: orgId,
        dateRange,
        generatedAt: new Date().toISOString(),
        data: analytics
      };
    }

    return analytics;
  }
}

module.exports = new AnalyticsService();