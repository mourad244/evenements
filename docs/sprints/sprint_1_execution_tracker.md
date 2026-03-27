# Sprint 1 - MVP publication & inscription - Execution Tracker

- Sprint: `S1`
- Source: `docs/sprints/sprint_1_mvp_event_publication_registration.md`
- Last updated: `2026-03-25T15:43:46.280Z`

## Summary

- TODO: `0`
- IN_PROGRESS: `0`
- PARTIAL: `0`
- DONE: `6`
- BLOCKED: `0`

## Tasks

| ID | Status | Priority | Refs | Task | Last update |
| --- | --- | --- | --- | --- | --- |
| S1-T01 | DONE | P0 | S1-M01, I02.3 | Replace in-memory auth/session/reset stores with Postgres-backed repositories. | 2026-03-08T13:30:00Z |
| S1-T02 | DONE | P0 | S1-M02, S1-M04, I04.2 | Add gateway proxies + ACL matrix for next Sprint 1 routes (/api/events/*, /api/registrations/*). | 2026-03-08T20:31:42.203Z |
| S1-T03 | DONE | P1 | S1-M01, M01.2, M02.3 | Add docker-compose and CI job to run test:s1-m01 automatically. | 2026-03-08T22:19:37.517Z |
| S1-T04 | DONE | P1 | S1-M06, M02.2, M02.3 | S1-M06 hardening on current services: structured logs + guaranteed x-correlation-id tracing on every auth path (Gateway + Identity), plus smoke assertions. | 2026-03-25T15:43:46.278Z |
| S1-T05 | DONE | P0 | S1-M02, E02.2, E02.3, I04.2 | S1-M02 implementation start: scaffold event-management-service with Postgres and implement POST/GET/PATCH/DELETE /api/events/drafts* + ownership rules. | 2026-03-08T13:26:25.287Z |
| S1-T06 | DONE | P0 | S1-M02, I04.2 | Wire Gateway routes for events and extend role guards (ORGANIZER, ADMIN) with the same contract style as S1-M01. | 2026-03-08T22:16:43.669Z |

## Latest Notes

- `S1-T01` `DONE` (2026-03-08T13:30:00Z): Identity auth/session/reset persistence migrated to Postgres with schema + repository + smoke validation.
- `S1-T02` `DONE` (2026-03-08T20:31:42.204Z): Introduced explicit gateway ACL/proxy route matrix for /api/events/*, /api/registrations/*, and /api/profile/participations via routing module; added and passed unit tests in tests/s1-t02.gateway-acl-matrix.unit.test.js.
- `S1-T03` `DONE` (2026-03-08T22:19:37.518Z): S1-M01 automation is in place: dedicated docker-compose Postgres stack and CI workflow running pnpm test:s1-m01 automatically on PR/push with deterministic setup/teardown.
- `S1-T04` `DONE` (2026-03-25T15:43:46.280Z): Added password reset email transport
- `S1-T05` `DONE` (2026-03-08T13:26:25.288Z): Implemented event-management-service draft CRUD with Postgres, ownership guards, and passing S1-T05 smoke + S1-M01 regression.
- `S1-T06` `DONE` (2026-03-08T22:16:43.670Z): Gateway event routes are fully wired with organizer/admin guards in shared routing matrix; exact target-path contracts and ACL expectations are covered by passing unit tests (tests/s1-t02.gateway-acl-matrix.unit.test.js).

