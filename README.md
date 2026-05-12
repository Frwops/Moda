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

## Authentication

- **Email/password**: `@gmail.com` or `@googlemail.com` only; password OWASP-style (length + mixed case + digit + symbol). `bcrypt` cost 12.
- **Google**: [Google Identity Services](https://developers.google.com/identity/gsi/web) button → `POST /api/v1/auth/google` with `{ idToken }`. Backend verifies JWT audience = `GOOGLE_CLIENT_ID` (must match SPA `VITE_GOOGLE_CLIENT_ID`).
- **Tokens**: short-lived **access JWT** (15m) in JSON; **opaque refresh** in `httpOnly` + `SameSite=Strict` cookie (path `/api/v1/auth`). Refresh rotation on `POST /auth/refresh`.
- **Other**: `@nestjs/throttler` on routes, `helmet`, CORS with `credentials`, generic error on failed login (no user enumeration).

Google Cloud: create OAuth **Web client**, add **Authorized JavaScript origins** `http://localhost:5173`, enable Google+ API / People API as needed for sign-in.

## API

- `GET /api/v1` — service metadata  
- `GET /api/v1/health` — liveness  
- `POST /api/v1/auth/register` | `login` | `google` | `refresh` | `logout`  
- `GET /api/v1/auth/me` — Bearer access token  

Global prefix: `api/v1`.

## Cursor / Caveman

Project rules live in `.cursorrules`. Caveman skills are under `.agents/skills/` (see `skills-lock.json`).
