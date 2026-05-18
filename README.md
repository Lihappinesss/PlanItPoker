# PlanIt Poker

PlanIt Poker is an application for team task estimation using the planning poker approach.  https://planitpoker.up.railway.app/

<img width="800"  alt="Снимок экрана 2026-05-18 в 17 37 19" src="https://github.com/user-attachments/assets/8af44681-3184-41c7-bf55-b86288e66146" />
<img width="800"  alt="Снимок экрана 2026-05-18 в 17 36 26" src="https://github.com/user-attachments/assets/e668ba98-18e2-4fe5-ad7b-53fe452d7196" />
<img width="800"  alt="Снимок экрана 2026-05-18 в 17 37 07" src="https://github.com/user-attachments/assets/28c460cf-69bf-4e36-a8f6-0fac4557382a" />


The project consists of two main parts:

- `front` — the client-side application
- `server` — the backend application

## Features

- User registration and authentication
- Room creation
- Task creation, updating, and deletion
- Real-time voting with WebSocket
- Planning poker flow for task estimation
- User profile management

## Tech Stack

- React
- TypeScript
- Redux Toolkit
- RTK Query
- React Router
- Node.js
- Express
- Sequelize
- PostgreSQL
- WebSocket
- Nx

## Local Development

1. Copy `.env.example` to `.env`.
2. Fill in local PostgreSQL credentials and session settings.
3. Install dependencies.

```bash
npm install
```

4. Run database migrations.

```bash
npm run migrate
```

5. Start backend and frontend in separate terminals.

```bash
npm run dev:server
```

```bash
npm run dev:front
```

## Build and Start

Build both applications:

```bash
npm run build
```

Start the production server after the build:

```bash
npm run start
```

The server serves static assets from `dist/apps/front`, so `npm run build` should be run before `npm run start`.

## Deployment Checklist

1. Configure all required environment variables from `.env.example`.
2. Run `npm install`.
3. Run `npm run build`.
4. Run `npm run migrate`.
5. Start the server with `npm run start`.
6. Verify `GET /health` returns `200`.

## Recommended Production Settings

- `NODE_ENV=production`
- `TRUST_PROXY=1` when running behind Render, Railway, Nginx, or another reverse proxy
- `SESSION_COOKIE_SECURE=true` under HTTPS
- `SESSION_COOKIE_SAME_SITE=none` if frontend and backend use different origins
- `CLIENT_URL` should contain every allowed frontend origin as a comma-separated list
- `APP_API_BASE_URL` and `APP_WS_BASE_URL` should point to your deployed backend

## Railway

This repository is prepared for Railway with [railway.json](/Users/a.gallyamova/Documents/personal/PlanItPoker/railway.json).

Railway-specific behavior:

- Build command: `npm run build`
- Pre-deploy command: `npm run migrate`
- Start command: `npm run start`
- Healthcheck path: `/health`
- The app listens on Railway's injected `PORT` variable

Recommended setup:

1. Create a new Railway project.
2. Add a PostgreSQL database to the project.
3. Deploy this repository as a single service from the repository root.
4. Set the service healthcheck path to `/health` if you prefer to manage it in the UI.
5. Configure the variables below.

Recommended Railway variables:

- `NODE_ENV=production`
- `TRUST_PROXY=1`
- `SESSION_SECRET=<long-random-secret>`
- `SESSION_COOKIE_SECURE=true`
- `SESSION_COOKIE_SAME_SITE=lax`
- `SESSION_COOKIE_NAME=connect.sid`
- `SESSION_TABLE_NAME=user_sessions`
- `POSTGRES_HOST=${{Postgres.PGHOST}}`
- `POSTGRES_PORT=${{Postgres.PGPORT}}`
- `POSTGRES_DB=${{Postgres.PGDATABASE}}`
- `POSTGRES_USER=${{Postgres.PGUSER}}`
- `POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}`

Single-service URL setup on Railway:

- `CLIENT_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}`
- `APP_API_BASE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}`
- `APP_WS_BASE_URL=wss://${{RAILWAY_PUBLIC_DOMAIN}}/plan/`

After the first deploy, verify:

1. `GET /health` returns `200`
2. registration and login work
3. websocket voting works
4. sessions survive a service restart
