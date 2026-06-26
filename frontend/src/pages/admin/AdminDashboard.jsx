import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, HelpCircle, Award } from 'lucide-react';
import GlassPanel from '../../components/ui/GlassPanel';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        setStats({
          totalUsers: data?.length || 0,
          totalQuizzes: 0,
          totalCourses: 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({ totalUsers: 0, totalQuizzes: 0, totalCourses: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-blue-400' },
    { icon: HelpCircle, label: 'Total Quizzes', value: stats?.totalQuizzes || 0, color: 'text-green-400' },
    { icon: BookOpen, label: 'Total Courses', value: stats?.totalCourses || 0, color: 'text-yellow-400' },
    { icon: Award, label: 'Certificates', value: 0, color: 'text-purple-400' }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-4xl mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassPanel>
                <div className="flex items-center gap-4">
                  <stat.icon className={stat.color} size={32} />
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-white/50 text-sm">{stat.label}</div>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <GlassPanel>
            <h3 className="font-heading text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors">
                Kelola Planet
              </button>
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors">
                Kelola Soal Kuis
              </button>
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors">
                Kelola User
              </button>
            </div>
          </GlassPanel>

          <GlassPanel>
            <h3 className="font-heading text-lg mb-4">System Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Status</span>
                <span className="text-green-400">Running</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Database</span>
                <span>SQLite</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">API Version</span>
                <span>1.0.0</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;