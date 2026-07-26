# LiftContext thesis compliance matrix

| Requirement | API | Mobile | Coach | Test | Status |
| --- | --- | --- | --- | --- | --- |
| PostgreSQL + Prisma backend | Prisma schema and migrations | N/A | N/A | API acceptance on PostgreSQL | Done |
| JWT authorization | Passport JWT | Token storage/client | Token storage/client | Auth acceptance tests | Done |
| Trainer invite by public code | `traineeCode` relationship endpoint | Shows own code and pending invites | Invite form uses code | Acceptance tests updated | Done |
| One active trainer per trainee | Transaction + partial index | Accept/reject UI | Trainee list | Acceptance coverage | Done |
| Same-gym workout benchmark | Same-gym comparison endpoint/finalization | Workout setup renders same-gym benchmark preview | Read-only profile/ranking context | API acceptance + mobile benchmark tests | Done |
| Multiweek plan model | `weeksCount`, `weekNumber` migration/API | Plan UI groups days by week | Plan list/editor show multiweek structure | Existing plan tests | Done |
| Reports with frozen versions | Template version snapshots returned with submissions | Basic submission flow | Submission view renders frozen fields/version | Report acceptance tests | Done |
| LiftContext Rating | Server-calculated rating | Profile shows rating, history, and ranking | Ranking table/profile rating | Ranking acceptance + mobile screen tests | Done |
| Remove raw JSON final screens | N/A | Existing smoke tests | Raw serialized debug blocks removed from audited views | Coach unit tests | Done |
| Root CI location | `.github/workflows/ci.yml` | Included | Included | Contract job included | Done |

Statuses are conservative: `Partial` means working code exists but not every requested UI/E2E detail is complete.
