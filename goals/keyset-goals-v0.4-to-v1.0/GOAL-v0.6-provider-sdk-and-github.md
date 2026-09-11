# Goal: Keyset v0.6 — Provider SDK Stabilization + GitHub OAuth

## Objective
Prove that Keyset is provider-independent rather than Google-specific.

Stabilize the Provider SDK and implement GitHub OAuth as the second real provider without duplicating orchestration logic.

## Core Requirement
Existing Google behavior must use the same provider abstraction that GitHub uses. If adding GitHub requires provider-specific branching throughout Core, refactor only the minimum necessary abstraction.

## Scope
Implement:
- Provider SDK v1 candidate
- capability model
- provider metadata
- setup planning contract
- credential import contract
- semantic verification contract
- runtime verification hooks
- GitHub OAuth provider
- Better Auth GitHub mutation
- Auth.js GitHub mutation
- CLI provider selection
- MCP provider selection
- provider conformance tests
- documentation

## Provider Capability Model
Represent differences explicitly.

Example:
```ts
{
  guidedProvisioning: true,
  credentialImport: true,
  redirectUris: true,
  authorizedOrigins: false,
  runtimeAuthorizationInspection: true
}
```

Do not force Google-specific concepts onto all providers.

## Provider SDK
Stabilize contracts for:
- provider identity
- setup planner
- credential schema/importer
- environment requirements
- redirect/callback planning
- static verification
- semantic verification
- runtime authorization inspection
- remediation diagnostics

Core owns orchestration and transactions; providers own provider-specific knowledge.

## Conformance Suite
Every provider must prove:
- no raw secret leakage
- deterministic setup plan
- valid credential parsing
- invalid credential rejection
- idempotent repeated setup
- safe doctor output
- safe verify output
- dry-run support through Core

Google must pass the same suite as GitHub wherever capabilities overlap.

## GitHub OAuth Guided Setup
Implement GitHub OAuth App guided setup. Calculate and present application name suggestion, homepage URL and authorization callback URL. Do not implement browser automation.

## Credential Import
Support client ID, client secret, non-interactive flags and environment inputs where already supported. Never print the GitHub client secret.

## Better Auth Adapter
Add GitHub provider mutation while preserving Google and existing providers. Support Google-only, GitHub-only and Google+GitHub configurations idempotently.

## Auth.js Adapter
Add GitHub provider import/configuration while preserving existing providers and avoiding duplicate imports/entries.

## CLI
Support:
```bash
keyset setup github
keyset doctor github
keyset verify github
keyset verify github --runtime
keyset providers
```

`keyset providers` should expose capabilities and support status.

## MCP
All provider-aware MCP tools must accept GitHub through the same generic contract. Avoid GitHub-specific MCP tool names unless necessary.

## Runtime Verification
Where feasible, validate the actual GitHub authorization redirect without completing authentication. Redact state and other sensitive query values.

## Tests
Add:
- Provider SDK contract tests
- Google conformance regression tests
- GitHub credential tests
- GitHub setup-plan tests
- Better Auth Google+GitHub tests
- Auth.js Google+GitHub tests
- GitHub runtime redirect tests
- CLI GitHub smoke tests
- MCP GitHub smoke tests
- cross-provider idempotency tests

All earlier Google tests must remain green.

## Documentation
Update:
- README.md
- docs/PROVIDERS.md
- docs/SDK.md
- docs/ARCHITECTURE.md
- CHANGELOG.md

SDK docs must be sufficient for a contributor to start a provider package without reading Core internals.

## Definition of Done
Keyset supports both:
```bash
keyset setup google
keyset setup github
```

through the same Core orchestration and Provider SDK.

A project can safely configure both providers. Conformance tests must demonstrate that Google is not a hardcoded special case in Core.

## Non-Goals
Do not add Microsoft, Apple, Discord, Clerk, Supabase, Firebase, hosted services or billing.

## Final Report
Return:
- Provider SDK surface stabilized
- Google/GitHub capability differences
- supported framework combinations
- conformance results
- exact recommended v0.7 milestone
