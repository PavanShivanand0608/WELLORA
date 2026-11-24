# WELLORA API

Local base URL: `http://localhost:8000/api`.

## Authentication

Browser authentication uses a short-lived JWT in the `wellora_access` HttpOnly cookie. The API does not return the JWT in JSON, and the frontend does not store it in browser storage. The cookie is `SameSite=Strict`, scoped to `/api`, and marked `Secure` when `APP_ENV=production`. Authentication responses use `Cache-Control: no-store`. The frontend and API should be deployed on the same site over HTTPS in production.

Unsafe requests require both the `wellora_csrf` HttpOnly cookie and the matching `X-CSRF-Token` header. The cookie contains an HMAC-signed double-submit token; JavaScript receives the token value from `GET /auth/csrf` and retains it in memory. The API also checks the `Origin` header when one is present. CORS allows credentials only from the configured `FRONTEND_ORIGIN`.

### `GET /auth/csrf`

Issues or reuses the CSRF cookie and returns `{ "csrfToken": "..." }`. The value is not an authentication secret.

### `POST /auth/register`

Request body:

```json
{
  "fullName": "Asha Rao",
  "email": "asha@example.test",
  "password": "A long strong passphrase 2026!",
  "confirmPassword": "A long strong passphrase 2026!"
}
```

Returns HTTP 201 with a public `user` object and sets the HttpOnly access cookie. Emails are trimmed and lowercased. Passwords require at least 12 characters and three character classes; the bcrypt input limit is 72 UTF-8 bytes. A unique database index prevents duplicate accounts. A default `UserSettings` document is created with the account.

### `POST /auth/login`

Accepts `{ "email": "...", "password": "..." }`. On success returns HTTP 200 with public user information and sets the access cookie. Unknown emails and incorrect passwords use the same HTTP 401 message.

### `GET /auth/me`

Requires a valid access cookie. Returns the authenticated user's ID, name, email, creation date, and available profile fields. Identity is read from the verified token; client-supplied user IDs are ignored.

### `POST /auth/logout`

Requires CSRF validation and clears the browser access cookie. Access tokens are stateless and are not revoked server-side; a copied token, if one were obtained, remains valid only until its short expiry. No refresh sessions are implemented.

### `POST /auth/password/forgot`

Accepts `{ "email": "..." }` and always returns the same HTTP 202 response to avoid account enumeration. A random reset token is generated and only its SHA-256 hash plus expiry are stored. **Email delivery is not configured**, so the response explicitly says no email was sent and the user cannot receive the token through this API yet.

### `POST /auth/password/reset`

Accepts `{ "token": "...", "password": "...", "confirmPassword": "..." }`. Tokens expire after `PASSWORD_RESET_TOKEN_EXPIRE_MINUTES` (15 by default), are single-use, and are not returned by the forgot endpoint. A successful reset changes the bcrypt hash and clears the reset token fields. Existing access JWTs are stateless and remain valid until expiry.

Login, registration, and password reset requests have configurable per-process IP rate limits. The default memory store is suitable for a single local API process; production multi-instance deployments should use a shared rate-limit store.

## Meals and nutrition

All meal routes require the authenticated access cookie. The API derives `userId` from that verified identity; it ignores any client-supplied owner ID. Create, update, and delete requests require CSRF validation. Nutrition values are optional: a missing field is omitted and remains unknown, while a recorded `0` is preserved.

Meal categories are `BREAKFAST`, `LUNCH`, `DINNER`, and `SNACK`; `logType` is `REGULAR` or `UNPLANNED`. Optional eating cues are `HUNGRY`, `CRAVING`, `OVERATE`, or `JUST_BECAUSE`; `eatingCueDetail` supports `PHYSICAL_HUNGER`, `CRAVINGS`, `STRESS`, `BOREDOM`, `EMOTIONAL_EATING`, `SOCIAL_OCCASION`, `CONVENIENCE`, or `OTHER`. A regular meal cannot include an eating cue.

### `POST /meals`

