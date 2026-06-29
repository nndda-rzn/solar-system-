const prisma = require('../config/database');
const cacheService = require('./cache.service');
const { getPaginationParams, createPaginatedResponse, getSkipAndTake } = require('../utils/pagination');

class QuestionService {
  async getAll(page = 1, limit = 20, filters = {}) {
    const cacheKey = `questions:all:${page}:${limit}:${JSON.stringify(filters)}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const { skip, take } = getSkipAndTake(page, limit);

    const where = {};
    
    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.planetId) {
      where.planetId = parseInt(filters.planetId);
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { difficulty: 'asc', createdAt: 'asc' },
        skip,
        take,
        include: {
          planet: {
            select: {
              id: true,
              name: true,
              nameIndo: true
            }
          }
        }
      }),
      prisma.question.count({ where })
    ]);

    // Parse options string to JSON for each question
    const formattedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    const result = createPaginatedResponse(formattedQuestions, page, limit, total);
    
    await cacheService.set(cacheKey, result, 1800); // 30 minutes

    return result;
  }

  async getById(id) {
    const cacheKey = `question:${id}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: {
        planet: {
          select: {
            id: true,
            name: true,
            nameIndo: true
          }
        }
      }
    });

    if (question) {
      const formatted = {
        ...question,
        options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options
      };
      await cacheService.set(cacheKey, formatted, 1800);
      return formatted;
    }

    return null;
  }

  async getQuestionsByPlanet(planetId, limit = 10) {
    const cacheKey = `questions:planet:${planetId}:${limit}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const questions = await prisma.question.findMany({
      where: { planetId: parseInt(planetId) },
      take: limit,
      include: {
        planet: true
      }
    });

    const formattedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    await cacheService.set(cacheKey, formattedQuestions, 1800);

    return formattedQuestions;
  }

  async getQuestionsByDifficulty(difficulty) {
    const cacheKey = `questions:difficulty:${difficulty}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const questions = await prisma.question.findMany({
      where: { difficulty },
      orderBy: { difficulty: 'asc' },
      include: {
        planet: true
      }
    });

    const formattedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    await cacheService.set(cacheKey, formattedQuestions, 1800);

    return formattedQuestions;
  }

  async create(data) {
    // Clear question caches
    await cacheService.clear('questions:*');
    
    return prisma.question.create({
      data: {
        ...data,
        options: typeof data.options === 'object' ? JSON.stringify(data.options) : data.options
      }
    });
  }

  async update(id, data) {
    // Clear question caches
    await cacheService.clear('questions:*');
    await cacheService.clear(`question:${id}`);
    
    return prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        options: typeof data.options === 'object' ? JSON.stringify(data.options) : data.options
      }
    });
  }

  async delete(id) {
    // Clear question caches
    await cacheService.clear('questions:*');
    await cacheService.clear(`question:${id}`);
    
    return prisma.question.delete({ where: { id: parseInt(id) } });
  }

  async getQuestionCount() {
    const cacheKey = 'questions:count';
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const count = await prisma.question.count();
    await cacheService.set(cacheKey, count, 86400); // 24 hours
    
    return count;
  }
}

module.exports = new QuestionService();