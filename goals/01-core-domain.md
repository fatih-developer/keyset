# Goal 01 — Core Domain and Contracts

Read `docs/PRD.md` and `docs/ARCHITECTURE.md`.

## Goal

Implement the normalized domain model and core service contracts without provider-specific provisioning.

## Implement

- Project model
- Environment model
- Auth adapter model
- Provider metadata and capability model
- Setup plan model
- Typed operation model
- Doctor finding model
- Verification result model
- Config schema with versioning
- Secret-safe value/redaction utilities
- Core service interfaces for:
  - inspect
  - plan
  - setup
  - doctor
  - verify

Provider capability values:

- `full_automation`
- `partial_automation`
- `guided_setup`

Ensure secrets cannot accidentally serialize through normal result DTOs.

## Tests

Add focused unit tests for schema validation, redaction, capability handling, and result serialization.

## Constraints

Core must import nothing from CLI, MCP, Codex, Claude, Cursor, or agent-specific code.