Creates a meal and its optional nutrition record. Required fields are `foodName`, `mealType`, `logType`, `loggedAt` (ISO date/time), positive `quantity`, and `servingUnit`. Nutrition values (`calories`, `proteinG`, `carbsG`, `fatG`, `fiberG`, `sugarG`, `sodiumMg`) are optional non-negative numbers. `hungerLevel` is optional and ranges from 1 to 5. Mood, notes, and context fields are optional.

```json
{
  "foodName": "Vegetable upma",
  "mealType": "LUNCH",
  "logType": "REGULAR",
  "loggedAt": "2026-11-25T07:45:00.000Z",
  "quantity": 1,
  "servingUnit": "bowl",
  "calories": 280,
  "proteinG": 8,
  "carbsG": 42,
  "fatG": 7
}
```

Returns HTTP 201 with `{ "meal": { ...mealFields, "nutrition": { ...recordedValues } } }`.

### `GET /meals`

Returns `{ meals, pagination }`. Supported filters are `date=YYYY-MM-DD` **or** both `startDate` and `endDate` ISO instants, `mealType`, `logType`, `eatingCue`, `eatingCueDetail`, and case-insensitive literal `search`. `page` defaults to 1, `limit` defaults to 50 and is capped at 100, and `sort=asc|desc` defaults to `desc` by logged time. Date keys are UTC calendar dates; the frontend computes timezone-aware ISO boundaries when it needs a user's local day.

### `GET /meals/:id`

Returns `{ "meal": ... }` for the authenticated owner. Invalid IDs return HTTP 400; missing or other users' meals return HTTP 404.

### `PUT /meals/:id`

Replaces the editable meal fields and returns the updated meal. It requires the same meal fields as `POST`. Omitted optional nutrition values are cleared; send `0` to record zero.

### `DELETE /meals/:id`

Deletes the owner's meal and its corresponding nutrition record, then returns `{ "message": "Meal deleted." }`. Other users' records are not disclosed.

### `GET /meals/summary`

Accepts the same `date` or `startDate`/`endDate` filters and returns `{ "summary": ... }` with meal counts, recorded nutrition totals and averages, recorded-value counts, and configured goals. A nutrient total is `null` when no meal recorded that nutrient; omitted values are not treated as zero.

## Analytics

