# Goal 08 — CLI

## Goal

Build the user-facing CLI around Core.

## Commands

- `keyset init`
- `keyset inspect`
- `keyset setup google`
- `keyset doctor`
- `keyset verify [provider]`
- `keyset providers`
- `keyset config`

## Options

- `--json`
- `--dry-run`
- `--yes`
- `--verbose`
- `--project <path>`

## UX

- Default output concise.
- Secrets always redacted.
- Manual provider action shown clearly.
- JSON mode must be stable enough for automation.
- Meaningful process exit codes.

## Validation

Test CLI commands against fixture repositories and validate exit codes.
