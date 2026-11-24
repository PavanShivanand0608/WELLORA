# instruction.md: Personalized Nutrition & Wellness Management System

> **How to use this file (humans):** Put this file in the repo root. Open a chat with any LLM, paste the whole file, then say:
> **"Start at the first unchecked sub-phase."** Do the steps it gives you, send back a screenshot or error, then say "next". When a sub-phase works, tick its box (`- [ ]` to `- [x]`) and commit.
>
> **How to use this file (LLMs):** Read sections 1 to 5 first. Then work on **exactly one** unchecked sub-phase from section 6, following the rules in section 3. Never skip ahead.

---

## 1. Project summary

DBMS mini-project, AI & ML department, RVCE. **Deadline: 1 December 2026.**

- Regular meals form a personal **weekly baseline**.
- Unplanned/cheat meals are treated as **exceptions** and analysed for recurring hunger/craving and nutrient patterns. This is **association, not causation**.
- The AI/ML part is an **interpretable, rule-based hunger-pattern engine**: meals before a hunger event are compared with the weekly baseline, rules fire, and explainable recommendations come out.
- It is **not** a medical diagnosis or disease-prediction tool and **not** a generic chatbot. The UI must say "Not medical advice; patterns are associations, not causes."

**Hybrid database**
- PostgreSQL (or MySQL) holds the structured data, nine entities: `User, HealthGoal, FoodItem, MealLog, ExerciseLog, BodyMetrics, NutrientAlert, HungerPattern, Recommendation`.
- MongoDB holds the raw unplanned-meal details and NLP metadata, linked to SQL through `linked_meal_log_id`.

**DBMS concepts that must be demonstrated (for the report):** 1NF/2NF/3NF, primary/foreign keys, joins, subqueries, aggregates, window functions (rolling 5-day averages), views, triggers, transactions, indexing, SQL + NoSQL integration.

**Key features**
1. Landing page with sign-in, then dashboard.
2. Regular meal logging, plus exercise and body-metric logging.
3. Quick-log for unplanned meals: FoodItem search, quantity stepper, eating-cue buttons (Hungry / Craving / Overate / Just because), auto time, optional context dropdown. No free-text NLP in the UI.
4. Rolling 5-day nutrient averages with alerts.
5. Food alternatives pulled from the FoodItem table.
6. Hunger patterns page.
7. Explainable recommendations: meals, then FoodItem values, then SQL, then pattern, then rule, then recommendation.

---

## 2. Stack, tools, ports

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS v4 + React Router + TanStack Query + Recharts + axios + lucide-react. Font: Plus Jakarta Sans |
| Backend (built last) | FastAPI + SQLAlchemy + pymongo (Python 3.11+) |
| Databases | PostgreSQL + MongoDB |
| Tools | VS Code, Google Antigravity (AI coding tool that receives the prompts), PowerShell |
| Ports | Vite `5173`, uvicorn `8000` |

**Build order: frontend first (on mock data), database second, backend and integration last.** Because of this, the frontend must work with a `USE_MOCK` flag until Phase 21.

### Folder structure
```
nutrition-wellness/
├─ instruction.md
├─ README.md
├─ frontend/                 (Vite React-TS app)
├─ backend/
│  ├─ app/{routers,models,schemas,services}/
│  └─ tests/
├─ database/{schema,seeds,views_triggers,mongo}/
└─ docs/                     (ER diagram, DFD, normalization, evaluation, report)
```
Repo hygiene: `.gitignore` must include `node_modules/`, `.venv/`, `.env`, `__pycache__/`, `dist/`. Commit a `.env.example` (never `.env`).

---

## 3. Rules for the LLM (important)

1. **One sub-phase at a time.** Do not start the next one until the user confirms the current one works.
2. For the current sub-phase reply in exactly this shape:
   - **What this does:** 1 to 2 lines.
   - **The prompt / commands:** ONE copy-pasteable block. For frontend and backend code, write a prompt the user pastes into Antigravity. For setup, give PowerShell commands.
   - **How to check:** what the user should see, exactly.
