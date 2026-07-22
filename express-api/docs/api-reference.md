# LGYM Express API Reference / Dokumentacja API

## Polski

### 1. Cel systemu

LGYM Express API to backend do zarzadzania treningami, planami, pomiarami ciala, relacja trener-podopieczny, raportami okresowymi oraz rankingiem Elo. Projekt jest modularnym monolitem opartym o Express, TypeScript, Prisma i PostgreSQL.

### 2. Stack technologiczny

- Runtime: Node.js 22+
- Framework HTTP: Express 4
- Jezyk: TypeScript strict
- ORM: Prisma
- Baza danych: PostgreSQL 16+
- Autoryzacja: JWT przez Passport
- Walidacja wejscia: Zod
- Hasla: argon2
- Dokumentacja: Swagger UI / OpenAPI 3.0
- Testy: Vitest, Supertest, Testcontainers

### 3. Uruchomienie lokalne

1. Skopiuj `express-api/.env.example` do `express-api/.env`.
2. Uruchom PostgreSQL: `docker compose up -d db`.
3. Zainstaluj paczki: `npm install`.
4. Wygeneruj Prisma Client: `npm run prisma:generate`.
5. Wykonaj migracje: `npm run prisma:migrate`.
6. Zasiej dane testowe: `npm run prisma:seed`.
7. Zbuduj i uruchom API: `npm run build && npm start`.

Adresy pomocnicze:

- Health check: `GET http://localhost:3000/health`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

Seed tworzy konta:

- trener: `trainer@example.com`, nazwa `seed-trainer`, haslo `password123`
- podopieczny: `trainee@example.com`, nazwa `seed-trainee`, haslo `password123`

### 4. Konfiguracja srodowiskowa

| Zmienna | Opis |
| --- | --- |
| `DATABASE_URL` | Polaczenie Prisma do glownej bazy PostgreSQL. |
| `TEST_DATABASE_URL` | Polaczenie do bazy testowej. |
| `JWT_SECRET` | Sekret do podpisywania tokenow JWT; musi miec minimum 16 znakow. |
| `PORT` | Port HTTP API, domyslnie `3000`. |
| `NODE_ENV` | `development`, `test` albo `production`. |
| `CORS_ORIGINS` | Lista dozwolonych originow oddzielona przecinkami albo `*`. |

### 5. Architektura

Projekt ma strukture modularnego monolitu:

- `src/app.ts` sklada aplikacje Express, middleware, Swagger UI i routery.
- `src/server.ts` uruchamia serwer HTTP.
- `src/config` obsluguje konfiguracje srodowiskowa.
- `src/core` zawiera mechanizmy wspolne: auth, access control, Prisma, bledy, walidacje, OpenAPI.
- `src/modules/*` zawiera domeny biznesowe: auth, users, gyms, exercises, plans, workouts, measurements, trainer, reports.
- `prisma/schema.prisma` definiuje model danych.
- `prisma/migrations` zawiera migracje bazy.
- `prisma/seed.ts` tworzy dane startowe.
- `tests` zawiera testy akceptacyjne.

Standardowy przeplyw requestu:

1. Express odbiera request.
2. Middleware CORS, Helmet, JSON parser i rate limit sa wykonywane globalnie lub per routing.
3. Dla chronionych endpointow `requireAuth` weryfikuje JWT.
4. `validate` sprawdza `body`, `params` i `query` przez Zod.
5. Router przekazuje request do service.
6. Service wykonuje reguly biznesowe, role i kontrole dostepu.
7. Repository wykonuje operacje Prisma/PostgreSQL.
8. Centralny error middleware zwraca jednolity blad HTTP.

### 6. Baza danych i modele

Glowna baza to PostgreSQL. Prisma korzysta z `DATABASE_URL`. Identyfikatory biznesowe sa UUID. Relacje krytyczne maja kaskadowe usuwanie albo ograniczenia `Restrict`/`SetNull`, zalezne od potrzeby zachowania historii.

Najwazniejsze modele:

