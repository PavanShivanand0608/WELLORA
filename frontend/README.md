# WELLORA frontend

React, TypeScript, Vite, and Tailwind CSS v4 client for the WELLORA nutrition and wellness app.

## Local setup

From this directory, copy `.env.example` to `.env` if the API is not at its default URL, then run:

```sh
npm install
npm run dev
```

The Express backend must be available at `http://localhost:8000`, and its `FRONTEND_ORIGIN` must match the Vite origin (default `http://localhost:5173`). The frontend API base is `VITE_API_BASE_URL`, defaulting to `http://localhost:8000/api`. Registration and login use HttpOnly cookies and a CSRF token kept in memory. The client does not write passwords or access tokens to browser storage.

Meal Log, Quick Log, Dashboard, Patterns, Recommendations, and Settings use authenticated backend APIs. Demo illustrations and empty states do not represent persisted user records.

## Commands

```sh
npx tsc -b
npm run build
```