3. Every Antigravity prompt must: name the folder it may touch, say "Do not change anything else", say "Do not start the dev server" (unless asked), and **end with** `npx tsc -b` inside `frontend/` (or `pytest` inside `backend/`) and report whether it passed.
4. Give full file paths and exact commands. Keep it short. The user prefers ready-to-use output over explanation.
5. Do not install libraries that are not in section 2 without asking.
6. Use the design tokens in section 5. Never invent new colours.
7. Use the data contract in section 4 for every type, table and API field name. If something must change, say so and update section 4 first.
8. **Never store passwords in the browser** (no localStorage for passwords). Mock sign-in stores nothing sensitive.
9. Fix errors the user pastes before moving on. If a library error appears, do not use `--force` or `--legacy-peer-deps`; show the error and ask.
10. Do not create fake or "template-looking" UI. The look must match the reference in section 5.

---

## 4. Data contract (canonical field names)

**PostgreSQL**
| Table | Columns |
|---|---|
| `users` | user_id PK, full_name, email UNIQUE, password_hash, height_cm, weight_kg, activity_level, created_at |
| `health_goals` | goal_id PK, user_id FK, goal_type (LOSE/MAINTAIN/GAIN), daily_calories, protein_g, carbs_g, fat_g, fiber_g, start_date, end_date |
| `food_items` | food_id PK, name, category, serving_label, serving_g, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg |
| `meal_logs` | meal_id PK, user_id FK, food_id FK, meal_type (BREAKFAST/LUNCH/DINNER/SNACK), log_type (REGULAR/UNPLANNED), quantity (servings, > 0), logged_at, eating_cue (HUNGRY/CRAVING/OVERATE/JUST_BECAUSE, only for UNPLANNED), context (optional) |
| `exercise_logs` | exercise_id PK, user_id FK, activity_type, duration_min, calories_burned, logged_at |
| `body_metrics` | metric_id PK, user_id FK, weight_kg, body_fat_pct (null), waist_cm (null), recorded_at |
| `nutrient_alerts` | alert_id PK, user_id FK, nutrient, window_days (5), avg_value, target_value, severity (LOW/HIGH), status, created_at |
| `hunger_patterns` | pattern_id PK, user_id FK, week_start, pattern_type, description, evidence_count, confidence (0 to 1), key_nutrient_gap, created_at |
| `recommendations` | rec_id PK, user_id FK, pattern_id FK, rule_id, text, suggested_food_id FK, explanation, created_at |

**MongoDB**: collection `unplanned_meals`
```json
{ "_id": "...", "linked_meal_log_id": 123, "user_id": 1,
  "cue": "CRAVING", "context": "Late night", "raw_text": null,
  "nlp_metadata": { "keywords": [], "mood": null }, "created_at": "ISO date" }
```
Index: unique on `linked_meal_log_id`; compound on `user_id, created_at`.

**Frontend TypeScript types** use the same names in camelCase (`mealType`, `logType`, `eatingCue`, and so on).

### Pattern-engine rules (suggested, interpretable; Phase 20)
Compare the meals in the N hours (default 4) before each unplanned meal against that user's weekly baseline of REGULAR meals.
| rule_id | Fires when | Pattern | Recommendation idea |
|---|---|---|---|
| R1 | Protein in the pre-window is more than 25% below baseline | Low-protein meal before cravings | Add a protein-rich alternative from FoodItem |
| R2 | Fibre in the pre-window is more than 25% below baseline | Low-fibre meal before hunger | Suggest high-fibre swaps |
| R3 | Gap since last meal is more than 5 hours | Long gap before unplanned eating | Suggest a planned snack |
| R4 | Unplanned meal at 22:00 or later, 3+ times a week | Late-night eating | Earlier, heavier dinner |
| R5 | Refined-carb or sugar share of the pre-window is above baseline | Sugar spike, then craving | Lower-sugar alternatives |

