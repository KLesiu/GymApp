# ADR: Recurring report materialization

## Status

Accepted for MVP direction.

## Decision

Recurring report rules are materialized in the PostgreSQL-backed API process. No external event bus, queue, Firebase, or push integration is used.

## Rationale

The demonstrator prioritizes deterministic behavior, inspectable data, and low operational complexity. PostgreSQL uniqueness and transactions are the source of truth for duplicate prevention.

## Current implementation note

The current code supports recurring rule CRUD/pause/resume. Full deterministic scheduled assignment materialization remains documented as a known extension area in the thesis compliance matrix.
