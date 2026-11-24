# WELLORA MongoDB schema foundation

Mongoose schemas and indexes are defined in `backend/app/models/`. MongoDB stores the six document types below. Every user-owned document is scoped to its required `userId` reference. Authenticated APIs are active for meals and nutrition, analytics, profile and settings, recommendations, and recommendation feedback.

## Collections and relationships

| Model / collection | Important fields | Relationships and indexes |
|---|---|---|
| `User` | `fullName`, normalized unique `email`, `passwordHash`, optional `age`, `gender`, `heightCm`, `weightKg`, `activityLevel`, password-reset token hash/expiry | Unique index on `email`; password and reset hashes have `select: false`; sparse unique reset-token hash index; timestamps |
| `Meal` | `userId`, `foodName`, `mealType`, `logType`, `quantity`, `servingUnit`, `loggedAt`, cue/context/mood fields | `userId` references User; indexes `(userId, loggedAt)` and `(userId, logType, loggedAt)` |
| `Nutrition` | `userId`, `mealId`, optional `calories`, `proteinG`, `carbsG`, `fatG`, `fiberG`, `sugarG`, `sodiumMg` | Meal and User references; unique `(userId, mealId)`; absent nutrient fields remain unknown rather than zero |
| `UserSettings` | `userId`, goals, food preferences, application preferences | Unique index on `userId`; timestamps. Profile attributes live on User to avoid duplicate storage. |
| `EatingPattern` | `userId`, `weekStart`, `weekEnd`, `patternType`, description, evidence count, confidence, evidence summary | Index `(userId, weekStart desc)`; confidence constrained to 0–1; descriptions are associations, not causal claims |
| `RecommendationFeedback` | `userId`, `recommendationKey`, optional helpful/relevant feedback, saved state | Unique `(userId, recommendationKey)`; timestamps |

All schemas use Mongoose timestamps (`createdAt`, `updatedAt`) and omit the version key. Production startup disables automatic index creation; run an explicit reviewed index migration before deploying a production database. Development enables schema indexes automatically.

## Authentication data lifecycle

Registration normalizes email and stores only a bcrypt hash. It creates the unique `UserSettings` document immediately after the User; if settings creation fails, registration attempts to remove the new User. MongoDB's unique email index handles concurrent duplicate registrations. Password reset stores only a SHA-256 token hash and expiry; the raw token is not returned publicly. Reset clears those fields after use. Access JWTs are stateless and are not persisted in MongoDB or revoked on logout.

## Isolation and integrity notes

- `userId` is required and immutable on user-owned records.
- `Nutrition` has a unique user/meal pair to avoid duplicate nutrition summaries for one user's meal.
- Meal categories and log kinds match the existing frontend enums. Nutrient values are optional and non-negative; absence is preserved.
- Meal and nutrition services scope referenced records to the same authenticated `userId`; Mongoose references alone do not enforce cross-document ownership.
- Meal deletion removes its matching Nutrition document through the service layer. MongoDB transactions and general-purpose cascade behavior are not implemented, so production operations spanning multiple documents should be reviewed for transaction support before scaling.

The existing `instruction.md` describes a broader PostgreSQL/FastAPI plan and an `unplanned_meals` collection. The running application currently uses Express/Mongoose and the models above. Reconcile the architecture before adding a second database or backend; this documentation does not claim that the SQL/Mongo hybrid has been implemented.
