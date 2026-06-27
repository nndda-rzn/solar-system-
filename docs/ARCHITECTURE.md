# Solar System Interactive Web - Enterprise Architecture Documentation

> **Last Updated:** 2026-06-27  
> **Version:** 1.0.0  
> **Target Scale:** 1,000-10,000 concurrent users  
> **Deployment:** Vercel (Frontend) + Railway (Backend)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Enterprise Transformation Plan](#enterprise-transformation-plan)
4. [Proposed File Structure](#proposed-file-structure)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Technical Specifications](#technical-specifications)
7. [Deployment Architecture](#deployment-architecture)
8. [Security & Compliance](#security--compliance)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring & DevOps](#monitoring--devops)

---

## Executive Summary

### Project Overview
Solar System Interactive Web adalah platform edukasi interaktif tentang tata surya dengan visualisasi 3D, sistem kuis, dan leaderboard. Proyek ini akan ditransformasi menjadi **Enterprise-grade Educational SaaS Platform** yang dapat di-deploy di Vercel/Railway.

### Transformation Goals
- ✅ Multi-organization support (untuk demo sekolah/institusi berbeda)
- ✅ Enterprise admin features (user management, analytics, audit)
- ✅ Production-ready deployment di Vercel (frontend) + Railway (backend)
- ✅ Scale target: 1,000-10,000 concurrent users
- ✅ Maintainable & scalable codebase architecture

### Target Timeline
**Estimasi:** 4-6 minggu implementasi

---

## Current Architecture Analysis

### Backend Stack
- **Runtime:** Node.js + Express.js
- **Database:** Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Authentication:** JWT dengan bcryptjs
- **Security:** Helmet, CORS, express-validator

### Frontend Stack
- **Framework:** React 18 + Vite
- **3D Engine:** Three.js + @react-three/fiber + @react-three/drei
- **State Management:** Zustand
- **UI:** Tailwind CSS + Framer Motion
- **HTTP Client:** Axios dengan JWT interceptors

### Current Structure
```
project-root/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── middleware/
│       └── utils/
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── stores/
        ├── services/
        └── utils/
```

### Strengths
- ✅ Clean separation (backend/frontend)
- ✅ MVC pattern yang konsisten
- ✅ Modular component architecture
- ✅ Proper state management dengan Zustand

### Areas for Improvement
- ❌ No deployment configurations (vercel.json, railway.json)
- ❌ No API versioning
- ❌ No rate limiting untuk auth endpoints
- ❌ No database indexes
- ❌ No test coverage
- ❌ No CI/CD pipeline

---

## Enterprise Transformation Plan

### Phase 1: Infrastructure Foundation (Week 1-2)

#### 1.1 Database Migration & Optimization

**Action Items:**
1. Migrate ke PostgreSQL (Railway provides managed Postgres)
2. Update Prisma schema dengan production optimizations:
   - Add indexes pada all foreign keys & query columns
   - Implement soft deletes (deletedAt field)
   - Add audit fields (createdBy, updatedBy)
   - Add tenant_id untuk multi-org support
3. Implement database migrations dengan versioning
4. Setup connection pooling (PgBouncer atau Prisma pooling)

**Prisma Schema Changes:**
```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  plan        String   @default("FREE")
  maxUsers    Int      @default(50)
  createdAt   DateTime @default(now())
  users       User[]
  settings    OrganizationSettings?
}

model User {
  // ... existing fields
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id])
  
  // Audit fields
  lastLoginAt     DateTime?
  loginCount      Int      @default(0)
  deletedAt       DateTime?
  
  @@index([organizationId])
  @@index([email])
  @@index([role])
}
```

#### 1.2 Backend Production Setup

**File: `backend/vercel.json` (untuk Vercel serverless)**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**File: `backend/railway.json` (untuk Railway deployment)**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Environment Variables Setup:**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="[generate-256-bit-secret]"
JWT_EXPIRES_IN="24h"
CORS_ORIGIN="https://your-app.vercel.app"
NODE_ENV="production"
PORT=5000

REDIS_URL="redis://..."  # Optional untuk caching
```

#### 1.3 Frontend Production Setup

**File: `frontend/vercel.json`**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend.railway.app/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**Update `frontend/src/services/api.js`:**
```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
```

---

### Phase 2: Enterprise Admin Features (Week 2-3)

#### 2.1 Multi-Organization System

**Database Schema:**
```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  plan        String   @default("FREE")
  maxUsers    Int      @default(50)
  isActive    Boolean  @default(true)
  settings    OrganizationSettings?
  users       User[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model OrganizationSettings {
  id              String       @id @default(cuid())
  organizationId  String       @unique
  organization    Organization @relation(fields: [organizationId], references: [id])
  customLogo      String?
  primaryColor    String       @default("#818CF8")
  enableQuiz      Boolean      @default(true)
  enableTimeline  Boolean      @default(true)
  enableCompare   Boolean      @default(true)
  customDomain    String?
}
```

**Backend Implementation:**

**New Service: `organization.service.js`**
```javascript
class OrganizationService {
  async createOrganization(data) {
    // Create org with settings
    // Create default admin user
    // Send invitation email
  }

  async getOrganizationStats(orgId) {
    // Total users, quiz attempts, avg scores
    // Active users last 30 days
  }

  async updateOrganizationSettings(orgId, settings) {
    // Update branding, features, limits
  }

  async suspendOrganization(orgId) {
    // Soft suspend org (users can't login)
  }
}
```

#### 2.2 Enterprise User Management

**Enhanced User Schema:**
```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  password        String
  name            String
  role            String   @default("STUDENT")
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id])
  
  // Enterprise fields
  studentId       String?
  grade           String?
  avatar          String?
  isActive        Boolean  @default(true)
  emailVerified   Boolean  @default(false)
  
  // Audit fields
  lastLoginAt     DateTime?
  lastLoginIp     String?
  loginCount      Int      @default(0)
  failedLogins    Int      @default(0)
  lockedUntil     DateTime?
  
  createdBy       String?
  updatedBy       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
  
  scores          Score[]
  quizAttempts    QuizAttempt[]
  auditLogs       AuditLog[]

  @@index([organizationId, role])
  @@index([email])
  @@index([isActive])
}
```

**New Admin Endpoints:**
```javascript
// backend/src/routes/admin.routes.js
router.get('/organizations', superAdminAuth, getOrganizations);
router.post('/organizations', superAdminAuth, createOrganization);
router.get('/organizations/:id/stats', orgAdminAuth, getOrgStats);

router.get('/users', orgAdminAuth, getUsers);
router.patch('/users/:id', orgAdminAuth, updateUser);
router.delete('/users/:id', orgAdminAuth, deleteUser);
router.post('/users/bulk-import', orgAdminAuth, bulkImportUsers);

router.get('/audit-logs', orgAdminAuth, getAuditLogs);
router.get('/analytics', orgAdminAuth, getAnalytics);
```

#### 2.3 Audit Trail System

**Schema:**
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String
  entityType  String
  entityId    String?
  oldValues   String?
  newValues   String?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

**Middleware: `audit.middleware.js`**
```javascript
const auditLog = (action) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = (data) => {
    if (res.statusCode < 400) {
      prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action,
          entityType: req.entityType,
          entityId: req.entityId,
          oldValues: req.oldValues ? JSON.stringify(req.oldValues) : null,
          newValues: req.newValues ? JSON.stringify(req.newValues) : null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }
      });
    }
    return originalJson(data);
  };
  
  next();
};
```

---

### Phase 3: Analytics & Reporting (Week 3-4)

#### 3.1 Learning Analytics Dashboard

**Backend: `analytics.service.js`**
```javascript
class AnalyticsService {
  async getOrganizationAnalytics(orgId, dateRange) {
    const [activeUsers, quizStats, featureUsage] = await Promise.all([
      this.getActiveUsers(orgId, dateRange),
      this.getQuizStats(orgId, dateRange),
      this.getFeatureUsage(orgId, dateRange),
    ]);

    return {
      activeUsers,
      quizStats,
      featureUsage,
      trends: this.calculateTrends(activeUsers, quizStats),
    };
  }

