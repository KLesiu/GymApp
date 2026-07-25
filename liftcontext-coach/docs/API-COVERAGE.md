# API Coverage

The current OpenAPI contract does not define `operationId`; endpoint + method is used as the stable identifier.

| Feature | Endpoint | Role | Status | Notes |
| --- | --- | --- | --- | --- |
| Coach login | `POST /api/v1/auth/login`, `GET /api/v1/auth/me` | TRAINER | implemented | `/me` verifies role after login; token contents alone are not trusted. |
| Coach registration | `POST /api/v1/auth/trainer/register` | public | implemented | Public because OpenAPI exposes it without auth. |
| Trainee list | `GET /api/v1/trainer/trainees` | TRAINER | implemented | Trainee identity comes from response `id`/`traineeId`. |
| Relationship invite | `POST /api/v1/trainer/relationships` | TRAINER | implemented | Body follows `{ traineeId }`. |
| Unlink trainee | `POST /api/v1/trainer/trainees/{traineeId}/unlink` | TRAINER | implemented | Destructive confirmation and cache removal. |
| Current Elo | `GET /api/v1/users/{userId}/elo` | authenticated + active relationship | implemented | API enforces self-or-active-relationship. |
| Elo chart | `GET /api/v1/elo/chart` | authenticated | limited | Route does not expose trainee query in implementation; marked limited. |
| Workouts | `GET /api/v1/workouts`, `GET /api/v1/workouts/{workoutId}` | authenticated | limited | Route implementation lists actor history only; coach trainee selector unsupported. Drafts filtered out in UI. |
| Measurements | `GET /api/v1/measurements/history`, `GET /api/v1/measurements/trends` | authenticated + active relationship | implemented | Supports `userId` query through backend schema. |
| Plans | `GET/POST/PATCH/DELETE /api/v1/plans`, `POST /api/v1/plans/{planId}/assignments` | authenticated / TRAINER for assignment | implemented | Detailed day editing is limited by available endpoints. |
| Exercises | `GET/POST/PATCH/DELETE /api/v1/exercises` | authenticated | implemented | Management screen is conservative. |
| Muscle groups | `GET/POST /api/v1/muscle-groups` | authenticated | implemented | Basic list screen. |
| Report templates | `GET/POST/PATCH/DELETE /api/v1/trainer/report-templates` | TRAINER | implemented | Builder supports OpenAPI field types TEXT, NUMBER, SCALE. |
| Report assignments | `POST /api/v1/trainer/report-assignments` | TRAINER | implemented | Assignment uses frozen template version server-side. |
| Report submissions | `GET /api/v1/trainer/report-submissions` | TRAINER | implemented | Supports trainee filter where API query accepts it. |
| Report feedback | `PATCH /api/v1/trainer/report-submissions/{submissionId}/feedback` | TRAINER | implemented | Overall feedback implemented; per-field comments supported by API layer. |
| Recurring report rules | `GET/POST/PATCH/DELETE /api/v1/trainer/recurring-report-rules`, pause/resume routes | TRAINER | limited | Pause/resume/list implemented; rich scheduling UI is limited. |
| Ranking | `GET /api/v1/ranking` | authenticated | implemented | Optional view because OpenAPI exposes endpoint. |
| Admin, athlete web, Google OAuth, uploads, SignalR/WebSocket | none in current scope | n/a | out-of-scope | Intentionally omitted. |
