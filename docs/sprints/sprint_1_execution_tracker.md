---
title: Sprint 1 - Execution tracker
description: Tableau d'avancement machine et humain du Sprint 1.
docKind: sprint
domain: delivery
phase: P1
owner: Mourad
status: IN_PROGRESS
priority: P0
tags:
  - sprint-1
  - tracker
  - execution
slug: sprint-1-tracker
---

# Sprint 1 - MVP publication & inscription - Execution Tracker

- Sprint: `S1`
- Source: `docs/sprints/sprint_1_mvp_event_publication_registration.md`
- Last updated: `2026-03-14T01:46:03.773Z`

## Summary

- TODO: `1`
- IN_PROGRESS: `0`
- PARTIAL: `1`
- DONE: `4`
- BLOCKED: `0`

## Tasks

| ID | Status | Priority | Refs | Task | Last update |
| --- | --- | --- | --- | --- | --- |
| S1-T01 | DONE | P0 | S1-M01, I02.3 | Replace in-memory auth/session/reset stores with Postgres-backed repositories. | 2026-03-08T13:30:00Z |
| S1-T02 | DONE | P0 | S1-M02, S1-M04, I04.2 | Add gateway proxies + ACL matrix for next Sprint 1 routes (/api/events/*, /api/registrations/*). | 2026-03-14T01:46:03.764Z |
| S1-T03 | TODO | P1 | S1-M01, M01.2, M02.3 | Add docker-compose and CI job to run test:s1-m01 automatically. | 2026-03-08T13:30:00Z |
| S1-T04 | PARTIAL | P1 | S1-M06, M02.2, M02.3 | S1-M06 hardening on current services: structured logs + guaranteed x-correlation-id tracing on every auth path (Gateway + Identity), plus smoke assertions. | 2026-03-08T13:30:00Z |
| S1-T05 | DONE | P0 | S1-M02, E02.2, E02.3, I04.2 | S1-M02 implementation start: scaffold event-management-service with Postgres and implement POST/GET/PATCH/DELETE /api/events/drafts* + ownership rules. | 2026-03-08T13:26:25.287Z |
| S1-T06 | DONE | P0 | S1-M02, I04.2 | Wire Gateway routes for events and extend role guards (ORGANIZER, ADMIN) with the same contract style as S1-M01. | 2026-03-14T01:46:03.772Z |

## Latest Notes

- `S1-T01` `DONE` (2026-03-08T13:30:00Z): Identity auth/session/reset persistence migrated to Postgres with schema + repository + smoke validation.
- `S1-T02` `DONE` (2026-03-14T01:46:03.764Z): Gateway now proxies /api/events/*, /api/registrations/* and /api/profile/participations with documented ACLs; smoke covers organizer event draft flow and participant registration facade routing.
- `S1-T04` `PARTIAL` (2026-03-08T13:30:00Z): Gateway propagates x-correlation-id and smoke validates one auth flow; structured log format is not implemented yet.
- `S1-T05` `DONE` (2026-03-08T13:26:25.288Z): Implemented event-management-service draft CRUD with Postgres, ownership guards, and passing S1-T05 smoke + S1-M01 regression.
- `S1-T06` `DONE` (2026-03-14T01:46:03.773Z): Gateway event routes are wired to event-management-service with ORGANIZER/ADMIN guards and passing end-to-end smoke coverage.
