const cacheService = require('../services/cache.service');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!process.env.REDIS_URL) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await cacheService.get(key);
      
      if (cached) {
        return res.json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        cacheService.set(key, data, duration);
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

const cacheMiddlewareShort = (duration = 60) => {
  return cacheMiddleware(duration);
};

const cacheMiddlewareLong = (duration = 3600) => {
  return cacheMiddleware(duration);
};

module.exports = {
  cacheMiddleware,
  cacheMiddlewareShort,
  cacheMiddlewareLong
};