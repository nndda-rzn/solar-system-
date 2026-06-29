const prisma = require('../config/database');
const cacheService = require('./cache.service');
const { getPaginationParams, createPaginatedResponse, getSkipAndTake } = require('../utils/pagination');

class PlanetService {
  async findAll(page = 1, limit = 10, search = '') {
    const cacheKey = `planets:all:${page}:${limit}:${search}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const { skip, take } = getSkipAndTake(page, limit);

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { nameIndo: { contains: search } }
      ]
    } : {};

    const [planets, total] = await Promise.all([
      prisma.planet.findMany({
        where,
        orderBy: { order: 'asc' },
        skip,
        take,
        include: {
          _count: {
            select: { questions: true }
          }
        }
      }),
      prisma.planet.count({ where })
    ]);

    const result = createPaginatedResponse(planets, page, limit, total);
    
    await cacheService.set(cacheKey, result, 3600);

    return result;
  }

  async findById(id) {
    const cacheKey = `planet:${id}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const planet = await prisma.planet.findUnique({
      where: { id: parseInt(id) },
      include: {
        questions: {
          select: {
            id: true,
            question: true,
            difficulty: true
          },
          take: 5
        }
      }
    });

    if (planet) {
      await cacheService.set(cacheKey, planet, 3600);
    }

    return planet;
  }

  async findByName(name) {
    const cacheKey = `planet:${name}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const planet = await prisma.planet.findFirst({
      where: { name },
      include: {
        questions: true
      }
    });

    if (planet) {
      await cacheService.set(cacheKey, planet, 3600);
    }

    return planet;
  }

  async create(data) {
    // Clear planet caches
    await cacheService.clear('planet:*');
    await cacheService.clear('planets:*');
    
    return prisma.planet.create({ data });
  }

  async update(id, data) {
    // Clear planet caches
    await cacheService.clear('planet:*');
    await cacheService.clear('planets:*');
    
    return prisma.planet.update({ where: { id: parseInt(id) }, data });
  }

  async delete(id) {
    // Clear planet caches
    await cacheService.clear('planet:*');
    await cacheService.clear('planets:*');
    
    return prisma.planet.delete({ where: { id: parseInt(id) } });
  }

  async getPlanetCount() {
    const cacheKey = 'planets:count';
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const count = await prisma.planet.count();
    await cacheService.set(cacheKey, count, 86400); // 24 hours
    
    return count;
  }

  async getPlanetsByDifficulty(difficulty) {
    const cacheKey = `planets:difficulty:${difficulty}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const planets = await prisma.planet.findMany({
      where: {
        questions: {
          some: { difficulty }
        }
      },
      distinct: ['id'],
      orderBy: { order: 'asc' }
    });

    await cacheService.set(cacheKey, planets, 1800); // 30 minutes

    return planets;
  }

  async searchPlanets(search, page = 1, limit = 10) {
    return this.findAll(page, limit, search);
  }
}

module.exports = new PlanetService();