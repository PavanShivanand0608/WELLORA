# WELLORA API

The API uses Node.js, Express 5, TypeScript, MongoDB, and Mongoose. Meal CRUD, nutrition summaries, Dashboard and Patterns analytics, recommendations, profile, and settings are persisted against the authenticated user. See [`docs/api.md`](../docs/api.md) for the current endpoint contract.

## Requirements and local setup

- Node.js 20 or later and npm.
- A reachable MongoDB server.

```sh
cd backend
npm install
cp .env.example .env
```

Set a private random `JWT_SECRET` with at least 32 characters in `backend/.env`. Keep `.env` out of version control. The defaults are MongoDB at `mongodb://127.0.0.1:27017`, database `wellora`, API host `127.0.0.1`, port `8000`, and frontend origin `http://localhost:5173`.

```sh
npm run dev
```

Verify `GET /api/health` and `GET /api/health/db`. The database health endpoint returns success only after a real MongoDB ping.

In another terminal, set `frontend/.env` from `frontend/.env.example` and run `cd frontend && npm install && npm run dev`. The frontend API base defaults to `http://localhost:8000/api`.

## Commands

```sh
npm run dev       # TypeScript watch server
npm run build     # Compile backend TypeScript
npm start         # Run compiled server
npm run typecheck # Type-check without emitting files
npm test          # Unit, HTTP, and MongoDB integration tests
```

Mongo-backed suites use separate, unique database names ending in `_test`. Each suite drops only the test database it created. The suite requires a local MongoDB service and must never use production data.

## Architecture

```text
app/
  app.ts                 Express composition and middleware order
  server.ts              Validated environment, startup, graceful shutdown
  config/                Environment and structured logging
  controllers/           Health, auth, meal, analytics, settings, recommendation handlers
  database/              Mongoose connection lifecycle
  middleware/            CSRF, authentication, validation, and errors
  models/                User-scoped Mongoose models
  routers/               Health, auth, meal, analytics, settings, recommendation routes
  services/              Auth, meal, nutrition, analytics, settings, recommendation logic
  utils/                 Cookie helpers, errors, password policy
  validators/            Zod request schemas
tests/                   Unit, HTTP composition, and isolated MongoDB integration checks
```

User-owned endpoints derive identity from the verified access-cookie token. Meal, nutrition, settings, profile, feedback, and saved recommendation queries are owner-scoped; the API does not authorize requests using a client-supplied user ID. Optional nutrition fields remain absent when unrecorded.

## Browser security and production limits

- The access JWT expires after `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (15 minutes by default), lives only in an HttpOnly `SameSite=Strict` cookie, and is never returned in JSON or stored by frontend JavaScript.
- Unsafe requests require an HMAC-signed, HttpOnly CSRF cookie and matching `X-CSRF-Token` header. The JavaScript token copy stays in memory. Authentication responses are marked `no-store`.
- Production cookies require HTTPS and `Secure`; deploy the browser and API on the same site for `SameSite=Strict`.
- Logout clears the browser cookie. There is no server-side JWT revocation list, so a copied stateless token remains valid until expiry.
- Authentication rate limits use an in-memory per-process store. Use a shared store for horizontally scaled production services.
- Password reset tokens are random, hashed in MongoDB, single-use, and expiring. No email provider is configured, so the API does not send reset email.
- Production startup disables automatic index creation. Apply a reviewed index migration before deploying a new production database.

See [local setup](../docs/backend-setup.md), the [API reference](../docs/api.md), and the [MongoDB schema notes](../database/mongo/README.md).
