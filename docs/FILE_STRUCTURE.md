# File Structure Guide - Solar System Enterprise

> **Version:** 1.0.0  
> **Last Updated:** 2026-06-27

## Root Structure

```
solar-system-enterprise/
├── apps/                           # Micro frontends/backends
│   ├── web-app/                    # Main user-facing app (Vercel)
│   ├── admin-portal/               # Admin/teacher portal
│   └── api-gateway/                # Backend services (Railway)
├── packages/                       # Shared packages
│   ├── types/                      # Shared TypeScript types
│   ├── ui/                         # Design system components
│   ├── utils/                      # Shared utilities
│   ├── config/                     # Shared configuration
│   └── prisma/                     # Database schema & client
├── tools/                          # Development tools
├── infra/                          # Infrastructure as Code
├── docs/                           # Documentation
└── .github/                        # GitHub workflows
```

## Backend Structure

```
api-gateway/
├── src/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── organization/
│   │   │   │   ├── user/
│   │   │   │   ├── planet/
│   │   │   │   ├── quiz/
│   │   │   │   └── admin/
│   │   │   ├── middleware/
│   │   │   └── index.ts
│   │   └── shared/
│   ├── core/
│   │   ├── database/
│   │   ├── cache/
│   │   └── config/
│   ├── jobs/
│   └── services/
├── tests/
└── config/
```

## Frontend Structure

```
web-app/
├── src/
│   ├── app/
│   ├── domains/
│   │   ├── auth/
│   │   ├── organization/
│   │   ├── planet/
│   │   ├── quiz/
│   │   └── admin/
│   ├── features/
│   │   ├── explore-3d/
│   │   ├── quiz-game/
│   │   ├── timeline/
│   │   ├── compare/
│   │   └── leaderboard/
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── pages/
└── tests/
```

## Naming Conventions

### Backend
- `module.controller.ts` - API controllers
- `module.service.ts` - Business logic
- `module.dto.ts` - Data transfer objects
- `module.middleware.ts` - Express middleware

### Frontend
- `ComponentName.tsx` - React components (PascalCase)
- `useCustomHook.ts` - Custom hooks (camelCase)
- `component.store.ts` - Zustand store
- `component.api.ts` - API service
- `component.types.ts` - TypeScript types

**Version:** 1.0.0 | **Last Updated:** 2026-06-27