`confidence = evidence_count / total_unplanned_meals_in_week`, clamped to 0..1. Every recommendation stores the full explanation chain.

---

## 5. Design system (matches the reference "AI nutrition assistant" app)

Light, warm, premium. Bold geometric sans, big kcal numbers, rounded cards, soft shadows, real food photography, phone mockups with a camera cutout. Brand name on the landing page: **WELLORA**. Hero text: **"Your Food, Decoded By AI"** and **"Personal AI nutrition assistant"**. Avoid template or "vibe-coded" looks.

`frontend/src/index.css` theme block:
```css
@import "tailwindcss";
@theme {
  --font-sans: "Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif;
  --color-cream: #F4F0E9;   --color-backdrop: #D6CBC2;  --color-screen: #FBFAF7;
  --color-surface: #FFFFFF; --color-ink: #1E1E1E;       --color-panel: #2A2A2A;
  --color-muted: #8A8580;   --color-accent: #FF9F70;     --color-accent-soft: #FFE3D3;
  --color-sand: #E6E0D6;    --color-line: #ECE6DC;
  --radius-card: 24px;      --radius-tile: 16px;
  --shadow-soft: 0 6px 24px rgba(30,30,30,0.06);
  --shadow-phone: 0 30px 60px rgba(30,30,30,0.18);
  --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
}
```
Landing-page layout: left ~56% taupe `backdrop` area with staggered cropped phone mockups; right ~44% dark `panel` with brand, sign-in form, three food tiles and "Personal / AI nutrition assistant" at the bottom.

**Food photos** go in `frontend/public/images/food/` with these exact names (free-licence photos from Unsplash/Pexels, top-down, bowl centred; keep a `CREDITS.md`): `hero-citrus.jpg`, `bowl-quinoa.jpg`, `bowl-rainbow.jpg`, `bowl-vegan.jpg`, `bowl-avocado.jpg`, `meal-lunch.jpg`. Code must show an SVG fallback if a photo is missing. Download them by hand if automated downloads fail.

---

## 6. Phases and sub-phases (22 phases, 100 sub-phases)

Tick a box only after the user confirmed it works.

### PART A: FRONTEND (Phases 1 to 10, 49 sub-phases)

#### Phase 1: Folders + scaffold
- [x] **1.1 Create folders.** The structure in section 2 (empty folders and `README.md`).
- [x] **1.2 Vite app.** In `frontend/`: `npm create vite@latest . -- --template react-ts` then `npm install`.
- [x] **1.3 Libraries.** `npm install react-router-dom @tanstack/react-query recharts axios lucide-react`.
- [x] **1.4 Tailwind v4.** `npm install tailwindcss @tailwindcss/vite`; add `tailwindcss()` to the plugins in `vite.config.ts`; `index.css` starts with `@import "tailwindcss";`.
- [x] **1.5 src structure.** Folders `pages, components/{layout,ui,charts}, api/mock, hooks, types, lib`; six placeholder pages (Dashboard, MealLog, QuickLog, Patterns, Recommendations, Settings); router in `App.tsx`; `QueryClientProvider` in `main.tsx`.
- [x] **1.6 Run check.** `npm run dev` opens on `http://localhost:5173` with no errors.

