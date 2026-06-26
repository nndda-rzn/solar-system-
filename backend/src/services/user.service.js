const prisma = require('../config/database');

class UserService {
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: { id: true, email: true, name: true, role: true }
    });
  }

  async updateRole(id, role) {
    return prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    });
  }

  async delete(id) {
    return prisma.user.delete({ where: { id: parseInt(id) } });
  }
}

module.exports = new UserService();
