# Goal 10 — MCP Server

## Goal

Expose Keyset through MCP without duplicating product logic.

## Tools

- `inspect_project`
- `list_providers`
- `plan_provider_setup`
- `setup_provider`
- `doctor`
- `verify_provider`

## Requirements

- Call Core APIs only.
- No provider business logic inside MCP handlers.
- Strict schemas for all inputs.
- Project path validation.
- Structured errors.
- Mutating tools clearly identified.
- Never expose raw secrets in tool responses.
- Do not expose a generic arbitrary shell-execution tool.

## Transport

Implement the simplest officially supported local transport first. Keep transport-specific code isolated for future remote HTTP support.

## Tests

Test tool schemas, secret redaction, invalid paths, and Core delegation.