#### Phase 2: Design system + landing page
- [x] **2.1 Tokens + font.** `npm i @fontsource-variable/plus-jakarta-sans`; import it in `main.tsx`; paste the theme block from section 5; add the reduced-motion media query.
- [x] **2.2 Base UI.** `components/ui/`: `Card, Button (dark/accent/sand/light, loading), IconButton, Chip, Badge, Input` (dark-panel input with label and error text).
- [x] **2.3 Landing shell.** `pages/Landing.tsx`: taupe left (empty for now) and dark right panel with brand, email/password form (show/hide password, validation, "Create an account" toggle), three food tiles and the two-line heading. Mock sign-in (about 800 ms) goes to `/dashboard`. Routes: `/` Landing, `/dashboard`, the other pages. No `/login` route.
- [x] **2.4 PhoneFrame + art.** `components/showcase/PhoneFrame.tsx` (280x580, camera cutout) and `FoodArt.tsx` (SVG: FoodBowl variants, FoodFries, FoodCitrus, FoodBowlIcon).
- [x] **2.5a Photo slot + first screens.** `FoodImage.tsx` (loads `/images/food/<name>.jpg`, falls back to SVG), `KcalGauge.tsx` (11 rounded segments in an arch, filled by value/goal), `screens/WelcomeScreen.tsx`, `screens/DashboardScreen.tsx`.
- [ ] **2.5b Recipe screens.** `screens/BottomNav.tsx`, `screens/RecipesScreen.tsx` (variants `list` and `trending`), `FoodJar` in `FoodArt.tsx`; four phones in a row as a preview.
- [ ] **2.5c Staggered showcase.** `screens/PhotoScreen.tsx` and `PhoneShowcase.tsx`: a fixed 1500x900 stage scaled to fit; columns at x = -30, 290, 610, 930, 1250; center column Welcome (top) and Dashboard (bottom), side columns recipe phones cropped at the edges, plus peeking phones above and below.
- [ ] **2.6 Motion.** Entrance of 1.4 to 1.6 s using `cubic-bezier(.22,1,.36,1)`: background settles, centre phone rises, others stagger in, headline then panel then form controls. Gauge fill, kcal count-up, then a subtle 3 to 5 px float (6 to 8 s). Respect `prefers-reduced-motion`. No animation libraries.
- [ ] **2.7 Mock auth + protected routes.** `lib/auth.ts` and an `AuthContext`; `ProtectedRoute` guards `/dashboard` and all inner pages; unauthenticated users go to `/`; sign-out button. Store only a non-sensitive "signed in" flag.
- [ ] **2.8 Mobile layout.** At 720 px and below: single column, brand on top, one compact phone, form below, 20 px side margins, controls at least 48 px high, no horizontal overflow. Test at 1440, 1024 and 390 px.

#### Phase 3: App layout
- [ ] **3.1 AppShell + Sidebar.** `components/layout/AppShell.tsx`, `Sidebar.tsx`: sidebar on `lg+` with logo and links (Dashboard, Meal Log, Quick Log, Patterns, Recommendations, Settings, Sign out); active link uses `accent-soft`.
- [ ] **3.2 MobileNav.** `components/layout/MobileNav.tsx`: dark rounded bottom bar, active item in an accent square (like the reference). Shown below `lg`.
- [ ] **3.3 TopBar.** Greeting, date, bell and calendar `IconButton`s.
- [ ] **3.4 Route wiring + PageHeader.** Nest all inner routes inside `AppShell` + `ProtectedRoute`; add `components/ui/PageHeader.tsx`; delete the temporary link row.

#### Phase 4: Types + mock data layer
- [ ] **4.1 Types.** `src/types/index.ts`: interfaces and enums for all nine entities from section 4.
- [ ] **4.2 Mock data.** `src/api/mock/*.ts`: about 30 foods, 5 weeks of meals (regular and unplanned with cues), exercise, metrics, 3 alerts, 3 patterns, 4 recommendations. Deterministic (no `Math.random`).
- [ ] **4.3 API functions.** `src/api/index.ts` with `getMeals, createMeal, searchFoods, getDashboard, getPatterns, getRecommendations`, and so on. `lib/config.ts` exports `USE_MOCK = true`; real calls are stubs using the axios client (`baseURL http://localhost:8000`).
- [ ] **4.4 Query hooks.** `src/hooks/`: `useMeals, useFoods, useDashboard, usePatterns, useRecommendations, ...` with TanStack Query.

