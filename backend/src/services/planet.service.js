const prisma = require('../config/database');

class PlanetService {
  async findAll() {
    return prisma.planet.findMany({ orderBy: { order: 'asc' } });
  }

  async findById(id) {
    return prisma.planet.findUnique({ where: { id: parseInt(id) } });
  }

  async findByName(name) {
    return prisma.planet.findFirst({ where: { name } });
  }

  async create(data) {
    return prisma.planet.create({ data });
  }

  async update(id, data) {
    return prisma.planet.update({ where: { id: parseInt(id) }, data });
  }

  async delete(id) {
    return prisma.planet.delete({ where: { id: parseInt(id) } });
  }
}

module.exports = new PlanetService();
