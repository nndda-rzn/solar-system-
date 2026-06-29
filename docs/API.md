# Solar System API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend.railway.app/api
```

## Authentication
Most endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <your_token>
```

---

## Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Organizations
- `GET /organizations` - List all organizations (paginated)
- `POST /organizations` - Create organization
- `GET /organizations/:id` - Get organization by ID
- `PATCH /organizations/:id` - Update organization
- `GET /organizations/:id/stats` - Organization statistics
- `POST /organizations/:id/suspend` - Suspend organization

### Users
- `GET /users` - List users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Planets
- `GET /planets` - List planets (paginated)
- `GET /planets/:id` - Get planet by ID
- `GET /planets/name/:name` - Get planet by name
- `GET /planets/search?q=` - Search planets
- `GET /planets/difficulty/:level` - Planets by difficulty

### Questions
- `GET /questions` - List questions (paginated)
- `GET /questions/:id` - Get question by ID

### Quiz
- `POST /quiz/submit` - Submit quiz answers
- `GET /quiz/history` - Get quiz history
- `GET /quiz/stats` - Get quiz statistics

### Analytics
- `GET /analytics/organization/:id` - Organization analytics
- `GET /analytics/student/me` - My progress
- `GET /analytics/dashboard` - Dashboard data
- `GET /analytics/export/:id` - Export reports (JSON/CSV)

### Audit Logs
- `GET /audit-logs/user/:userId` - User activity logs
- `GET /audit-logs/organization/:orgId` - Organization logs
- `GET /audit-logs/stats` - Action statistics

### GDPR
- `GET /gdpr/export?format=json|csv` - Export user data
- `DELETE /gdpr/data` - Delete user data (GDPR)
- `POST /gdpr/revoke-tokens` - Revoke all tokens
- `GET /gdpr/agreement` - Data processing agreement

### Leaderboard
- `GET /leaderboard` - Global leaderboard

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Filtering
- `search` - Search query
- `difficulty` - Filter by difficulty (EASY, MEDIUM, HARD)
- `dateRange` - Date range (last-7-days, last-30-days, last-90-days)

---

## Rate Limiting

- Auth endpoints: 5 requests / 15 minutes
- API endpoints: 100 requests / minute

---

## Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-06-29T12:00:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "ok",
      "latency": 5
    }
  }
}
```