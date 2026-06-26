const prisma = require('../config/database');

class QuizService {
  async submitQuiz(userId, answers, quizType = 'general') {
    let score = 0;
    const totalQuestions = answers.length;

    for (const answer of answers) {
      const question = await prisma.question.findUnique({
        where: { id: answer.questionId }
      });

      if (question) {
        const isCorrect = question.correctIndex === answer.selectedIndex;
        if (isCorrect) score++;

        await prisma.score.create({
          data: {
            userId,
            questionId: answer.questionId,
            quizType,
            score: isCorrect ? 1 : 0,
            totalQuestions: 1,
            percentage: isCorrect ? 100 : 0,
            timeTaken: answer.timeTaken || 0,
            isCorrect
          }
        });
      }
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    const existingLeaderboard = await prisma.leaderboard.findUnique({
      where: { userId }
    });

    if (existingLeaderboard) {
      const newTotalQuizzes = existingLeaderboard.quizzesTaken + 1;
      const newAvgPercentage = (
        (existingLeaderboard.avgPercentage * existingLeaderboard.quizzesTaken + percentage) /
        newTotalQuizzes
      );
      await prisma.leaderboard.update({
        where: { userId },
        data: {
          totalScore: { increment: score },
          quizzesTaken: { increment: 1 },
          avgPercentage: Math.round(newAvgPercentage * 100) / 100
        }
      });
    } else {
      await prisma.leaderboard.create({
        data: {
          userId,
          totalScore: score,
          quizzesTaken: 1,
          avgPercentage: percentage
        }
      });
    }

    return { score, totalQuestions, percentage };
  }

  async getHistory(userId) {
    return prisma.score.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
}

module.exports = new QuizService();