- `User` - konto uzytkownika z `name`, `email`, `passwordHash`, widocznoscia w rankingu i aktualnym Elo.
- `UserRole` - role `TRAINEE` i `TRAINER`; uzytkownik moze miec wiecej niz jedna role.
- `Gym` - silownia uzytkownika; uzywa soft delete przez `deletedAt`, zeby zachowac historie treningow.
- `MuscleGroup` - grupa miesniowa uzytkownika.
- `Exercise` - cwiczenie przypiete do grupy miesniowej i formuly Elo.
- `Plan`, `PlanDay`, `PlanExercise` - plan treningowy, dni planu i cwiczenia w dniach.
- `PlanAssignment` - przypisanie planu przez trenera podopiecznemu.
- `WorkoutSession` - szkic albo zakonczony trening.
- `WorkoutSet` - seria cwiczenia w ramach treningu.
- `BodyMeasurement` - pomiar ciala lub wagi.
- `TrainerRelationship` - relacja trener-podopieczny ze statusem `PENDING`, `ACTIVE`, `REJECTED`, `DETACHED`.
- `ReportTemplate`, `ReportTemplateVersion` - szablon raportu i zamrozona wersja szablonu.
- `ReportAssignment` - przypisanie raportu podopiecznemu.
- `ReportSubmission` - odpowiedzi podopiecznego i feedback trenera.
- `RecurringReportRule` - cykliczna reguła raportowania.
- `EloHistory` - historia zmian Elo po finalizacji treningu.
- `IdempotencyKey` - zabezpieczenie finalizacji treningu przed podwojnym naliczeniem.

### 7. Autoryzacja i bezpieczenstwo

- Rejestracja i logowanie zwracaja JWT.
- Chronione endpointy wymagaja naglowka `Authorization: Bearer <token>`.
- Role sa sprawdzane przez `requireRole("TRAINER")` albo `requireRole("TRAINEE")`.
- Dostep do danych innych uzytkownikow wymaga relacji self-or-active-trainer.
- Hasla sa hashowane przez argon2.
- Body, query i params sa walidowane przez Zod przed logika biznesowa.
- Endpoint finalizacji treningu wymaga `Idempotency-Key`, zeby retry nie naliczyl Elo drugi raz.

### 8. Najwazniejsze flow biznesowe

#### Rejestracja i logowanie

1. Klient wywoluje `POST /api/v1/auth/register` albo `POST /api/v1/auth/trainer/register`.
2. API waliduje dane i zgodnosc hasel.
3. Haslo jest hashowane.
4. Tworzony jest `User` i odpowiedni `UserRole`.
5. `POST /api/v1/auth/login` zwraca token JWT.

#### Tworzenie danych treningowych

1. Uzytkownik tworzy silownie przez `POST /api/v1/gyms`.
2. Tworzy grupy miesniowe i cwiczenia przez `/muscle-groups` oraz `/exercises`.
3. Moze utworzyc plan przez `POST /api/v1/plans`.
4. Plan sklada sie z dni i cwiczen z liczba serii, powtorzen i kolejnoscia.

#### Trening i Elo

1. `POST /api/v1/workouts` tworzy draft treningu z seriami.
2. `POST /api/v1/workouts/{workoutId}/finalize` finalizuje trening.
3. Wymagany jest naglowek `Idempotency-Key`.
4. Finalizacja jest transakcyjna.
5. API porownuje wyniki z poprzednimi zakonczonymi treningami w tym samym kontekscie.
6. Tworzone sa wpisy `EloHistory`, a `User.elo` jest aktualizowane.

#### Relacja trener-podopieczny

1. Trener zaprasza podopiecznego przez `POST /api/v1/trainer/relationships`.
2. Podopieczny akceptuje albo odrzuca relacje.
3. Aktywna relacja pozwala trenerowi widziec wybrane dane podopiecznego i przypisywac plany/raporty.
4. Relacja moze byc odpieta przez trenera lub podopiecznego.

#### Raporty

1. Trener tworzy `ReportTemplate` z polami.
2. System tworzy zamrozona wersje `ReportTemplateVersion`.
3. Trener przypisuje raport podopiecznemu.
4. Podopieczny wysyla odpowiedzi.
5. Trener dodaje feedback ogolny i komentarze do pol.
6. Cykliczne raporty sa modelowane przez `RecurringReportRule`.

