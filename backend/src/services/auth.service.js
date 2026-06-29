const prisma = require('../config/database');
const { hashPassword, comparePassword, validatePassword, isCommonPassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

class AuthService {
  async register(email, password, name, organizationId = null) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0].message);
    }

    if (isCommonPassword(password)) {
      throw new Error('Password is too common. Please choose a stronger password.');
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, organizationId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    return { 
      user, 
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 15 * 60 // 15 minutes
    };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if organization is active
    if (user.organization && !user.organization.isActive) {
      throw new Error('This organization has been suspended. Please contact support.');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('This account has been suspended. Please contact support.');
    }

    // Check if locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account is locked. Please try again later.');
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      // Increment failed login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLogins: { increment: 1 },
          lastLoginIp: null
        }
      });

      if (user.failedLogins + 1 >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lockedUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
          }
        });
        throw new Error('Account locked due to too many failed attempts. Please try again in 15 minutes.');
      }

      throw new Error('Invalid credentials');
    }

    // Reset failed logins and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: null,
        loginCount: { increment: 1 },
        failedLogins: 0,
        lockedUntil: null
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        organizationId: user.organizationId
      },
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 15 * 60 // 15 minutes
    };
  }

  async refreshToken(refreshToken) {
    const prisma = require('../config/database');
    const { verifyRefreshToken } = require('../utils/jwt');

    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      // Check if refresh token exists
      const existingToken = await prisma.refreshToken.findFirst({
        where: {
          userId: user.id,
          token: refreshToken,
          revokedAt: null,
          expiresAt: { gte: new Date() }
        }
      });

      if (!existingToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user.id, email: user.email });

      return {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: 15 * 60
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async revokeToken(refreshToken) {
    const prisma = require('../config/database');

    await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    return { message: 'Token successfully revoked' };
  }
}

module.exports = new AuthService();