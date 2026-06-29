const prisma = require('../config/database');
const { hashPassword } = require('../utils/password');

class OrganizationService {
  async createOrganization(data) {
    const { name, slug, plan, maxUsers, adminEmail, adminName, adminPassword } = data;

    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    });

    if (existingOrg) {
      throw new Error('Organization with this slug already exists');
    }

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name,
          slug,
          plan: plan || 'FREE',
          maxUsers: maxUsers || 50,
        }
      });

      await tx.organizationSettings.create({
        data: {
          organizationId: organization.id
        }
      });

      const hashedPassword = await hashPassword(adminPassword);
      await tx.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: 'ADMIN',
          organizationId: organization.id
        }
      });

      return organization;
    });

    return result;
  }

  async getAllOrganizations(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { slug: { contains: search } }
      ]
    } : {};

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { users: true }
          }
        }
      }),
      prisma.organization.count({ where })
    ]);

    return {
      data: organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getOrganizationById(id) {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        settings: true,
        _count: {
          select: { users: true }
        },
        users: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  }

  async getOrganizationBySlug(slug) {
    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        settings: true,
        _count: {
          select: { users: true }
        }
      }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  }

  async updateOrganization(id, data) {
    const { name, plan, maxUsers, isActive } = data;

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(plan && { plan }),
        ...(maxUsers && { maxUsers }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return organization;
  }

  async updateOrganizationSettings(id, settings) {
    const { customLogo, primaryColor, enableQuiz, enableTimeline, enableCompare, customDomain } = settings;

    const organization = await prisma.organizationSettings.update({
      where: { organizationId: id },
      data: {
        ...(customLogo && { customLogo }),
        ...(primaryColor && { primaryColor }),
        ...(enableQuiz !== undefined && { enableQuiz }),
        ...(enableTimeline !== undefined && { enableTimeline }),
        ...(enableCompare !== undefined && { enableCompare }),
        ...(customDomain && { customDomain })
      }
    });

    return organization;
  }

  async getOrganizationStats(id) {
    const [totalUsers, activeUsers, quizAttempts, avgScore] = await Promise.all([
      prisma.user.count({ where: { organizationId: id } }),
      prisma.user.count({ where: { organizationId: id, isActive: true } }),
      prisma.score.count({
        where: { user: { organizationId: id } }
      }),
      prisma.score.aggregate({
        where: { user: { organizationId: id } },
        _avg: { percentage: true }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      quizAttempts,
      avgScore: avgScore._avg.percentage || 0
    };
  }

  async suspendOrganization(id) {
    await prisma.user.updateMany({
      where: { organizationId: id },
      data: { isActive: false }
    });

    const organization = await prisma.organization.update({
      where: { id },
      data: { isActive: false }
    });

    return organization;
  }

  async activateOrganization(id) {
    const organization = await prisma.organization.update({
      where: { id },
      data: { isActive: true }
    });

    return organization;
  }

  async deleteOrganization(id) {
    await prisma.$transaction(async (tx) => {
      await tx.organizationSettings.deleteMany({
        where: { organizationId: id }
      });

      await tx.user.deleteMany({
        where: { organizationId: id }
      });

      await tx.organization.delete({
        where: { id }
      });
    });

    return { message: 'Organization deleted successfully' };
  }
}

module.exports = new OrganizationService();