### 9. Endpointy API

| Metoda | Sciezka | Auth | Opis |
| --- | --- | --- | --- |
| GET | `/health` | Nie | Health check. |
| POST | `/api/v1/auth/register` | Nie | Rejestracja podopiecznego. |
| POST | `/api/v1/auth/trainer/register` | Nie | Rejestracja trenera. |
| POST | `/api/v1/auth/login` | Nie | Logowanie i pobranie JWT. |
| GET | `/api/v1/auth/me` | Tak | Dane zalogowanego uzytkownika. |
| GET | `/api/v1/gyms` | Tak | Lista silowni. |
| POST | `/api/v1/gyms` | Tak | Utworzenie silowni. |
| GET | `/api/v1/gyms/{gymId}` | Tak | Szczegoly silowni. |
| PATCH | `/api/v1/gyms/{gymId}` | Tak | Aktualizacja silowni. |
| DELETE | `/api/v1/gyms/{gymId}` | Tak | Soft delete silowni. |
| GET | `/api/v1/muscle-groups` | Tak | Lista grup miesniowych. |
| POST | `/api/v1/muscle-groups` | Tak | Utworzenie grupy miesniowej. |
| GET | `/api/v1/exercises` | Tak | Lista cwiczen. |
| POST | `/api/v1/exercises` | Tak | Utworzenie cwiczenia. |
| GET | `/api/v1/exercises/{exerciseId}` | Tak | Szczegoly cwiczenia. |
| PATCH | `/api/v1/exercises/{exerciseId}` | Tak | Aktualizacja cwiczenia. |
| DELETE | `/api/v1/exercises/{exerciseId}` | Tak | Usuniecie cwiczenia. |
| POST | `/api/v1/exercises/last-scores` | Tak | Kontekstowe poprzednie wyniki cwiczenia. |
| GET | `/api/v1/plans` | Tak | Lista planow. |
| POST | `/api/v1/plans` | Tak | Utworzenie planu. |
| GET | `/api/v1/plans/active` | Tak | Aktywny plan uzytkownika. |
| POST | `/api/v1/plans/active` | Tak | Ustawienie aktywnego planu. |
| GET | `/api/v1/plans/{planId}` | Tak | Szczegoly planu. |
| PATCH | `/api/v1/plans/{planId}` | Tak | Aktualizacja planu. |
| DELETE | `/api/v1/plans/{planId}` | Tak | Usuniecie planu. |
| POST | `/api/v1/plans/{planId}/copy` | Tak | Skopiowanie planu. |
| POST | `/api/v1/plans/{planId}/assignments` | Trener | Przypisanie planu podopiecznemu. |
| GET | `/api/v1/plans/{planId}/days` | Tak | Lista dni planu. |
| POST | `/api/v1/plans/{planId}/days` | Tak | Utworzenie dnia planu. |
| GET | `/api/v1/plan-days/{planDayId}` | Tak | Szczegoly dnia planu. |
| DELETE | `/api/v1/plan-days/{planDayId}` | Tak | Usuniecie dnia planu. |
| GET | `/api/v1/workouts` | Tak | Historia zakonczonych treningow. |
| POST | `/api/v1/workouts` | Tak | Utworzenie draftu treningu. |
| GET | `/api/v1/workouts/dates` | Tak | Daty treningow. |
| GET | `/api/v1/workouts/{workoutId}` | Tak | Szczegoly treningu. |
| POST | `/api/v1/workouts/{workoutId}/finalize` | Tak | Finalizacja treningu; wymaga `Idempotency-Key`. |
| GET | `/api/v1/measurements` | Tak | Lista pomiarow z filtrami. |
| POST | `/api/v1/measurements` | Tak | Utworzenie pomiaru. |
| POST | `/api/v1/measurements/bulk` | Tak | Utworzenie wielu pomiarow. |
| GET | `/api/v1/measurements/history` | Tak | Historia pomiarow. |
| GET | `/api/v1/measurements/trends` | Tak | Trendy pomiarow. |
| GET | `/api/v1/measurements/{measurementId}` | Tak | Szczegoly pomiaru. |
| POST | `/api/v1/trainer/relationships` | Trener | Zaproszenie podopiecznego. |
| POST | `/api/v1/trainee/relationships/{relationshipId}/accept` | Podopieczny | Akceptacja relacji. |
| POST | `/api/v1/trainee/relationships/{relationshipId}/reject` | Podopieczny | Odrzucenie relacji. |
| POST | `/api/v1/trainee/trainer/detach` | Podopieczny | Odpiecie aktualnego trenera. |
| GET | `/api/v1/trainer/trainees` | Trener | Lista aktywnych podopiecznych. |
| POST | `/api/v1/trainer/trainees/{traineeId}/unlink` | Trener | Odpiecie podopiecznego. |
| GET | `/api/v1/trainer/report-templates` | Trener | Lista szablonow raportow. |
| POST | `/api/v1/trainer/report-templates` | Trener | Utworzenie szablonu raportu. |
| GET | `/api/v1/trainer/report-templates/{templateId}` | Trener | Szczegoly szablonu. |
| PATCH | `/api/v1/trainer/report-templates/{templateId}` | Trener | Aktualizacja szablonu. |
| DELETE | `/api/v1/trainer/report-templates/{templateId}` | Trener | Usuniecie szablonu. |
| POST | `/api/v1/trainer/report-assignments` | Trener | Przypisanie raportu. |
| GET | `/api/v1/trainee/report-assignments` | Podopieczny | Raporty przypisane podopiecznemu. |
| POST | `/api/v1/trainee/report-assignments/{assignmentId}/submissions` | Podopieczny | Wyslanie odpowiedzi raportu. |
| GET | `/api/v1/trainer/report-submissions` | Trener | Lista odpowiedzi raportow. |
| PATCH | `/api/v1/trainer/report-submissions/{submissionId}/feedback` | Trener | Dodanie feedbacku. |
| GET | `/api/v1/trainer/recurring-report-rules` | Trener | Lista cyklicznych regul raportow. |
| POST | `/api/v1/trainer/recurring-report-rules` | Trener | Utworzenie cyklicznej reguly. |
| PATCH | `/api/v1/trainer/recurring-report-rules/{recurringRuleId}` | Trener | Aktualizacja reguly. |
| DELETE | `/api/v1/trainer/recurring-report-rules/{recurringRuleId}` | Trener | Usuniecie reguly. |
| POST | `/api/v1/trainer/recurring-report-rules/{recurringRuleId}/pause` | Trener | Pauza reguly. |
| POST | `/api/v1/trainer/recurring-report-rules/{recurringRuleId}/resume` | Trener | Wznowienie reguly. |
| GET | `/api/v1/ranking` | Tak | Ranking z paginacja. |
| GET | `/api/v1/users/{userId}/elo` | Tak | Elo uzytkownika. |
| GET | `/api/v1/elo/chart` | Tak | Historia Elo do wykresu. |

