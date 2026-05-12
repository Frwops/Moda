# Moda

Fashion-oriented monorepo: **NestJS** REST API, **React + Vite** SPA, **MariaDB/MySQL** via **TypeORM**.

Repository: [https://github.com/Frwops/Moda](https://github.com/Frwops/Moda)

## Prerequisites

- Node.js 20+
- **MySQL 8+** or **MariaDB 10.6+** running locally (or on a host you can reach with TCP). Create an empty database and a user with rights on it; values must match `backend/.env`.

## Quick start

```bash
npm install
cp backend/.env.example backend/.env
# Edit backend/.env with your DB host, user, password, and database name.
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

There is **no Docker** in this repo. Install MySQL or MariaDB yourself, create database `moda` (or any name) and a user, then set `DB_*` in `backend/.env` to match.

Set `TYPEORM_SYNC=true` in `backend/.env` **only** for local prototyping; use migrations for real schema evolution (`synchronize: false` in production).

## API

- `GET /api/v1` — service metadata  
- `GET /api/v1/health` — liveness  

Global prefix: `api/v1`.

## Cursor / Caveman

Project rules live in `.cursorrules`. Caveman skills are under `.agents/skills/` (see `skills-lock.json`).
