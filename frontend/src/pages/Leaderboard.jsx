import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { leaderboardService } from '../services/leaderboardService';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await leaderboardService.getTopUsers(10);
        const entries = response.data ?? response;
        setLeaderboard(Array.isArray(entries) ? entries : []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="font-heading text-4xl text-center mb-8">Leaderboard</h1>

        <GlassPanel>
          {leaderboard.length === 0 ? (
            <p className="text-center text-white/50 py-8">Belum ada skor. Jadilah yang pertama!</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0 ? 'bg-yellow-500/20' :
                    index === 1 ? 'bg-gray-400/20' :
                    index === 2 ? 'bg-orange-500/20' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-heading text-lg w-8 ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-400' : 'text-white/50'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="font-medium">{entry.user?.name || 'Anonymous'}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-lg">{entry.totalScore}</div>
                    <div className="text-xs text-white/50">{entry.quizzesTaken} kuis</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassPanel>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
