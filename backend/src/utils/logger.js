const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack) {
      msg += `\n${meta.stack}`;
    }
    return msg;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'solar-system-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

const logApiRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id || 'anonymous'
  };

  if (res.statusCode >= 500) {
    logger.error('API Error', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('API Warning', logData);
  } else {
    logger.info('API Request', logData);
  }
};

const logUserAction = (userId, action, details = {}) => {
  logger.info('User Action', {
    userId,
    action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

const logSecurityEvent = (event, details) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

const logPerformance = (operation, duration, details = {}) => {
  logger.info('Performance', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

module.exports = {
  logger,
  logApiRequest,
  logUserAction,
  logSecurityEvent,
  logPerformance
};