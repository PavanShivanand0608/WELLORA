# WELLORA — Personalized Nutrition & Wellness Management System

WELLORA is a personalized nutrition and wellness application for recording meals, reviewing nutrition totals, and noticing eating patterns. Its insights describe recorded associations; they are not medical advice or claims of causation.

## Project context

This repository began with a DBMS mini-project brief under the name **NutriPulse**, for RV College of Engineering, AI & ML Department. That brief proposed using PostgreSQL for a regular eating baseline and MongoDB for unplanned meal records. The current WELLORA implementation uses MongoDB through the Express API; it does not currently include a PostgreSQL persistence layer. The original project specification remains in [`instruction.md`](instruction.md), and the current implementation is documented below and in [`docs/`](docs/).

## Main features

- Keep a user-scoped meal journal with optional nutrition, eating-cue, hunger, mood, and context details.
- Summarize recorded nutrition against user-configured goals while preserving missing values as unknown.
- Present explainable pattern observations and practical food suggestions without inferring unsupported preferences.
- Keep profile, goals, dietary preferences, and reminder settings with the authenticated account.
- Protect account sessions with HttpOnly JWT cookies and CSRF checks for unsafe requests.

## Technology stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Recharts, Axios, and lucide-react.
- **Backend:** Node.js, Express 5, and TypeScript.
- **Persistence:** MongoDB with Mongoose.
- **Authentication:** bcrypt password hashes, short-lived HS256 JWTs in HttpOnly cookies, and CSRF-protected unsafe requests.
- **Typography:** Plus Jakarta Sans Variable.

## Project structure

```text
frontend/src/                 React pages, layout, UI, API client, contexts, and query hooks
backend/app/config/           Validated environment configuration and logging
backend/app/controllers/      HTTP request handlers
backend/app/database/         MongoDB connection lifecycle
backend/app/middleware/       Auth, CSRF, validation, security, and error handling
backend/app/models/           User, meal, nutrition, settings, patterns, and feedback models
backend/app/routers/          Health, auth, meals, analytics, settings, and recommendations
backend/app/services/         Persistence, analytics, nutrition, and rule-based recommendations
backend/tests/                Unit, HTTP, and MongoDB integration tests
database/mongo/               MongoDB model and index notes
docs/                         Setup and API documentation
```

User-owned API queries use the authenticated identity. Meal CRUD, nutrition summaries, Dashboard and Patterns analytics, Recommendations, profile, and settings use the MongoDB API. The UI consumes those APIs through the shared Axios client and TanStack Query; credentials are not stored in browser storage.

## Prerequisites

- Node.js 20 or newer and npm.
- A MongoDB server reachable from the backend.

## Local installation and environment setup

Install the backend and frontend dependencies separately. Environment templates contain placeholders and local defaults. Keep actual `.env` files private and out of Git.

### Backend environment

From the repository root:

```sh
cp backend/.env.example backend/.env
```

Set `MONGODB_URI`, `MONGODB_DATABASE`, and a private `JWT_SECRET` of at least 32 characters in `backend/.env`. `BACKEND_HOST`, `BACKEND_PORT`, `APP_ENV`, and `FRONTEND_ORIGIN` have local development defaults. The template also documents logging, token expiry, and authentication rate limits.

### Frontend environment

The default API URL is `http://localhost:8000/api`. If you need a different URL, create `frontend/.env` from its template:

```sh
cp frontend/.env.example frontend/.env
```

Set `VITE_API_BASE_URL` to the API base URL. The root `.env.example` points to the package-specific templates; it is not a place for real credentials.

## Run locally

Start MongoDB first. Then start the backend in one terminal:

```sh
cd backend
npm install
npm run dev
```

Start the frontend in another terminal:

```sh
cd frontend
npm install
npm run dev
```

With the default configuration, Vite runs at `http://localhost:5173` and Express at `http://127.0.0.1:8000`. Check `GET /api/health` and `GET /api/health/db` before registering an account. See the [backend setup guide](docs/backend-setup.md) and [API reference](docs/api.md) for details.

## Tests and build checks

Backend tests include unit, HTTP, and MongoDB integration checks. Mongo-backed tests use isolated database names ending in `_test` and clean up only their own test databases. Ensure the test configuration points to a local test MongoDB instance, never production data.

```sh
cd backend
npm test
npm run build
```

Frontend TypeScript and production build checks:

```sh
cd frontend
npx tsc -b
npm run build
```

## Development notes

The implemented backend uses Express and MongoDB. `instruction.md` describes a broader FastAPI/PostgreSQL direction; reconcile that architectural difference before replacing the current backend or adding another persistence stack. No deployment is configured by this repository.

Production considerations and local setup details are in [`backend/README.md`](backend/README.md), [`docs/backend-setup.md`](docs/backend-setup.md), and [`docs/api.md`](docs/api.md).
