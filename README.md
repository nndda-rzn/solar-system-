# Solar System Interactive Web

Web media interaktif tentang tata surya dengan fitur 3D, kuis, timeline, dan leaderboard.

## Tech Stack

**Frontend:**
- React 18 + Vite
- Three.js + @react-three/fiber + @react-three/drei
- Tailwind CSS
- Framer Motion
- Zustand (state management)
- React Router

**Backend:**
- Node.js + Express
- Prisma ORM
- SQLite (development) / PostgreSQL (production)
- JWT Authentication

## Fitur

- Eksplorasi 3D tata surya dengan semua planet
- Detail informasi setiap planet
- Simulasi orbit dengan kontrol kecepatan
- Perbandingan ukuran antar planet
- Kuis interaktif (10 soal)
- Timeline sejarah eksplorasi ruang angkasa
- Leaderboard global
- Auth (login/register)
- Admin dashboard

## Cara Menjalankan

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

### 3. Jalankan Server

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

### 4. Akses Aplikasi

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 5. Akun Default

- Admin: admin@solarsystem.com / admin123

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | Yes |
| GET | /api/planets | List all planets | No |
| GET | /api/planets/:id | Planet detail | No |
| GET | /api/questions | List questions | No |
| POST | /api/quiz/submit | Submit quiz | Yes |
| GET | /api/leaderboard | Leaderboard | No |

## Struktur Project

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── utils/
└── frontend/
    └── src/
        ├── components/
        │   ├── auth/
        │   ├── layout/
        │   ├── three/
        │   └── ui/
        ├── data/
        ├── pages/
        ├── services/
        └── stores/
```

## License

MIT
