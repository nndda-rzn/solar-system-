const leaderboardService = require('../services/leaderboard.service');
const { successResponse, errorResponse } = require('../utils/response');

class LeaderboardController {
  async getTopUsers(req, res) {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await leaderboardService.getTopUsers(parseInt(limit));
      return successResponse(res, leaderboard);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  async getUserRank(req, res) {
    try {
      const rank = await leaderboardService.getUserRank(req.user.id);
      return successResponse(res, rank);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

module.exports = new LeaderboardController();
