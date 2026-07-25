# API compatibility

| Use case | Reference flow | New OpenAPI endpoint | Request / response | Error handling | Cache / invalidation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Register/login/session | Auth flow | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me` | register/login DTOs, JWT response | 401 clears session; 403 does not | `auth/me` | Implemented |
| Gyms CRUD | Gym context | `GET/POST /api/v1/gyms`, `GET/PATCH/DELETE /api/v1/gyms/{gymId}` | `GymRequest`, gym DTOs with `_id` | envelope mapped safely | `gyms` | Implemented shell |
| Exercises/groups | Exercise setup | `GET/POST /api/v1/muscle-groups`, `GET/POST/PATCH/DELETE /api/v1/exercises` | muscle/exercise DTOs | validation details shown safely | `muscle-groups`, `exercises` | Implemented shell |
| Plans | Training plans | `GET/POST /api/v1/plans`, active/copy/day endpoints | nested day/exercise DTOs | 403 shown as permission issue | `plans`, `plans/active` | Implemented shell |
| Draft workout | Active training | `POST /api/v1/workouts` | gym, optional plan/day, startedAt, sets | mutation disables duplicate taps | `workouts` | Implemented |
| Same-gym benchmark | Previous scores | `POST /api/v1/exercises/last-scores` | exerciseId, series, gymId | empty state when none | active mutation result | Implemented/tested |
| Finalization | Finish workout | `POST /api/v1/workouts/{workoutId}/finalize` | stable `Idempotency-Key` | retry uses same key | workouts, Elo, ranking | Implemented/tested |
| History/Elo/ranking | History | `GET /api/v1/workouts`, `/ranking`, `/users/{userId}/elo`, `/elo/chart` | paginated ranking and chart points | 403 safe message | module keys | Implemented shell |
| Body tracker | Measurements | `GET/POST /api/v1/measurements`, `/history`, `/trends` | bodyPart/unit/value/takenAt | validation details shown | measurements/trends | Implemented shell |
| Coach relationship | Trainer relation | relationship accept/reject/detach endpoints | current API uses traineeId, no code endpoint | unsupported code behavior documented | reports/trainer | Prepared shell |
| Reports | Trainee reports | `GET /api/v1/trainee/report-assignments`, submit endpoint | frozen template answers | required/type validation by API | reports | Implemented shell |
