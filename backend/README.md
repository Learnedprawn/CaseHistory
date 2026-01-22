# Backend API

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and set JWT_SECRET to a secure random string
```

3. Setup database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start development server:
```bash
npm run dev
```

## Environment Variables

- `DATABASE_URL`: SQLite database path (default: `file:./dev.db`)
- `JWT_SECRET`: Secret key for JWT token signing (REQUIRED - change in production)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)

## API Documentation

See main README.md for API endpoint documentation.