### 10. Swagger i testowanie endpointow

Swagger UI korzysta z recznej specyfikacji w `src/core/openapi/spec.ts`. Spec zawiera `requestBody`, parametry path/query/header oraz schemat bearer auth, wiec endpointy mozna testowac bezposrednio z `/docs`.

Typowy test w Swaggerze:

1. Wywolaj `POST /api/v1/auth/login` z `name` i `password`.
2. Skopiuj token z odpowiedzi.
3. Kliknij `Authorize`.
4. Wklej token jako bearer token.
5. Testuj chronione endpointy.

---

## English

### 1. System purpose

LGYM Express API is a backend for workouts, training plans, body measurements, trainer-trainee relationships, recurring reports, and Elo ranking. The project is a modular monolith built with Express, TypeScript, Prisma, and PostgreSQL.

### 2. Technology stack

- Runtime: Node.js 22+
- HTTP framework: Express 4
- Language: strict TypeScript
- ORM: Prisma
- Database: PostgreSQL 16+
- Authorization: JWT with Passport
- Input validation: Zod
- Password hashing: argon2
- Documentation: Swagger UI / OpenAPI 3.0
- Tests: Vitest, Supertest, Testcontainers

### 3. Local setup

1. Copy `express-api/.env.example` to `express-api/.env`.
2. Start PostgreSQL: `docker compose up -d db`.
3. Install dependencies: `npm install`.
4. Generate Prisma Client: `npm run prisma:generate`.
5. Run migrations: `npm run prisma:migrate`.
6. Seed sample data: `npm run prisma:seed`.
7. Build and start the API: `npm run build && npm start`.