  async getStudentProgress(userId) {
    // Quiz attempts over time
    // Score improvement trend
    // Time spent per topic
  }

  async exportReport(orgId, format) {
    // Export to PDF/CSV/Excel
  }
}
```

#### 3.2 Enhanced Quiz System

**Schema Additions:**
```prisma
model QuizTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  grade       String?
  questions   QuizTemplateQuestion[]
  createdBy   String
  createdAt   DateTime @default(now())
}

model QuizAttempt {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  templateId  String?
  startedAt   DateTime @default(now())
  completedAt DateTime?
  timeSpent   Int?
  status      String  @default("IN_PROGRESS")
  answers     QuizAnswer[]
}

model QuizAnswer {
  id           String     @id @default(cuid())
  attemptId    String
  questionId   Int
  answerIndex  Int
  isCorrect    Boolean
  timeTaken    Int?
  createdAt    DateTime   @default(now())
}
```

---

### Phase 4: Security & Compliance (Week 4-5)

#### 4.1 Enterprise Security Features

**Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
});

app.use('/api/auth/login', authLimiter);
app.use('/api/', apiLimiter);
```

**Password Security:**
```javascript
const passwordValidator = require('password-validator');
const schema = new passwordValidator();
schema
  .is().min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().symbols();
```

#### 4.2 Data Privacy & GDPR Compliance

