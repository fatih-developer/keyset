# Goal 07 — Setup Engine

## Goal

Connect project inspection, auth adapters, provider adapters, and environment persistence into one idempotent setup workflow.

## Workflow

1. Inspect project.
2. Resolve auth adapter.
3. Resolve provider.
4. Calculate URLs.
5. Build plan.
6. Separate automatic and manual actions.
7. Execute safe automatic actions.
8. Persist credentials securely when supplied.
9. Apply auth-adapter changes.
10. Verify.

## Requirements

- `dry-run` mode performs no mutations.
- Re-running setup should reuse compatible state.
- Manual action must pause only the relevant operation, not destroy prior safe progress.
- Produce a machine-readable setup result.
- Keep a non-secret project state file under `.keyset/` when useful.

## Tests

Add end-to-end fixture tests with fake provider transport and both Better Auth/Auth.js projects.
