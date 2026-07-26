# ADR: One active trainer per trainee

## Status

Accepted for MVP.

## Decision

One trainee can have at most one active trainer. A trainer can have many active trainees. Multiple pending invitations are allowed, but accepting a conflicting invitation returns `409 ACTIVE_TRAINER_CONFLICT`.

## Enforcement

- Application transaction checks for another active relationship before activation.
- PostgreSQL partial unique index enforces `UNIQUE (traineeId) WHERE status = 'ACTIVE'`.

## Rationale

This keeps authorization simple and defensible for an engineering thesis demonstrator while still supporting realistic coach workflows.
