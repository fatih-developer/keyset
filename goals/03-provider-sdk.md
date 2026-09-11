# Goal 03 — Provider SDK

## Goal

Create the provider plugin contract used by Google and future providers.

## Contract must support

- provider identity and display metadata
- capability declaration
- prerequisite checks
- setup planning
- typed execution operations
- credential import schema
- validation
- guided/manual action representation
- optional rollback metadata

## Security

- No arbitrary shell-command string contract.
- Credentials must use secret wrapper/reference types.
- Public result objects must be redactable by construction.

## Developer Experience

Create a minimal example fake provider used only by tests to demonstrate plugin implementation.

Document how a third-party provider package would implement the SDK.