The analytics endpoints require the authenticated HttpOnly cookie and return `Cache-Control: no-store`. Every database match uses the verified cookie identity; no user ID is accepted from the client. Requests may include an IANA `timezone` value (the frontend sends the browser's configured timezone). If omitted, the API uses UTC. Date values are `YYYY-MM-DD` calendar dates in that timezone; custom ranges are inclusive and limited to 366 days.

Nutrition totals are `null` when none of the meals in a period recorded that nutrient. A recorded value of `0` remains zero. Goal values are omitted when the user has not configured them, and remaining-goal values are `null` unless both a configured goal and a recorded total are available.

### `GET /analytics/dashboard?date=2026-11-25&timezone=Asia/Kolkata`

Returns `{ date, timezone, summary, meals, mealListPagination }`. The summary contains meal, regular, and unplanned counts; calorie, protein, carbohydrate, and fat totals, averages, and recorded counts; configured goals; and remaining goals. `meals` is limited to the selected local day and the 100 most recently logged records; pagination metadata makes the limit explicit.

### `GET /analytics/trends?range=7&timezone=Asia/Kolkata`

`range` accepts `7`, `30`, or `90`. Alternatively, provide both `startDate` and `endDate` for an inclusive custom range (maximum 366 days). Returns configured goals and a zero-filled day series with meal counts, daily nutrition totals, and per-nutrient recorded-value counts. Empty days have null nutrient totals, not invented zero intake.

### `GET /analytics/patterns?range=30&timezone=Asia/Kolkata`

Accepts the same preset or custom range parameters. Returns current and equal-length previous-period counts, recorded cue and hunger distributions, meal category and time-of-day distributions, common local hours, available mood observations and cue/mood associations, plus a daily trend series. Optional values that were not saved do not contribute to distributions or averages. Mood summaries describe recorded associations and do not imply causation.

All three endpoints use MongoDB aggregation pipelines. Meal date filtering uses the existing `{ userId, loggedAt, _id }` index; nutrition lookups use the unique `{ userId, mealId }` index. Patterns uses two bounded aggregate operations (current period detail and previous-period summary), not an in-memory meal-history fetch.

## Profile and settings

These routes require the authenticated HttpOnly cookie. They always use the verified identity and never accept a user ID. Responses are `Cache-Control: no-store`; `PUT` requests also require CSRF validation. Settings updates are partial: omitted fields are preserved, and nullable optional profile, goal, and reminder-time values can be cleared by sending `null`.

### `GET /settings` and `PUT /settings`

`GET` returns `{ settings: { profile, goals, foodPreferences, applicationPreferences } }`. New accounts receive neutral defaults: no configured nutrition goals, `NOT_SET` food style, empty preference lists, enabled notification preference with reminders off, `LIGHT` theme, and UTC timezone. A `PUT` body may contain any combination of these sections. The optional `profile` section can update full name, age, gender, height, weight, and activity level. Email is read-only. Food style accepts `NOT_SET`, `VEGETARIAN`, `NON_VEGETARIAN`, or `VEGAN`. Timezone must be an IANA timezone identifier.

Example:

```json
{
  "profile": { "fullName": "Asha Rao", "age": 31 },
  "goals": { "calories": 2000, "proteinG": 80, "objectives": ["Plan simple lunches"] },
  "foodPreferences": { "foodStyle": "VEGETARIAN", "allergies": ["peanuts"] },
  "applicationPreferences": { "timezone": "Asia/Kolkata", "mealReminderEnabled": true, "mealReminderTime": "08:30" }
}
```

### `GET /profile` and `PUT /profile`

`GET` returns `{ profile: { id, fullName, email, createdAt, age, gender, heightCm, weightKg, activityLevel } }`. `PUT` accepts the editable fields from the settings profile section and returns the updated profile and settings. Password hashes, reset tokens, and other sensitive account data are never returned.

## Recommendations

Recommendations require authentication and use the same verified account identity as settings and meal analytics. Recommendation IDs are account-scoped opaque IDs, so an ID copied from another account cannot be read or used for feedback. Recommendation reads return `Cache-Control: no-store`; all mutations require CSRF validation.

### `GET /recommendations`

Returns `{ plan }` with the 30-day period, meal count, nutrition-value coverage, supported pattern observations, `personalized` recommendations, and a separate `general` food-ideas list. Personalized rules have minimum evidence thresholds and explain the recorded counts behind each suggestion. Missing nutrition remains unknown. Food candidates are filtered against saved food style, dietary preferences, allergies, and foods to avoid. General ideas are explicitly labeled and are not presented as personalized.

The initial rule set uses the existing Patterns and nutrition trend aggregation internally. It is deterministic and rule-based; it does not call or claim to use an AI model. Fibre and ingredient variety are offered as general ideas because meal entries do not contain structured ingredient detail for those assessments.

### `GET /recommendations/:id`

Returns `{ recommendation }` only when that account's current plan contains the ID; otherwise returns 404.

### `POST /recommendations/:id/feedback`

Accepts at least one boolean field, for example `{ "helpful": true, "relevant": true }`. Feedback is stored against the authenticated user and the account-scoped recommendation ID.

### `GET /recommendations/saved`

Returns up to 100 saved recommendation snapshots with feedback state. A saved idea is checked again against the user's current food restrictions before it is returned.

### `POST /recommendations/:id/save` and `DELETE /recommendations/:id/save`

Save the current recommendation snapshot or remove it from the saved list. Feedback is retained when an item is unsaved. Saved snapshots remain available if their rule no longer appears in current analytics, subject to current dietary and allergy exclusions.

## Health endpoints

### `GET /health`

Liveness check. Returns HTTP 200 while the Express process serves requests.

### `GET /health/db`

Performs a MongoDB ping. Returns HTTP 200 with `dependencies.mongodb: "connected"` only after a successful ping; otherwise returns HTTP 503.

## Errors and cross-origin requests

Errors use a consistent envelope:

```json
{
  "error": { "code": "NOT_FOUND", "message": "Route GET /api/missing was not found." },
  "requestId": "..."
}
```

Validation details may be included for invalid request bodies. Unexpected errors return a generic 500 message; internal exception messages, submitted credentials, and password hashes are not returned. Helmet supplies standard security headers.
