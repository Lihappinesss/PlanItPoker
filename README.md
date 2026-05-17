# PlanIt Poker

PlanIt Poker is an application for team task estimation using the planning poker approach.

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