Helpful URLs:

- Health check: `GET http://localhost:3000/health`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

Seeded accounts:

- trainer: `trainer@example.com`, username `seed-trainer`, password `password123`
- trainee: `trainee@example.com`, username `seed-trainee`, password `password123`

### 4. Environment configuration

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Prisma connection string for the main PostgreSQL database. |
| `TEST_DATABASE_URL` | Connection string for the test database. |
| `JWT_SECRET` | Secret used to sign JWT tokens; must be at least 16 characters. |
| `PORT` | HTTP API port, default `3000`. |
| `NODE_ENV` | `development`, `test`, or `production`. |
| `CORS_ORIGINS` | Comma-separated list of allowed origins or `*`. |

### 5. Architecture

The project follows a modular-monolith structure:

- `src/app.ts` composes the Express app, middleware, Swagger UI, and routers.
- `src/server.ts` starts the HTTP server.
- `src/config` handles environment configuration.
- `src/core` contains shared mechanisms: auth, access control, Prisma, errors, validation, OpenAPI.
- `src/modules/*` contains business domains: auth, users, gyms, exercises, plans, workouts, measurements, trainer, reports.
- `prisma/schema.prisma` defines the data model.
- `prisma/migrations` stores database migrations.
- `prisma/seed.ts` creates initial data.
- `tests` contains acceptance tests.

Standard request flow:

1. Express receives the request.
2. CORS, Helmet, JSON parser, and rate-limit middleware run globally or per route.
3. Protected endpoints use `requireAuth` to verify the JWT.
4. `validate` checks `body`, `params`, and `query` with Zod.
5. The router forwards the request to a service.
6. The service applies business rules, roles, and access control.
7. The repository performs Prisma/PostgreSQL operations.
8. Central error middleware returns a consistent HTTP error envelope.

### 6. Database and models

The main database is PostgreSQL. Prisma uses `DATABASE_URL`. Business IDs are UUIDs. Critical relations use cascade delete or `Restrict`/`SetNull`, depending on whether historical data must be preserved.

Main models:

- `User` - user account with `name`, `email`, `passwordHash`, ranking visibility, and current Elo.
- `UserRole` - `TRAINEE` and `TRAINER` roles; one user may have multiple roles.
- `Gym` - user gym; uses soft delete through `deletedAt` to preserve workout history.
- `MuscleGroup` - user-owned muscle group.
- `Exercise` - exercise linked to a muscle group and Elo formula.
- `Plan`, `PlanDay`, `PlanExercise` - training plan, plan days, and exercises inside days.
- `PlanAssignment` - trainer plan assignment to a trainee.
- `WorkoutSession` - draft or finalized workout.
- `WorkoutSet` - exercise set within a workout.
- `BodyMeasurement` - body or weight measurement.
- `TrainerRelationship` - trainer-trainee relationship with `PENDING`, `ACTIVE`, `REJECTED`, `DETACHED` status.
- `ReportTemplate`, `ReportTemplateVersion` - report template and frozen template version.
- `ReportAssignment` - report assigned to a trainee.
- `ReportSubmission` - trainee answers and trainer feedback.
- `RecurringReportRule` - recurring reporting rule.
- `EloHistory` - Elo change history after workout finalization.
- `IdempotencyKey` - protects workout finalization from duplicate scoring.

### 7. Authorization and security

- Registration and login return JWT tokens.
- Protected endpoints require `Authorization: Bearer <token>`.
- Roles are enforced with `requireRole("TRAINER")` or `requireRole("TRAINEE")`.
- Cross-user access requires self-or-active-trainer relationship checks.
- Passwords are hashed with argon2.
- Body, query, and params are validated with Zod before business logic runs.
- Workout finalization requires `Idempotency-Key` so retries do not double-count Elo.