#### Phase 5: Dashboard
- [ ] **5.1 Summary hero.** `KcalGauge` with today's kcal vs goal, and a macro row (protein, carbs, fat).
- [ ] **5.2 Rolling 5-day chart.** Recharts area/line, nutrient selector, goal reference line, colours from the tokens.
- [ ] **5.3 Alerts panel.** `NutrientAlert` cards with severity chips.
- [ ] **5.4 Today's meals.** Meal cards like the reference (round thumbnail, name, time, kcal, % of goal, P/C/F), REGULAR/UNPLANNED badge, and a "+" button that opens Quick Log.

#### Phase 6: Meal log
- [ ] **6.1 Meal list.** Meals grouped by day, with type and REGULAR/UNPLANNED badges.
- [ ] **6.2 Add regular meal.** Form with FoodItem search, quantity, meal type, time.
- [ ] **6.3 Edit / delete.** Edit form and a confirm dialog for delete.
- [ ] **6.4 Filters.** Date range, meal type, log type; empty state.

#### Phase 7: Quick-log (unplanned meals)
- [ ] **7.1 FoodSearch.** `components/quicklog/FoodSearch.tsx`: debounced search, results show name and kcal.
- [ ] **7.2 QuantityStepper.** +/- buttons in 0.5 steps, minimum 0.5.
- [ ] **7.3 CueButtons.** Hungry, Craving, Overate, Just because (single select, active state in accent).
- [ ] **7.4 Context + time.** Optional context dropdown (Work stress, Late night, Social, Boredom, Post-workout, Other) and an auto-filled, editable time.
- [ ] **7.5 Submit.** Mutation (mock for now), success toast, shows the nutrient impact, resets the form.

#### Phase 8: Patterns + Recommendations
- [ ] **8.1 Baseline vs unplanned chart.** Grouped bars per nutrient with a week selector.
- [ ] **8.2 Pattern cards.** Type, evidence count, confidence bar, week, and the "association, not causation" note.
- [ ] **8.3 Recommendation cards.** Text, suggested alternative food (from FoodItem, with nutrient values), priority.
- [ ] **8.4 Explain view.** A drawer showing the chain: meals, FoodItem values, query summary, pattern, rule, recommendation.

#### Phase 9: Exercise, metrics, goals, settings
- [ ] **9.1 Exercise.** List, add form, weekly minutes chart.
- [ ] **9.2 Body metrics.** Weight line chart and an add-entry form.
- [ ] **9.3 Goals form.** Goal type, calorie and macro targets, validation.
- [ ] **9.4 Settings.** Profile fields (name, height, weight, activity level) and sign out.

#### Phase 10: Frontend polish
- [ ] **10.1 States.** Loading skeletons, empty states, error states on every page.
- [ ] **10.2 Responsive pass.** 1440, 1024, 768, 390 px; no horizontal scroll.
- [ ] **10.3 Accessibility.** Labels, focus rings, keyboard use, contrast, aria attributes.
- [ ] **10.4 Full test.** Walk through every page with mock data; `npm run build` passes with no errors.

### PART B: DATABASE (Phases 11 to 16, 23 sub-phases)

#### Phase 11: ER design + normalization
- [ ] **11.1 Entities and attributes.** Table from section 4, in `docs/entities.md`.
- [ ] **11.2 ER diagram.** `docs/er-diagram.*` (Mermaid or draw.io). User 1:N to HealthGoal, MealLog, ExerciseLog, BodyMetrics, NutrientAlert, HungerPattern, Recommendation; FoodItem 1:N to MealLog; HungerPattern 1:N to Recommendation.
- [ ] **11.3 Normalization.** `docs/normalization.md`: start from one unnormalized meal record and show 1NF, 2NF, 3NF step by step, and why FoodItem is a separate table.

