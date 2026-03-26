# Sprint 1 - MVP publication & inscription - Execution Tracker

- Sprint: `S1`
- Source: `docs/sprints/sprint_1_mvp_event_publication_registration.md`
- Last updated: `2026-03-26T21:27:06.589Z`

## Summary

- TODO: `0`
- IN_PROGRESS: `0`
- PARTIAL: `0`
- DONE: `7`
- BLOCKED: `0`

## Tasks

| ID | Status | Priority | Refs | Task | Last update |
| --- | --- | --- | --- | --- | --- |
| S1-T01 | DONE | P0 | S1-M01, I02.3 | Replace in-memory auth/session/reset stores with Postgres-backed repositories. | 2026-03-08T13:30:00Z |
| S1-T02 | DONE | P0 | S1-M02, S1-M04, I04.2 | Add gateway proxies + ACL matrix for next Sprint 1 routes (/api/events/*, /api/registrations/*). | 2026-03-08T20:31:42.203Z |
| S1-T03 | DONE | P1 | S1-M01, M01.2, M02.3 | Add docker-compose and CI job to run test:s1-m01 automatically. | 2026-03-26T21:27:06.588Z |
| S1-T04 | DONE | P1 | S1-M06, M02.2, M02.3 | S1-M06 hardening on current services: structured logs + guaranteed x-correlation-id tracing on every auth path (Gateway + Identity), plus smoke assertions. | 2026-03-26T21:16:40.354Z |
| S1-T05 | DONE | P0 | S1-M02, E02.2, E02.3, I04.2 | S1-M02 implementation start: scaffold event-management-service with Postgres and implement POST/GET/PATCH/DELETE /api/events/drafts* + ownership rules. | 2026-03-08T13:26:25.287Z |
| S1-T06 | DONE | P0 | S1-M02, I04.2 | Wire Gateway routes for events and extend role guards (ORGANIZER, ADMIN) with the same contract style as S1-M01. | 2026-03-08T22:16:43.669Z |
| S1-T07 | DONE | P1 | S1-M07, I05.2 | Implement auth security audit events for login, reset, forgot-password, and lockout denials in identity-access-service. | 2026-03-26T21:24:33.658Z |

## Latest Notes

- `S1-T01` `DONE` (2026-03-08T13:30:00Z): Identity auth/session/reset persistence migrated to Postgres with schema + repository + smoke validation.
- `S1-T02` `DONE` (2026-03-08T20:31:42.204Z): Introduced explicit gateway ACL/proxy route matrix for /api/events/*, /api/registrations/*, and /api/profile/participations via routing module; added and passed unit tests in tests/s1-t02.gateway-acl-matrix.unit.test.js.
- `S1-T03` `DONE` (2026-03-26T21:27:06.589Z): Adjusted the S1-M01 smoke test to wait on api-gateway /health instead of /ready because /ready now depends on event-management and registration upstreams; verified corepack pnpm test:s1-m01 passes with docker-compose.s1-m01.yml external Postgres.
- `S1-T04` `DONE` (2026-03-09T00:45:47.781Z): Refactored observability into testable middleware modules, enforced correlation-id middleware and structured auth-path completion logging for Gateway + Identity, and added passing unit coverage in tests/s1-t04.observability.unit.test.js; smoke assertions for x-correlation-id remain in tests/s1-m01.smoke.test.js.
- `S1-T05` `DONE` (2026-03-08T13:26:25.288Z): Implemented event-management-service draft CRUD with Postgres, ownership guards, and passing S1-T05 smoke + S1-M01 regression.
- `S1-T06` `DONE` (2026-03-08T22:16:43.670Z): Gateway event routes are fully wired with organizer/admin guards in shared routing matrix; exact target-path contracts and ACL expectations are covered by passing unit tests (tests/s1-t02.gateway-acl-matrix.unit.test.js).
- `S1-T07` `DONE` (2026-03-26T21:24:33.658Z): Implemented persistent auth security audit events in identity-access-service for login success/failure, forgot/reset flows, and lockout denials; verified with npm run test:s1-t07 plus S1_M01_USE_EXTERNAL_POSTGRES=true regression smoke.