### 8. Key business flows

#### Registration and login

1. The client calls `POST /api/v1/auth/register` or `POST /api/v1/auth/trainer/register`.
2. The API validates fields and password confirmation.
3. The password is hashed.
4. A `User` and matching `UserRole` are created.
5. `POST /api/v1/auth/login` returns a JWT token.

#### Training data setup

1. The user creates a gym through `POST /api/v1/gyms`.
2. The user creates muscle groups and exercises through `/muscle-groups` and `/exercises`.
3. The user may create a plan through `POST /api/v1/plans`.
4. A plan consists of days and exercises with set counts, target reps, and ordering.

#### Workout and Elo

1. `POST /api/v1/workouts` creates a workout draft with sets.
2. `POST /api/v1/workouts/{workoutId}/finalize` finalizes the workout.
3. The `Idempotency-Key` header is required.
4. Finalization runs in a transaction.
5. The API compares results against previous finalized workouts in the same context.
6. `EloHistory` rows are created and `User.elo` is updated.

#### Trainer-trainee relationship

1. A trainer invites a trainee with `POST /api/v1/trainer/relationships`.
2. The trainee accepts or rejects the relationship.
3. An active relationship lets the trainer view selected trainee data and assign plans/reports.
4. The relationship can be detached by either side.

#### Reports

1. A trainer creates a `ReportTemplate` with fields.
2. The system creates a frozen `ReportTemplateVersion`.
3. The trainer assigns a report to a trainee.
4. The trainee submits answers.
5. The trainer adds overall and per-field feedback.
6. Recurring reports are represented by `RecurringReportRule`.

