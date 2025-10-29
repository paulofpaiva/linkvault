![linkvault Logo](./assets/linkvault.png)
# linkvault

linkvault is a simple personal link manager. Save URLs, add notes, organize by categories, and track status (unread, read, archived). It includes authentication, pagination, and automatic page title fetching.

## Tech Stack

- Node.js, Express, TypeScript
- Drizzle ORM, PostgreSQL
- JWT auth with httpOnly refresh cookies
- Vite + React (web app)
- Docker & Docker Compose

## Quick Start

### Using Docker (recommended)

```bash
# From repo root
cp apps/api/env.example apps/api/.env
cp env.example .env

# Adjust apps/api/.env as needed (set FRONTEND_URL=http://localhost:5173)

docker-compose up -d
```

- API: http://localhost:3000
- Web: http://localhost:5173 (set `VITE_API_URL=http://localhost:3000` in your web env if needed)

### Local Development

Prerequisites: Node.js 18+, pnpm, PostgreSQL running locally

```bash
# Install deps
pnpm install

# Configure API env
cd apps/api && cp env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, FRONTEND_URL=http://localhost:5173

# Run DB migrations and start API
pnpm migrate
cd ../.. && pnpm dev:api

# In a separate terminal, start the web app
pnpm dev:web
```

API is available at `http://localhost:3000`. Web at `http://localhost:5173`.

## Environment

See `apps/api/env.example` for required variables:

- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET` – Access token secret
- `JWT_REFRESH_SECRET` – Refresh token secret
- `PORT` – API port (default: 3000)