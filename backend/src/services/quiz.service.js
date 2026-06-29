const prisma = require('../config/database');

class QuizService {
  async getQuestionsByOrganization(orgId) {
    const questions = await prisma.question.findMany({
      where: {
        planet: {
          questions: {
            some: {}
          }
        }
      },
      include: {
        planet: {
          select: {
            name: true,
            nameIndo: true
          }
        }
      }
    });
    
    return questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
  }

  async getQuestionsByDifficulty(difficulty) {
    return prisma.question.findMany({
      where: { difficulty },
      include: {
        planet: {
          select: {
            name: true,
            nameIndo: true
          }
        }
      }
    });
  }

  async getQuestionsByPlanet(planetId) {
    return prisma.question.findMany({
      where: { planetId },
      include: {
        planet: true
      }
    });
  }

  async submitQuiz(userId, answers, quizType = 'GENERAL', templateId = null) {
    let score = 0;
    let totalQuestions = answers.length;

    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        templateId,
        startedAt: new Date(),
        status: 'IN_PROGRESS'
      }
    });

    const quizAnswers = [];
    let totalTimeTaken = 0;

    for (const answer of answers) {
      const question = await prisma.question.findUnique({
        where: { id: answer.questionId }
      });

      if (question) {
        const isCorrect = question.correctIndex === answer.selectedIndex;
        const timeTaken = answer.timeTaken || 0;
        
        if (isCorrect) {
          score++;
        }

        totalTimeTaken += timeTaken;

        const quizAnswer = await prisma.quizAnswer.create({
          data: {
            attemptId: quizAttempt.id,
            questionId: answer.questionId,
            selectedIndex: answer.selectedIndex,
            isCorrect,
            timeTaken
          }
        });

        quizAnswers.push(quizAnswer);
      }
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: quizAttempt.id },
      data: {
        completedAt: new Date(),
        timeSpent: totalTimeTaken,
        totalScore: score,
        maxScore: totalQuestions,
        percentage,
        status: 'COMPLETED'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            organizationId: true
          }
        }
      }
    });

    await prisma.score.create({
      data: {
        userId,
        quizType,
        score,
        totalQuestions,
        percentage,
        timeTaken: totalTimeTaken,
        isCorrect: percentage >= 70
      }
    });

    if (percentage >= 70) {
      await prisma.$transaction([
        prisma.leaderboard.update({
          where: { userId },
          data: {
            totalScore: { increment: score },
            quizzesTaken: { increment: 1 }
          },
          skip: false,
          rejectOnNotFound: false
        }),
        prisma.leaderboard.create({
          data: {
            userId,
            totalScore: score,
            quizzesTaken: 1,
            avgPercentage: percentage
          },
          skip: false,
          rejectOnNotFound: true
        })
      ]).catch(() => {
        return prisma.leaderboard.create({
          data: {
            userId,
            totalScore: score,
            quizzesTaken: 1,
            avgPercentage: percentage
          }
        });
      });
    }

    return {
      attemptId: quizAttempt.id,
      score,
      totalQuestions,
      percentage,
      timeSpent: totalTimeTaken,
      quizAnswers,
      user: updatedAttempt.user
    };
  }

  async getQuizHistory(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          template: {
            select: {
              name: true,
              grade: true,
              subject: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.quizAttempt.count({ where: { userId } })
    ]);

    return {
      data: attempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getQuizStats(userId) {
    const [totalAttempts, completedAttempts, avgScore, avgTime] = await Promise.all([
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.quizAttempt.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.quizAttempt.aggregate({
        where: { userId, status: 'COMPLETED' },
        _avg: { percentage: true }
      }),
      prisma.quizAttempt.aggregate({
        where: { userId, status: 'COMPLETED' },
        _avg: { timeSpent: true }
      })
    ]);

    const performanceBreakdown = await prisma.quizAnswer.groupBy({
      by: ['isCorrect'],
      where: { attempt: { userId } },
      _count: true
    });

    const difficultyStats = await prisma.quizAnswer.groupBy({
      by: ['question.difficulty'],
      where: { attempt: { userId } },
      _count: true,
      question: true
    });

    const planetStats = await prisma.quizAnswer.groupBy({
      by: ['question.planetId'],
      where: { attempt: { userId } },
      _count: true,
      question: {
        select: {
          planet: {
            select: {
              name: true
            }
          }
        }
      }
    });

    return {
      totalAttempts,
      completedAttempts,
      avgPercentage: avgScore._avg.percentage || 0,
      avgTime: avgTime._avg.timeSpent || 0,
      performance: {
        correct: performanceBreakdown.find(p => p.isCorrect === true)?._count || 0,
        incorrect: performanceBreakdown.find(p => p.isCorrect === false)?._count || 0
      },
      difficultyStats: difficultyStats.map(d => ({
        difficulty: d['question.difficulty'],
        count: d._count
      })),
      planetStats: planetStats.map(p => ({
        planet: p['question.planet']?.name || 'General',
        count: p._count
      }))
    };
  }

  async getOrganizationQuizStats(orgId, dateRange = 'last-30-days') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange.replace('last-', '').replace('-days', '')));

    const users = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: { id: true }
    });

    const userIds = users.map(u => u.id);

    const [totalAttempts, avgScore, avgTime, completionRate] = await Promise.all([
      prisma.quizAttempt.count({
        where: {
          userId: { in: userIds },
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
      prisma.quizAttempt.aggregate({
        where: {
          userId: { in: userIds },
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        _avg: { timeSpent: true }
      }),
      prisma.quizAttempt.aggregate({
        where: {
          userId: { in: userIds },
          createdAt: { gte: startDate }
        },
        _count: { status: true }
      })
    ]);

    const [passRate, topPerformers] = await Promise.all([
      prisma.quizAttempt.count({
        where: {
          userId: { in: userIds },
          percentage: { gte: 70 },
          createdAt: { gte: startDate }
        }
      }),
      prisma.quizAttempt.groupBy({
        by: ['userId'],
        where: {
          userId: { in: userIds },
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        _avg: { percentage: true },
        _count: true,
        orderBy: { _avg: { percentage: 'desc' } },
        take: 5
      })
    ]);

    return {
      totalAttempts,
      avgPercentage: avgScore._avg.percentage || 0,
      avgTime: avgTime._avg.timeSpent || 0,
      completionRate: (totalAttempts / totalAttempts) * 100,
      passRate: completionRate._count.status === 0 ? 0 : (passRate / totalAttempts) * 100,
      topPerformers: topPerformers.map(p => ({
        userId: p.userId,
        avgPercentage: p._avg.percentage,
        attempts: p._count
      }))
    };
  }
}

module.exports = new QuizService();