# Goal 11 — Agent Skills

## Goal

Provide optional skills/instructions for coding agents without putting product logic into those skills.

## Deliver

- Codex skill
- Claude Code skill
- generic agent instructions

## Behavior

Agent should:

1. Inspect the repository before changing code.
2. Prefer Keyset `plan_provider_setup` before mutation.
3. Use `setup_provider` for provider provisioning.
4. Never request that secrets be pasted into chat if a supported secure import path exists.
5. Apply only project changes required by the selected auth adapter.
6. Run `verify_provider` after setup.
7. Report manual provider actions distinctly.

## Constraint

Skills must remain small. They orchestrate Keyset; they do not reimplement Keyset.
