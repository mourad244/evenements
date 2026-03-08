---
name: sprint-progress-sync
description: Track and auto-update sprint execution status in this repo when implementing tasks. Use for any Sprint 1 implementation request to move task states across TODO, IN_PROGRESS, PARTIAL, DONE, BLOCKED and keep tracker docs synchronized.
---

# Sprint Progress Sync

Use this skill for implementation requests that should update task
progress automatically.

## Source of truth

- Tracker JSON: `.codex/progress/sprint_1_tracker.json`
- Update script: `tools/progress-tracker.mjs`
- Rendered dashboard: `docs/sprints/sprint_1_execution_tracker.md`

## Required workflow

1. Before coding, set task to `IN_PROGRESS`:
   - `node tools/progress-tracker.mjs auto-start --prompt "<raw user prompt>"`
   - If prompt matching fails, update by explicit id:
     - `node tools/progress-tracker.mjs set --id S1-Txx --status IN_PROGRESS --note "..."`
2. Implement and verify.
3. After verification, set final status:
   - `DONE` if acceptance is complete.
   - `PARTIAL` if only a subset was delivered.
   - `BLOCKED` if an external blocker prevented delivery.
4. Render tracker markdown:
   - `node tools/progress-tracker.mjs render`
5. In the final response, include:
   - task id
   - new status
   - what remains (if not `DONE`)

## Status policy

- `TODO`: not started
- `IN_PROGRESS`: active work in current turn
- `PARTIAL`: some deliverables done, some still open
- `DONE`: acceptance complete and verified
- `BLOCKED`: cannot proceed without external dependency/decision

## Matching policy

- `auto-start` and `auto-complete` match tasks from prompt text using
  title + aliases + refs.
- If ambiguous or unmatched, use `set --id` explicitly.

