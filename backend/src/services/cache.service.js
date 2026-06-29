const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
  }

  async connect() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL);
        
        this.redis.on('connect', () => {
          console.log('Redis connected');
          this.isConnected = true;
        });

        this.redis.on('error', (err) => {
          console.error('Redis error:', err);
          this.isConnected = false;
        });

        await this.redis.ping();
      } catch (error) {
        console.warn('Redis connection failed, using in-memory cache:', error.message);
        this.redis = null;
      }
    }
  }

  async disconnect() {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.redis) return null;
    
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.redis) return false;
    
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
      } else {
        await this.redis.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key) {
    if (!this.redis) return false;
    
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async clear(pattern = '*') {
    if (!this.redis) return false;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  async increment(key, amount = 1) {
    if (!this.redis) return null;
    
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return null;
    }
  }

  async getOrSet(key, fetchFn, ttl = 3600) {
    if (this.redis) {
      try {
        const cached = await this.get(key);
        if (cached) return cached;
      } catch (error) {
        console.warn('Cache retrieval failed, fetching fresh data');
      }
    }

    const data = await fetchFn();
    if (this.redis && data) {
      await this.set(key, data, ttl);
    }
    return data;
  }

  async mget(keys) {
    if (!this.redis) return {};
    
    try {
      const values = await this.redis.mget(...keys);
      const result = {};
      keys.forEach((key, index) => {
        result[key] = values[index] ? JSON.parse(values[index]) : null;
      });
      return result;
    } catch (error) {
      console.error('Cache mget error:', error);
      return {};
    }
  }

  async mset(keyValuePairs, ttl = 3600) {
    if (!this.redis) return false;
    
    try {
      const pipeline = this.redis.pipeline();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        if (ttl) {
          pipeline.setex(key, ttl, JSON.stringify(value));
        } else {
          pipeline.set(key, JSON.stringify(value));
        }
      });

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }
}

module.exports = new CacheService();