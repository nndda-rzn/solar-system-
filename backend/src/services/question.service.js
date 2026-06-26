const prisma = require('../config/database');

class QuestionService {
  async findAll(filters = {}) {
    const where = {};
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.planetId) where.planetId = parseInt(filters.planetId);

    return prisma.question.findMany({ where, include: { planet: true } });
  }

  async findById(id) {
    return prisma.question.findUnique({ where: { id: parseInt(id) } });
  }

  async create(data) {
    const createData = { ...data };
    if (Array.isArray(createData.options)) {
      createData.options = JSON.stringify(createData.options);
    }
    return prisma.question.create({ data: createData });
  }

  async update(id, data) {
    const updateData = { ...data };
    if (Array.isArray(updateData.options)) {
      updateData.options = JSON.stringify(updateData.options);
    }
    return prisma.question.update({ where: { id: parseInt(id) }, data: updateData });
  }

  async delete(id) {
    return prisma.question.delete({ where: { id: parseInt(id) } });
  }
}

module.exports = new QuestionService();