#### Phase 12: PostgreSQL schema
- [ ] **12.1 Core tables.** `database/schema/01_users_goals_food.sql`.
- [ ] **12.2 Log tables.** `02_logs.sql`: meal_logs, exercise_logs, body_metrics.
- [ ] **12.3 Analysis tables.** `03_analysis.sql`: nutrient_alerts, hunger_patterns, recommendations.
- [ ] **12.4 Constraints + run script.** `04_constraints.sql`: CHECKs (`log_type` values, `eating_cue` only when UNPLANNED, `quantity > 0`), foreign keys, delete rules; `run_all.sql`; verify with `\dt`.

#### Phase 13: Seed data
- [ ] **13.1 FoodItem seed.** `database/seeds/01_food_items.sql`: 60 to 100 common and Indian foods (idli, dosa, roti, dal, rice, paneer, sambar, curd, banana...) with approximate per-serving values.
- [ ] **13.2 Demo user + regular meals.** `02_demo_user.sql`: one demo user, goals, 5 weeks of regular meals, exercise, metrics.
- [ ] **13.3 Unplanned meals.** `03_unplanned.sql`: about 40 unplanned meals with cues. **Plant 2 to 3 known patterns** (for example low-protein breakfast followed by afternoon cravings, long gaps, late-night eating) so the engine can be evaluated.
- [ ] **13.4 Verification.** `database/seeds/verify.sql` with row counts and sanity queries.

#### Phase 14: Views + window functions
- [ ] **14.1 Daily totals.** `vw_daily_nutrients`.
- [ ] **14.2 Rolling 5-day average.** `vw_rolling_5day` using `AVG(...) OVER (PARTITION BY user_id ORDER BY day ROWS BETWEEN 4 PRECEDING AND CURRENT ROW)`.
- [ ] **14.3 Weekly baseline.** `vw_weekly_baseline` (REGULAR meals only).
- [ ] **14.4 Unplanned vs baseline.** `vw_unplanned_vs_baseline`.

#### Phase 15: Triggers, indexes, transactions
- [ ] **15.1 Alert trigger.** On `meal_logs` insert, recompute the rolling average and insert a `nutrient_alerts` row when it passes the goal threshold.
- [ ] **15.2 Indexes.** On `(user_id, logged_at)` and `log_type`; show `EXPLAIN ANALYZE` before and after.
- [ ] **15.3 Transaction.** The unplanned-meal write as a transaction (SQL insert plus Mongo document, with rollback or a compensating delete on failure); document the pattern.
- [ ] **15.4 Report queries.** `database/views_triggers/report_queries.sql`: joins, subqueries, aggregates, GROUP BY/HAVING, with saved outputs.

#### Phase 16: MongoDB layer
- [ ] **16.1 Collection design.** `unplanned_meals` schema from section 4.
- [ ] **16.2 Indexes.** Unique on `linked_meal_log_id`; compound on `user_id, created_at`.
- [ ] **16.3 Sample documents.** Script in `database/mongo/` creating one document per seeded unplanned meal.
- [ ] **16.4 Link test.** Script that fetches a `meal_logs` row and its Mongo document by `linked_meal_log_id`.

### PART C: BACKEND + INTEGRATION (Phases 17 to 22, 28 sub-phases)

#### Phase 17: FastAPI skeleton
- [ ] **17.1 Environment.** `backend/.venv`; `requirements.txt` (fastapi, uvicorn[standard], sqlalchemy, psycopg2-binary, pymongo, pydantic-settings, python-jose, passlib[bcrypt], pytest, httpx).
- [ ] **17.2 App + config.** `app/main.py`, `app/config.py`, `.env.example`.
- [ ] **17.3 SQLAlchemy.** `app/database.py` and `app/models/*.py` matching section 4.
- [ ] **17.4 pymongo.** `app/mongo.py` connection helper.
- [ ] **17.5 Health + CORS.** `GET /health`; CORS for `http://localhost:5173`; run `uvicorn app.main:app --reload --port 8000`.