### 9. API endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | Health check. |
| POST | `/api/v1/auth/register` | No | Register trainee. |
| POST | `/api/v1/auth/trainer/register` | No | Register trainer. |
| POST | `/api/v1/auth/login` | No | Login and obtain JWT. |
| GET | `/api/v1/auth/me` | Yes | Get authenticated user. |
| GET | `/api/v1/gyms` | Yes | List gyms. |
| POST | `/api/v1/gyms` | Yes | Create gym. |
| GET | `/api/v1/gyms/{gymId}` | Yes | Get gym details. |
| PATCH | `/api/v1/gyms/{gymId}` | Yes | Update gym. |
| DELETE | `/api/v1/gyms/{gymId}` | Yes | Soft-delete gym. |
| GET | `/api/v1/muscle-groups` | Yes | List muscle groups. |
| POST | `/api/v1/muscle-groups` | Yes | Create muscle group. |
| GET | `/api/v1/exercises` | Yes | List exercises. |
| POST | `/api/v1/exercises` | Yes | Create exercise. |
| GET | `/api/v1/exercises/{exerciseId}` | Yes | Get exercise details. |
| PATCH | `/api/v1/exercises/{exerciseId}` | Yes | Update exercise. |
| DELETE | `/api/v1/exercises/{exerciseId}` | Yes | Delete exercise. |
| POST | `/api/v1/exercises/last-scores` | Yes | Contextual previous exercise scores. |
| GET | `/api/v1/plans` | Yes | List plans. |
| POST | `/api/v1/plans` | Yes | Create plan. |
| GET | `/api/v1/plans/active` | Yes | Get user's active plan. |
| POST | `/api/v1/plans/active` | Yes | Set active plan. |
| GET | `/api/v1/plans/{planId}` | Yes | Get plan details. |
| PATCH | `/api/v1/plans/{planId}` | Yes | Update plan. |
| DELETE | `/api/v1/plans/{planId}` | Yes | Delete plan. |
| POST | `/api/v1/plans/{planId}/copy` | Yes | Copy plan. |
| POST | `/api/v1/plans/{planId}/assignments` | Trainer | Assign plan to trainee. |
| GET | `/api/v1/plans/{planId}/days` | Yes | List plan days. |
| POST | `/api/v1/plans/{planId}/days` | Yes | Create plan day. |
| GET | `/api/v1/plan-days/{planDayId}` | Yes | Get plan day details. |
| DELETE | `/api/v1/plan-days/{planDayId}` | Yes | Delete plan day. |
| GET | `/api/v1/workouts` | Yes | List finalized workout history. |
| POST | `/api/v1/workouts` | Yes | Create workout draft. |
| GET | `/api/v1/workouts/dates` | Yes | List workout dates. |
| GET | `/api/v1/workouts/{workoutId}` | Yes | Get workout details. |
| POST | `/api/v1/workouts/{workoutId}/finalize` | Yes | Finalize workout; requires `Idempotency-Key`. |
| GET | `/api/v1/measurements` | Yes | List measurements with filters. |
| POST | `/api/v1/measurements` | Yes | Create measurement. |
| POST | `/api/v1/measurements/bulk` | Yes | Create multiple measurements. |
| GET | `/api/v1/measurements/history` | Yes | Measurement history. |
| GET | `/api/v1/measurements/trends` | Yes | Measurement trends. |
| GET | `/api/v1/measurements/{measurementId}` | Yes | Measurement details. |
| POST | `/api/v1/trainer/relationships` | Trainer | Invite trainee. |
| POST | `/api/v1/trainee/relationships/{relationshipId}/accept` | Trainee | Accept relationship. |
| POST | `/api/v1/trainee/relationships/{relationshipId}/reject` | Trainee | Reject relationship. |
| POST | `/api/v1/trainee/trainer/detach` | Trainee | Detach current trainer. |
| GET | `/api/v1/trainer/trainees` | Trainer | List active trainees. |
| POST | `/api/v1/trainer/trainees/{traineeId}/unlink` | Trainer | Unlink trainee. |
| GET | `/api/v1/trainer/report-templates` | Trainer | List report templates. |
| POST | `/api/v1/trainer/report-templates` | Trainer | Create report template. |
| GET | `/api/v1/trainer/report-templates/{templateId}` | Trainer | Get template details. |
| PATCH | `/api/v1/trainer/report-templates/{templateId}` | Trainer | Update template. |
| DELETE | `/api/v1/trainer/report-templates/{templateId}` | Trainer | Delete template. |
| POST | `/api/v1/trainer/report-assignments` | Trainer | Assign report. |
| GET | `/api/v1/trainee/report-assignments` | Trainee | List assigned trainee reports. |
| POST | `/api/v1/trainee/report-assignments/{assignmentId}/submissions` | Trainee | Submit report answers. |
| GET | `/api/v1/trainer/report-submissions` | Trainer | List report submissions. |
| PATCH | `/api/v1/trainer/report-submissions/{submissionId}/feedback` | Trainer | Add feedback. |
| GET | `/api/v1/trainer/recurring-report-rules` | Trainer | List recurring report rules. |
| POST | `/api/v1/trainer/recurring-report-rules` | Trainer | Create recurring rule. |
| PATCH | `/api/v1/trainer/recurring-report-rules/{recurringRuleId}` | Trainer | Update rule. |
| DELETE | `/api/v1/trainer/recurring-report-rules/{recurringRuleId}` | Trainer | Delete rule. |
| POST | `/api/v1/trainer/recurring-report-rules/{recurringRuleId}/pause` | Trainer | Pause rule. |
| POST | `/api/v1/trainer/recurring-report-rules/{recurringRuleId}/resume` | Trainer | Resume rule. |
| GET | `/api/v1/ranking` | Yes | Paginated ranking. |
| GET | `/api/v1/users/{userId}/elo` | Yes | User Elo. |
| GET | `/api/v1/elo/chart` | Yes | Elo chart history. |

### 10. Swagger and endpoint testing

Swagger UI uses the static spec in `src/core/openapi/spec.ts`. The spec includes `requestBody`, path/query/header parameters, and bearer auth, so endpoints can be tested directly from `/docs`.

Typical Swagger test flow:

1. Call `POST /api/v1/auth/login` with `name` and `password`.
2. Copy the token from the response.
3. Click `Authorize`.
4. Paste the token as a bearer token.
5. Test protected endpoints.
