---
name: event-microservices-e2e
description: Plan, specify, or implement an end-to-end feature across the event platform microservices. Use when translating the event-management cahier des charges into service boundaries, API contracts, async events, backlog slices, frontend flows, or delivery-ready technical tasks for Identity, Event Management, Catalog, Registration, Ticketing, Notification, Admin, Media, or Payment.
---

# Event Microservices E2E

## Collect Inputs

Confirm or infer before editing:

- target phase: `P1`, `P2`, `P3`, or `P4`
- primary actor: participant, organizer, or admin
- user flow to support
- owning service and dependent services
- sync vs async boundaries
- main entities and statuses
- roles / permissions
- audit, notification, and observability needs

## Execute Workflow

### 1) Align with project scope

Read only the relevant sections from:

- `references/service_map.md`
- `references/delivery_workflow.md`
- `docs/mvp_scope.md` when the repo contains project docs

Reject solutions that collapse multiple domains into one service without a
clear reason.

### 2) Choose service ownership first

- Identify the source-of-truth service for the business rule.
- Keep reads/write ownership explicit.
- Prefer async events for derived work such as ticket generation,
  notifications, reminder scheduling, and audit trails.

### 3) Specify contracts before implementation

For the selected flow, define:

- REST endpoints and response shapes
- async events and payloads
- state transitions
- permissions and actor visibility
- failure/retry behavior

### 4) Wire backend and frontend coherently

- Backend: keep ownership, validation, idempotence, and audit clear.
- Frontend: map the flow to the right surface:
  public portal, participant area, organizer back-office, or admin console.
- Keep role guards and status labels consistent with backend contracts.

### 5) Update project documentation

When docs exist in the repo, keep these aligned:

- `docs/mvp_scope.md`
- domain backlog in `docs/backlogs/`
- target sprint in `docs/sprints/`
- release/deployment notes if the change is delivered

## Done Criteria

Finish only when all are true:

- service ownership is clear
- sync/async boundaries are defensible
- statuses and permissions are explicit
- audit and observability impacts are covered
- repo docs are updated when requested or impacted

## References

- `references/service_map.md`
- `references/delivery_workflow.md`

Load only the relevant sections:

- Service decomposition and ownership: search `Service map`
- Status and event design: search `State ownership` and `Async events`
- Delivery sequence and doc sync: search `Implementation sequence` and
  `Documentation sync`
