# WELLORA

WELLORA is a personalized nutrition and wellness management system for recording meals, reviewing nutrition totals, and noticing eating patterns. Its insights describe recorded associations; they are not medical advice or claims of causation.

## Main features

- Keep a user-scoped meal journal with optional nutrition, eating-cue, hunger, mood, and context details.
- Summarize recorded nutrition against user-configured goals while preserving missing values as unknown.
- Present explainable pattern observations and practical food suggestions without inferring unsupported preferences.
- Keep profile, goals, and food and reminder preferences with the authenticated account.

## Prerequisites

- Node.js 20 or newer and npm.
- A MongoDB server reachable from the backend.

## Current technology stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Recharts, Axios, and lucide-react.
- **Backend:** Node.js, Express 5, and TypeScript.
- **Persistence:** MongoDB with Mongoose.
- **Authentication:** bcrypt password hashes, short-lived HS256 JWTs in HttpOnly cookies, and CSRF-protected unsafe requests.
- **Typography:** Plus Jakarta Sans Variable.

The current implementation uses Express and MongoDB. `instruction.md` also describes a broader FastAPI/PostgreSQL project direction; reconcile that architectural difference before replacing the running backend or adding a second persistence stack.

## Project structure and architecture

```text
frontend/src/                 React pages, layout, UI, API client, contexts, and query hooks
backend/app/config/           Validated environment configuration and logging
backend/app/controllers/      HTTP request handlers
backend/app/database/         MongoDB connection lifecycle
backend/app/middleware/       Auth, CSRF, validation, security, and error handling
backend/app/models/           User, meal, nutrition, settings, patterns, and feedback models
backend/app/routers/          Health, auth, meals, analytics, settings, and recommendations
backend/app/services/        Persistence, analytics, nutrition, and rule-based recommendations
backend/tests/                Unit, HTTP, and MongoDB integration tests
database/mongo/               MongoDB model and index notes
docs/                         Setup and API documentation
```

Every user-owned API query uses the authenticated identity. Meal CRUD, nutrition summaries, Dashboard and Patterns analytics, Recommendations, profile, and settings use the MongoDB API. The UI consumes those APIs through the shared Axios client and TanStack Query; credentials are not stored in browser storage.

## Local development

Install and configure the backend and frontend separately. The environment templates contain placeholders and local defaults; keep the `.env` files private and out of Git.

### Environment variables

Copy `backend/.env.example` to `backend/.env`. The required values are `MONGODB_URI`, `MONGODB_DATABASE`, and a private `JWT_SECRET` of at least 32 characters. `BACKEND_HOST`, `BACKEND_PORT`, `APP_ENV`, and `FRONTEND_ORIGIN` have local development defaults; the template also documents logging, token expiry, and authentication rate limits.

Copy `frontend/.env.example` to `frontend/.env` when the API is not at its default URL. It defines `VITE_API_BASE_URL`; the default is `http://localhost:8000/api`.

### Start the backend

```sh
cd backend
npm install
cp .env.example .env
npm run dev
```

### Start the frontend

```sh
cd frontend
npm install
cp .env.example .env
npm run dev
```

The defaults are Vite at `http://localhost:5173`, Express at `http://127.0.0.1:8000`, and the API base `http://localhost:8000/api`. Check `GET /api/health` and `GET /api/health/db` before registering a user. See [backend setup](docs/backend-setup.md) and the [API reference](docs/api.md) for details.

## Verification commands

```sh
cd backend && npm test && npm run build
cd ../frontend && npx tsc -b && npm run build
```

MongoDB integration tests use unique databases ending in `_test` and clean up only their own test databases. Do not configure tests to use production data.

## Development roadmap

1. Continue regression, accessibility, responsive, and security verification of the integrated modules.
2. Reconcile the implemented Express/MongoDB architecture with the broader PostgreSQL/FastAPI design in `instruction.md` before introducing another backend or database.
3. Add a configured email provider before enabling password-reset delivery; consider shared rate limiting and token revocation before horizontal or production deployment.
4. Complete project-specific database evaluation, diagrams, and submission documentation.
