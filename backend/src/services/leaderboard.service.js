const prisma = require('../config/database');

class LeaderboardService {
  async getTopUsers(limit = 10) {
    return prisma.leaderboard.findMany({
      take: limit,
      orderBy: { totalScore: 'desc' },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });
  }

  async getUserRank(userId) {
    const user = await prisma.leaderboard.findUnique({ where: { userId } });
    if (!user) return null;

    const rank = await prisma.leaderboard.count({
      where: { totalScore: { gt: user.totalScore } }
    });

    return { ...user, rank: rank + 1 };
  }
}

module.exports = new LeaderboardService();
