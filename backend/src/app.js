const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, strictLimiter } = require('./middleware/rateLimiter');
const prisma = require('./config/database');

dotenv.config();

const app = express();
const version = process.env.npm_package_version || '1.0.0';

// Security headers with advanced configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { policy: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', 
  credentials: true,
  maxAge: 86400
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api', apiLimiter);

// Health check with full status
app.get('/health', async (req, res) => {
  const startTime = Date.now();
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: version,
    uptime: process.uptime().toFixed(2),
    checks: {
      database: { status: 'unknown', latency: null },
    },
  };
  
  try {
    // Check database connection
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    health.status = 'degraded';
    health.checks.database = {
      status: 'error',
      error: error.message,
      latency: null,
    };
  }
  
  health.totalLatency = Date.now() - startTime;
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Ready check (includes all dependencies)
app.get('/ready', async (req, res) => {
  const startTime = Date.now();
  
  const ready = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'unknown' },
      memory: process.memoryUsage(),
    },
  };
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    ready.checks.database.status = 'ok';
  } catch (error) {
    ready.status = 'not_ready';
    ready.checks.database = { status: 'error', error: error.message };
  }
  
  ready.totalLatency = Date.now() - startTime;
  
  const statusCode = ready.status === 'ready' ? 200 : 503;
  res.status(statusCode).json(ready);
});

// API routes
app.use('/api', routes);

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Solar System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      planets: '/api/planets',
      questions: '/api/questions',
      quiz: '/api/quiz',
      leaderboard: '/api/leaderboard'
    }
  });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;
