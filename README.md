# LinkVault

A simple personal link manager. Save URLs, add notes, organize by categories, and track status (unread, read, archived). Includes authentication, pagination, and automatic page title fetching.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- **Frontend**: React, Vite, TailwindCSS, TanStack Query
- **Auth**: JWT with httpOnly refresh cookies
- **DevOps**: Docker, Docker Compose, pnpm workspaces

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` with your values. This is the **only .env file** for the entire monorepo.

**For production**, generate secure secrets:
```bash
openssl rand -hex 32
```

### 3. Run the Application

#### Option A: Docker (Recommended)

```bash
pnpm docker:up
```

Access:
- Frontend: http://localhost:5173
- API: http://localhost:3000


#### Option B: Local Development

Requirements: PostgreSQL running locally

1. Update `.env` to use `localhost` instead of `db`:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/linkvaultdb
   ```

2. Run in separate terminals:
   ```bash
   # Terminal 1
   pnpm dev:api

   # Terminal 2
   pnpm dev:web
   ```