```javascript
async exportUserData(req, res) {
  const userData = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      scores: true,
      auditLogs: true,
    }
  });
  res.json(userData);
}

async deleteUserData(req, res) {
  await prisma.$transaction([
    prisma.score.deleteMany({ where: { userId: req.user.id } }),
    prisma.auditLog.deleteMany({ where: { userId: req.user.id } }),
    prisma.user.delete({ where: { id: req.user.id } }),
  ]);
  res.json({ message: 'All data deleted successfully' });
}
```

---

### Phase 5: Performance & Scalability (Week 5-6)

#### 5.1 Backend Performance Optimization

**Database Connection Pooling:**
```javascript
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

**Caching Layer (Redis):**
```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async getPlanets() {
  const cached = await redis.get('planets:all');
  if (cached) return JSON.parse(cached);
  
  const planets = await prisma.planet.findMany();
  await redis.setex('planets:all', 3600, JSON.stringify(planets));
  return planets;
}
```

#### 5.2 Frontend Performance Optimization

**Code Splitting & Lazy Loading:**
```javascript
const Explore = lazy(() => import('./pages/Explore'));
const Quiz = lazy(() => import('./pages/Quiz'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
```

**3D LOD Optimization:**
```javascript
<Detailed distances={[0, 50, 100]}>
  {/* Close: High detail */}
  <mesh geometry={highDetailGeometry}>
    <meshStandardMaterial map={highResTexture} />
  </mesh>
  {/* Medium: Medium detail */}
  {/* Far: Low detail */}
</Detailed>
```

---

### Phase 6: DevOps & Monitoring (Week 6)

#### 6.1 CI/CD Pipeline

**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railwayapp/cli-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

#### 6.2 Monitoring & Logging

**Implementation:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'solar-system-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    checks: {
      database: await checkDatabase(),
    }
  };
  
  const allHealthy = Object.values(health.checks).every(c => c.status === 'ok');
  res.status(allHealthy ? 200 : 503).json(health);
});
```

---

## Proposed File Structure

### Phase 1: Transformasi Arsitektur Monorepo

```
solar-system-enterprise/
├── apps/
│   ├── web-app/         # Main user-facing app (Vercel)
│   ├── admin-portal/    # Admin/teacher portal
│   └── api-gateway/     # Backend services (Railway)
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── ui/              # Design system components
│   ├── utils/           # Shared utilities
│   ├── config/          # Shared configuration
│   └── prisma/          # Database schema & client
├── tools/
│   ├── scripts/         # Automation scripts
│   └── migrations/      # Database migrations
├── infra/
│   ├── terraform/       # Infrastructure as Code
│   └── monitoring/      # Monitoring setup
├── docs/
└── .github/             # GitHub workflows
```

### Phase 2: Scalable Backend Structure

```
api-gateway/
├── src/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── controller.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   ├── routes.ts
│   │   │   │   │   ├── dto.ts
│   │   │   │   │   ├── middleware.ts
│   │   │   │   │   └── validator.ts
│   │   │   │   ├── organization/
│   │   │   │   ├── user/
│   │   │   │   ├── planet/
│   │   │   │   ├── quiz/
│   │   │   │   ├── analytics/
│   │   │   │   └── admin/
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rate-limit.ts
│   │   │   │   ├── validation.ts
│   │   │   │   ├── logging.ts
│   │   │   │   └── error-handler.ts
│   │   │   └── index.ts
│   │   └── shared/
│   ├── core/
│   │   ├── database/
│   │   ├── cache/
│   │   └── config/
│   ├── jobs/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── cleanup/
│   └── services/
│       ├── email/
│       ├── storage/
│       └── payment/
├── tests/
└── config/
```

### Phase 3: Scalable Frontend Structure

```
web-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   └── routes/
│   ├── domains/
│   │   ├── auth/
│   │   ├── organization/
│   │   ├── planet/
│   │   ├── quiz/
│   │   ├── analytics/
│   │   └── admin/
│   ├── features/
│   │   ├── explore-3d/
│   │   ├── quiz-game/
│   │   ├── timeline/
│   │   ├── compare/
│   │   └── leaderboard/
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   └── three/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── pages/
├── tests/
└── config/
```

### Phase 4: Shared Packages Structure

```
packages/
├── types/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── organization.ts
│   │   │   └── index.ts
│   │   ├── domain/
│   │   │   ├── user.ts
│   │   │   ├── planet.ts
│   │   │   └── quiz.ts
│   │   └── shared/
│   ├── package.json
│   └── tsconfig.json
└── ui/
    ├── src/
    │   ├── components/
    │   │   ├── atoms/
    │   │   ├── molecules/
    │   │   ├── organisms/
    │   │   └── templates/
    │   ├── theme/
    │   ├── hooks/
    │   ├── utils/
    │   └── stories/
    ├── package.json
    └── tsconfig.json
```

### Phase 5: Database & Migration Structure

```
packages/prisma/
├── schema/
│   ├── core/
│   │   ├── user.prisma
│   │   ├── organization.prisma
│   │   └── audit.prisma
│   ├── features/
│   │   ├── planet.prisma
│   │   ├── quiz.prisma
│   │   └── analytics.prisma
│   └── shared/
│       ├── base.prisma
│       └── indexes.prisma
├── migrations/
│   ├── 001_initial/
│   ├── 002_organization_tenant/
│   └── 003_analytics_enhancements/
├── seeds/
│   ├── development/
│   ├── staging/
│   └── production/
└── package.json
```

---

## Implementation Roadmap

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| 1-2 | Infrastructure | PostgreSQL migration, Vercel/Railway setup, env config |
| 2-3 | Admin Features | Multi-org system, user management, audit logs |
| 3-4 | Analytics | Dashboard, reporting, enhanced quiz system |
| 4-5 | Security | Rate limiting, CSRF, 2FA, GDPR compliance |
| 5-6 | Performance | Caching, code splitting, LOD optimization |
| 6 | DevOps | CI/CD, monitoring, backup system |

---

## Budget Considerations (Free Tier)

| Service | Plan | Limits | Cost |
|---------|------|--------|------|
| Vercel | Hobby | 100GB bandwidth | FREE |
| Railway | Trial | $5 credit/month | ~$5/month |
| Redis Cloud | Free | 30MB storage | FREE |
| Sentry | Developer | 5K errors/month | FREE |
| Cloudinary | Free | 25GB storage | FREE |

**Estimated Monthly Cost:** ~$5-10/month for MVP

---

## Next Steps Recommendations

For your school assignment, prioritize these implementations:

### MVP Enterprise Features (2-3 weeks):
1. Multi-organization system (demo untuk 2-3 sekolah berbeda)
2. Enhanced admin dashboard dengan basic analytics
3. User management dengan roles (Admin, Teacher, Student)
4. Audit logs untuk tracking aktivitas
5. Production deployment di Vercel + Railway

### Nice-to-have (If time permits):
6. Redis caching untuk performance
7. Advanced analytics charts
8. Export data ke PDF/Excel
9. Email notifications

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-06-27  
**Maintained By:** System Analyst Team