# Delivery workflow - Event platform feature slicing

## Implementation sequence

1. Read the requirement and map it to a phase (`P1` to `P4`).
2. Identify the primary actor and the business outcome.
3. Pick the source-of-truth service for the rule.
4. List dependent services and decide sync vs async boundaries.
5. Define:
   - API endpoints
   - domain events
   - states and transitions
   - permissions
   - audit and notification side effects
6. Split the work into:
   - backend tasks
   - frontend tasks
   - ops/observability tasks
   - documentation tasks
7. Validate the flow against acceptance criteria.

## Documentation sync

When the repo contains project docs, keep these files aligned:

- `docs/mvp_scope.md`
- the matching file in `docs/backlogs/`
- the target file in `docs/sprints/`
- `docs/task_history.md` for significant delivery
- release/deployment notes when relevant

## Validation checklist

- Is there one clear owner for the business rule?
- Are retries/idempotence needed?
- Are role checks explicit?
- Is the user-facing status vocabulary stable and shared?
- Are async consumers safe to replay?
- Can operators trace a failure end to end?
