# Goal 13 — OAuth Automation Platform

## Objective

Evolve Keyset into a focused automation system that installs, configures,
verifies, and maintains OAuth integrations for web applications. The product
must remain OAuth-only: general cloud provisioning, databases, deployment,
email, billing, and unrelated API-key workflows are out of scope.

## Product Outcome

A developer can run one command or ask an MCP-compatible agent to configure an
OAuth provider in an existing web application. Keyset detects the framework
and auth library, obtains or imports credentials through the safest available
provider flow, configures callback URLs and environment variables, updates the
auth integration idempotently, and verifies both configuration and runtime
behavior.

The user-facing command remains `keyset`, regardless of the npm scope:

```bash
npm install --global @key-set/cli
keyset setup google --auto
keyset verify --runtime
keyset doctor
```

## Scope Boundaries

### In scope

- OAuth provider project/client setup and credential import.
- Consent-screen, test-user, scope, origin, and redirect configuration where
  the provider supports it.
- Auth.js, Better Auth, and future typed auth-adapter integrations.
- Environment and secret-manager synchronization.
- Callback, state, nonce, PKCE, scope, expiry, and refresh-token diagnostics.
- Credential rotation, drift detection, and safe remediation.
- CLI, MCP, SDK, and agent-skill access to the same Core operations.
- Official provider APIs first, guided or browser automation only as a
  provider-specific fallback.

### Out of scope

- Database, hosting, DNS, deployment, email, payments, or general DevOps
  provisioning.
- Generic API-key management unrelated to an OAuth flow.
- Building a user/account database or application authorization model.
- Replacing the application’s auth library or session implementation.
- Bypassing provider security, consent, verification, MFA, or policy steps.

## Architectural Plan

### Phase 1 — OAuth domain model and lifecycle

Extend `@key-set/core` with typed, provider-neutral models for:

- OAuth client metadata and credential references.
- Provider capabilities: client creation, consent configuration, test users,
  rotation, revocation, and runtime validation.
- Authorization parameters and validated callback plans.
- Environment targets: local, development, staging, and production.
- Credential state: missing, configured, drifted, expiring, expired, and
  revoked.
- Safe operations: plan, apply, verify, rotate, revoke, and rollback.

Every operation must produce secret-safe diagnostics and be idempotent. Core
must remain independent from CLI, MCP, browser automation, and any specific
provider.

### Phase 2 — Provider contract and Google maturity

Extend the provider SDK and Google provider with capability-aware operations:

- Detect the active Google Cloud project.
- Validate OAuth branding, consent status, test users, scopes, origins, and
  redirect URIs.
- Reuse an existing web client when safe; create a new one only when needed.
- Import credentials without exposing secrets.
- Detect configuration drift against the local project.
- Report which steps require human interaction or provider approval.
- Support visible browser, existing browser session, and headless modes where
  technically and legally appropriate.
- Prefer official APIs and tooling; retain browser automation only for console
  operations that have no supported API.

Google-specific limitations must be explicit. Keyset must not claim that Web
MCP or headless browsing can bypass Google consent, MFA, account verification,
or OAuth app review.

### Phase 3 — Auth adapters and framework coverage

Define a stable auth-adapter contract for:

- Auth.js / NextAuth.
- Better Auth.
- Additional adapters only when their OAuth configuration model is well
  understood.

Each adapter must support detection, non-destructive mutation, idempotency,
framework-specific verification, and rollback on partial failure. Provider
packages may not edit application source directly; adapters own source
mutation and Core owns the plan and transaction.

### Phase 4 — Environment and secret lifecycle

Add a provider-neutral secret target interface with local implementations for:

- `.env`, `.env.local`, and framework-specific environment files.
- Vercel, GitHub Actions, Google Secret Manager, AWS Secrets Manager, Azure
  Key Vault, and Doppler as optional integrations.

Required behavior:

- Never print raw client secrets or refresh tokens.
- Refuse to write into unignored secret files unless explicitly overridden.
- Show planned key names and redacted values only.
- Support rotation with backup and rollback.
- Detect stale, duplicated, missing, or conflicting environment variables.
- Keep provider credentials separate per environment.

### Phase 5 — CLI and MCP workflows

Expose the same Core operations through clear commands:

```bash
keyset providers list
keyset oauth setup google --auto
keyset oauth inspect google
keyset oauth verify google --runtime
keyset oauth callbacks check
keyset oauth rotate google
keyset oauth doctor
```

Maintain backward compatibility for `keyset setup google --auto`.

MCP tools should include:

- `oauth_list_providers`
- `oauth_inspect_project`
- `oauth_setup`
- `oauth_verify`
- `oauth_check_callbacks`
- `oauth_rotate`
- `oauth_doctor`

MCP responses must return plans, statuses, and next actions, never raw
credentials. Mutating tools must support dry-run and bounded, explicit project
paths.

### Phase 6 — Provider expansion

After Google is stable, add providers in this order:

1. GitHub OAuth Apps.
2. Microsoft Entra ID / Azure AD.
3. Apple Sign In.
4. Discord and Slack.
5. LinkedIn, GitLab, Notion, and other providers based on demand.

Each provider requires an official capability assessment, typed SDK plugin,
fixture-based tests, documentation, safe credential handling, and a runtime
verification path before release.

## Testing and Quality Gates

- Unit tests for every Core state transition and provider capability.
- Fixture tests for each auth adapter with existing providers preserved.
- Idempotency tests for setup, rotation, and rollback.
- Secret-sentinel scans over source, fixtures, logs, docs, and packed files.
- Runtime tests for localhost callback success and bounded redirect handling.
- CLI smoke tests from a packed installation on Windows and Linux.
- MCP protocol tests for tool discovery, dry-run, errors, and redaction.
- Provider contract test suite reusable by every new integration.
- `npm run verify`, packed-install smoke tests, package audit, and GitHub CI
  must pass before release.

## Documentation and Release Work

- Update README and provider guides with the OAuth-only product boundary.
- Add an OAuth lifecycle guide covering setup, verification, drift, and
  rotation.
- Document visible, existing-session, headless, and API-based provider modes.
- Document required human actions and provider policy limitations.
- Add troubleshooting for redirect mismatch, consent/test-user restrictions,
  invalid client, expired secret, and runtime callback failures.
- Publish packages under `@key-set/*`; keep the executable name `keyset`.
- Add changelog entries and a migration guide for existing `@keyset/*`
  development users before any stable package migration.

## Acceptance Criteria

The goal is complete when:

1. Google setup, verification, drift detection, and rotation work through CLI
   and MCP without exposing secrets.
2. Existing Auth.js and Better Auth configuration is preserved and mutations
   are idempotent and rollback-safe.
3. At least GitHub and Microsoft are implemented through the same provider
   contract, or explicitly deferred with documented reasons.
4. Local and supported secret-manager targets work per environment.
5. A user can diagnose callback and OAuth configuration failures with one
   command.
6. All provider, adapter, security, package, and runtime quality gates pass.
7. Documentation clearly states what Keyset automates and which provider
   actions still require a human.

## Execution Rules

- Implement phases in order; do not add new providers before the contract and
  Google lifecycle are stable.
- Inspect the repository before each phase and preserve unrelated user work.
- Use official provider APIs/tooling whenever available.
- Keep all mutations idempotent, reversible, and secret-safe.
- Do not broaden the product into general infrastructure automation.
