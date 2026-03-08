# Repository Agent Rules

## Sprint Progress Tracking

- For every implementation request related to Sprint 1:
  - move the matching tracker item to `IN_PROGRESS` before edits
  - move it to `DONE`, `PARTIAL`, or `BLOCKED` after verification
  - re-render `docs/sprints/sprint_1_execution_tracker.md`
- Use:
  - `node tools/progress-tracker.mjs auto-start --prompt "<user prompt>"`
  - `node tools/progress-tracker.mjs auto-complete --prompt "<user prompt>" --result <DONE|PARTIAL|BLOCKED|TODO> --note "..."`
  - `node tools/progress-tracker.mjs render`
- If prompt matching fails, update explicitly with:
  - `node tools/progress-tracker.mjs set --id <TASK_ID> --status <STATUS> --note "..."`

