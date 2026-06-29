# Solar System Interactive Web - Enterprise

[![CI](https://github.com/nndda-rzn/solar-system-/actions/workflows/ci.yml/badge.svg)](https://github.com/nndda-rzn/solar-system-/actions/workflows/ci.yml)
[![Deploy](https://github.com/nndda-rzn/solar-system-/actions/workflows/deploy.yml/badge.svg)](https://github.com/nndda-rzn/solar-system-/actions/workflows/deploy.yml)

Enterprise-grade educational platform featuring interactive 3D solar system exploration, quizzes, analytics, and multi-organization support.

## Features

- ✅ **3D Solar System Exploration** - Interactive 3D visualization with Three.js
- ✅ **Multi-Organization** - Support for schools/institutions
- ✅ **Quiz System** - Adaptive quizzes with scoring & leaderboards
- ✅ **Learning Analytics** - Student progress tracking & insights
- ✅ **Admin Dashboard** - User management & organization controls
- ✅ **GDPR Compliance** - Data export & deletion
- ✅ **Rate Limiting** - Security protection
- ✅ **Redis Caching** - Performance optimization
- ✅ **CI/CD Pipeline** - Automated testing & deployment

## Tech Stack

**Frontend:**
- React 18 + Vite
- Three.js + @react-three/fiber
- Tailwind CSS
- Framer Motion

**Backend:**
- Node.js + Express
- Prisma ORM
- Redis
- JWT Authentication

## Quick Start

### 1. Clone & Install
```bash
# Clone repository
git clone https://github.com/nndda-rzn/solar-system-.git
cd solar-system-

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Setup Environment

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/solar_system_db"
JWT_SECRET="your-super-secret-jwt-key"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

**Redis (Optional but recommended):**
```env
REDIS_URL="redis://localhost:6379"
```

### 3. Run Database Migrations
```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Start Development
```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

## Deployment

### Railway (Backend)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Vercel (Frontend)
1. Import project
2. Set `VITE_API_URL` to your backend
3. Deploy

## API Documentation
See [API.md](docs/API.md) for complete endpoint documentation.

## Project Structure
See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture guide.

## License
MIT