#### Phase 18: Core CRUD APIs
(Each sub-phase adds Pydantic schemas in `schemas/`, a router in `routers/`, and a test in `tests/`.)
- [ ] **18.1 Auth.** `POST /auth/register`, `POST /auth/login` (JWT, bcrypt), `GET /auth/me`.
- [ ] **18.2 Goals.** CRUD for health goals.
- [ ] **18.3 Foods.** `GET /foods?search=`.
- [ ] **18.4 Meals.** CRUD for regular meals.
- [ ] **18.5 Exercise + metrics.** CRUD.

#### Phase 19: Unplanned-meal flow + analytics
- [ ] **19.1 Quick-log endpoint.** `POST /meals/unplanned`: SQL insert and Mongo document in one flow, with rollback on failure.
- [ ] **19.2 Rolling averages.** `GET /analytics/rolling?nutrient=&days=` (uses the view from 14.2).
- [ ] **19.3 Alerts.** `GET /alerts`.
- [ ] **19.4 Dashboard summary.** `GET /dashboard`.

#### Phase 20: Pattern engine + recommendations (the AI/ML part)
- [ ] **20.1 Weekly baseline.** `services/baseline.py`.
- [ ] **20.2 Pre-hunger windows.** `services/windows.py`: meals in the N hours before each unplanned meal, plus the gap since the last meal.
- [ ] **20.3 Rules + scoring.** `services/patterns.py`: rules R1 to R5 from section 4; store `hunger_patterns`.
- [ ] **20.4 Recommendations.** `services/recommendations.py` with the full explanation chain and an alternative FoodItem; endpoints `GET /patterns`, `GET /recommendations`.
- [ ] **20.5 Evaluation.** Script checking that the planted patterns from 13.3 are recovered; precision/recall table in `docs/evaluation.md`. State clearly that the data is synthetic.

#### Phase 21: Connect everything
- [ ] **21.1 Switch off mock.** Set `USE_MOCK = false`; point the axios client to the API.
- [ ] **21.2 Real auth.** Replace the mock sign-in with `/auth/login` (JWT kept in memory or an httpOnly cookie).
- [ ] **21.3 End-to-end test.** Register, log in, log regular and unplanned meals, see alerts, patterns and recommendations.
- [ ] **21.4 Bug fixes.**

#### Phase 22: Docs + submission
- [ ] **22.1 README.** Run steps for DB, backend and frontend.
- [ ] **22.2 Report PDF.** 25 to 30+ pages: problem, features, DBMS design, AI/ML, data, accuracy, outputs.
- [ ] **22.3 Synopsis.** Maximum 2 pages. The proposed system is written around **weekly** analysis (weekly baseline and weekly comparisons), not a 30-day baseline.
- [ ] **22.4 Diagrams + screenshots.** ER diagram, DFD (3 levels), screenshots of every page.
- [ ] **22.5 Submission.** Final run-through and hand-in.

---

## 7. Suggested split between teammates

| Person | Works on | Needs first |
|---|---|---|
| A | Frontend, Phases 2 to 10 | Nothing (uses mock data) |
| B | Database, Phases 11 to 16 | Nothing |
| C | Backend, Phases 17 to 20 | B's Phase 12 (schema) |
| D | Docs, Phases 11.2, 11.3, 22 and the DFD | A, B, C results for screenshots |

Phase 21 is done together at the end.

## 8. Reference: Data flow diagram (for the report)
- **Level 0:** User and Food Data Source around one system.
- **Level 1:** 1.0 Manage Profile & Goals, 2.0 Log Meals (regular and unplanned), 3.0 Analyze Nutrients & Hunger Patterns, 4.0 Generate Recommendations. Stores: D1 User & Goal, D2 Meal & Activity Log, D3 Food Item DB, D4 Unplanned Meal Store (MongoDB), D5 Analysis Results.
- **Level 2:** pattern engine split into weekly baseline, pre-hunger windows, comparison against baseline, rule scoring.
