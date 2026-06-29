const auditLogService = require('../services/auditLog.service');

const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    let entityId = null;
    let oldValues = null;
    let newValues = null;

    if (req.params.id) {
      entityId = req.params.id;
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      req.oldValues = req.body._oldValues;
      delete req.body._oldValues;
    }

    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        if (data?.data?.id && !entityId) {
          entityId = String(data.data.id);
        }

        if (req.oldValues) {
          oldValues = req.oldValues;
        }

        if (req.body && Object.keys(req.body).length > 0) {
          const sensitiveFields = ['password', 'token', 'secret'];
          newValues = { ...req.body };
          
          sensitiveFields.forEach(field => {
            if (newValues[field]) {
              newValues[field] = '***REDACTED***';
            }
          });
        }

        auditLogService.createLog({
          userId: req.user.id,
          action,
          entityType,
          entityId,
          oldValues,
          newValues,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }).catch(err => {
          console.error('Audit log creation failed:', err);
        });
      }

      return originalJson(data);
    };

    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        auditLogService.createLog({
          userId: req.user.id,
          action,
          entityType,
          entityId: entityId || 'unknown',
          oldValues,
          newValues,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }).catch(err => {
          console.error('Audit log creation failed:', err);
        });
      }

      return originalSend(data);
    };

    next();
  };
};

const logLogin = async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    if (res.statusCode === 200 && data?.data?.user) {
      auditLogService.createLog({
        userId: data.data.user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: String(data.data.user.id),
        oldValues: null,
        newValues: null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      }).catch(err => {
        console.error('Audit log creation failed:', err);
      });
    }

    return originalJson(data);
  };

  next();
};

const logLogout = async (req, res, next) => {
  if (req.user) {
    try {
      await auditLogService.createLog({
        userId: req.user.id,
        action: 'LOGOUT',
        entityType: 'USER',
        entityId: String(req.user.id),
        oldValues: null,
        newValues: null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });
    } catch (err) {
      console.error('Audit log creation failed:', err);
    }
  }

  next();
};

module.exports = {
  auditLog,
  logLogin,
  logLogout
};
