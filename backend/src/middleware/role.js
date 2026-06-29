const prisma = require('../config/database');

// Role hierarchy
const ROLE_HIERARCHY = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  TEACHER: 2,
  STUDENT: 1
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'manage_organization',
    'manage_users',
    'manage_quizzes',
    'view_analytics',
    'manage_content'
  ],
  TEACHER: [
    'manage_quizzes',
    'view_student_progress',
    'create_content',
    'view_analytics'
  ],
  STUDENT: [
    'take_quizzes',
    'view_progress',
    'view_content'
  ]
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userRole = req.user.role;
      
      if (!roles.includes(userRole)) {
        const hasHigherRole = roles.some(role => 
          ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[role]
        );
        
        if (!hasHigherRole) {
          return res.status(403).json({ 
            success: false, 
            message: 'Insufficient permissions',
            requiredRoles: roles,
            userRole
          });
        }
      }

      // Check if user belongs to the same organization (for organization-specific operations)
      if (req.params.organizationId && req.user.organizationId !== req.params.organizationId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied to this organization' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Authorization error' 
      });
    }
  };
};

const authorizePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userRole = req.user.role;
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      // SUPER_ADMIN has all permissions
      if (userRole === 'SUPER_ADMIN') {
        return next();
      }

      // Check if user has the specific permission
      if (!userPermissions.includes(permission) && !userPermissions.includes('*')) {
        return res.status(403).json({ 
          success: false, 
          message: 'Permission denied',
          requiredPermission: permission,
          userPermissions
        });
      }

      // Organization validation for organization-specific resources
      if (req.params.organizationId || req.body.organizationId) {
        const resourceOrgId = req.params.organizationId || req.body.organizationId;
        
        if (req.user.organizationId !== resourceOrgId) {
          return res.status(403).json({ 
            success: false, 
            message: 'Cannot access resources from other organizations' 
          });
        }
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Permission validation error' 
      });
    }
  };
};

const organizationAdminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { organizationId } = req.params;

    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only organization admins can perform this action' 
      });
    }

    // Verify admin belongs to this organization
    if (req.user.organizationId !== organizationId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin does not belong to this organization' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Organization admin validation error' 
    });
  }
};

const superAdminOnly = authorize('SUPER_ADMIN');

const adminOrTeacher = authorize('ADMIN', 'TEACHER');

const studentOnly = authorize('STUDENT');

module.exports = {
  authorize,
  authorizePermission,
  organizationAdminOnly,
  superAdminOnly,
  adminOrTeacher,
  studentOnly,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS
};