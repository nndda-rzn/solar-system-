import api from './api';

export const leaderboardService = {
  getTopUsers: (limit = 10) => api.get(`/leaderboard?limit=${limit}`),
  getMyRank: () => api.get('/leaderboard/me')
};
