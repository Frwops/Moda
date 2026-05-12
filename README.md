# Moda

Fashion-oriented monorepo: **NestJS** REST API, **React + Vite** SPA, **MariaDB/MySQL** via **TypeORM**.

Repository: [https://github.com/Frwops/Moda](https://github.com/Frwops/Moda)

## Prerequisites

- Node.js 20+
- Docker (optional, for local MariaDB)

## Quick start

```bash
npm install
docker compose up -d
cp backend/.env.example backend/.env
npm run dev:backend
```

In another terminal:

```bash
cp frontend/.env.example frontend/.env.local
npm run dev:frontend
```

Open `http://localhost:5173`. The home page calls `GET /api/v1` and `GET /api/v1/health`.

## Scripts (root)

| Script            | Description                |
| ----------------- | -------------------------- |
| `npm run dev:backend`  | Nest watch mode (`backend`) |
| `npm run dev:frontend` | Vite dev server (`frontend`) |
| `npm run build`        | Build API + SPA            |
| `npm run test`         | Backend unit tests         |

## Database

`docker compose` starts MariaDB 11 with database `moda` and user `moda` / password `moda` (development only). Match values in `backend/.env`.

Set `TYPEORM_SYNC=true` in `backend/.env` **only** for local prototyping; use migrations for real schema evolution (`synchronize: false` in production).

## API

- `GET /api/v1` — service metadata  
- `GET /api/v1/health` — liveness  

Global prefix: `api/v1`.

## Cursor / Caveman

Project rules live in `.cursorrules`. Caveman skills are under `.agents/skills/` (see `skills-lock.json`).
