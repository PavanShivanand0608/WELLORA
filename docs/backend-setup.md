# WELLORA local development

## Prerequisites

- Node.js 20 or later and npm.
- MongoDB available at the configured URI.

## Start the API

```sh
cd backend
npm install
cp .env.example .env
```

Set `MONGODB_URI`, `MONGODB_DATABASE`, and a private random `JWT_SECRET` of at least 32 characters in `backend/.env`. `BACKEND_HOST`, `BACKEND_PORT`, `APP_ENV`, and `FRONTEND_ORIGIN` have validated local defaults; the template also lists optional token, logging, and rate-limit settings. Keep `.env` out of version control. Start the API:

```sh
npm run dev
```

It listens at `http://127.0.0.1:8000`. Check liveness and the real database connection:

```sh
curl -i http://localhost:8000/api/health
curl -i http://localhost:8000/api/health/db
```

The database endpoint returns HTTP 200 only after a MongoDB ping succeeds. Registration and login require the database to be connected.

## Start the frontend

Set `frontend/.env` from `frontend/.env.example`; its API base URL defaults to `http://localhost:8000/api`. The default frontend origin is `http://localhost:5173`, matching `FRONTEND_ORIGIN` in the backend environment.

```sh
cd frontend
npm install
npm run dev
```

The browser receives the JWT only as an HttpOnly cookie. The cookie uses `SameSite=Strict`, and production additionally requires HTTPS and `Secure`. The frontend and API should share the same site in production. Unsafe requests use the CSRF bootstrap endpoint and send the matching token header.

## Password reset

Reset tokens are generated and stored as hashes with a short expiration, and the reset endpoint is available. No mail provider is configured: the API does not send a reset email, and the raw token is never returned from the public forgot-password endpoint.

## Verification commands

```sh
cd backend
npm test
npm run typecheck
npm run build
```

Mongo-backed test suites generate separate, unique database names ending in `_test` and drop only the database they created. They require a local MongoDB service. Never point tests at production data. Rate limiting uses an in-memory store and must be changed to a shared store before horizontal production scaling.
