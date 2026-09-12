# Goal 14 — Developer Automation Product Family

## Objective

Define and plan a family of focused developer-automation products around
Keyset. Keyset remains responsible only for OAuth integration lifecycle. The
other automation areas become separate products with explicit boundaries,
independent release cycles, and compatible CLI/MCP conventions.

## Product Principles

- One product, one operational responsibility.
- Keyset owns OAuth; it must not become a general infrastructure orchestrator.
- Products share conventions, not hidden coupling.
- Every mutation has plan, apply, verify, rollback, and dry-run behavior.
- Secrets are redacted by default and never returned through MCP responses.
- Official provider APIs and declarative configuration are preferred.
- Human approval is required for destructive, billable, or externally visible
  operations.
- Existing application code is preserved unless the user explicitly requests
  a source mutation.

## Proposed Product Family

```text
Developer Automation Platform
├── Keyset       OAuth integrations
├── Accessset    Users, sessions, roles, and permissions
├── Secretset    API keys, environment, and secret managers
├── Dataset      Databases, migrations, backups, and data services
├── Launchset    Deployment, hosting, domains, DNS, and SSL
├── Mailset      Transactional email and sender configuration
├── Payset       Payments, subscriptions, and billing webhooks
└── Appset       Application feature and code scaffolding
```

The names are working names and may be changed after validation. The product
boundaries and contracts are more important than the names.

## Shared Platform Contract

Products should expose a common, provider-neutral lifecycle:

```text
inspect → plan → approve → apply → verify → maintain
```

Shared concepts:

- Project inspection and framework detection.
- Provider capability metadata.
- Typed setup plans and operation identifiers.
- Idempotent transactions with rollback checkpoints.
- Environment targets: local, development, staging, production.
- Secret-safe diagnostics and structured JSON output.
- CLI commands and MCP tools with equivalent semantics.
- Provider health, drift, expiry, and remediation checks.
- Human approval gates for billing, deletion, production, and public exposure.

Shared libraries should be extracted only when the dependency is genuinely
provider-neutral. Keyset Core must not become a dumping ground for unrelated
infrastructure behavior.

## Product 1 — Secretset

### Mission

Manage application secrets, API keys, environment variables, and secret-store
references safely across environments.

### MVP

- Inspect `.env*` files and detect duplicate or conflicting keys.
- Detect ignored/unignored secret files and likely credential leaks.
- Import and export environment values through redacted plans.
- Sync secrets to Vercel, GitHub Actions, Google Secret Manager, AWS Secrets
  Manager, Azure Key Vault, and Doppler.
- Compare local and remote secret metadata without returning values.
- Rotate supported credentials with backup and rollback.
- Track ownership, environment, expiry, and last verification time.

### Example commands

```bash
secretset inspect
secretset sync production --provider vercel
secretset rotate GOOGLE_CLIENT_SECRET
secretset verify
```

### Safety requirements

- Never print values, even in verbose mode.
- Require explicit confirmation for overwrite and deletion.
- Refuse unsafe `.env` writes by default.
- Support secret references instead of copying values where possible.
- Maintain an audit record without storing raw secret material.

## Product 2 — Accessset

### Mission

Provide application-level users, sessions, roles, permissions, and account
management after an OAuth provider has authenticated a user.

### MVP

- Detect the application auth library and database adapter.
- Generate user, account, session, role, and permission models.
- Add registration, sign-in completion, sign-out, and account-linking flows.
- Create a typed role and permission policy.
- Generate protected-route middleware and server-side authorization helpers.
- Provide an admin bootstrap flow without hard-coded credentials.
- Verify session cookie, CSRF, account-linking, and privilege boundaries.

### Example commands

```bash
accessset inspect
accessset setup users
accessset setup roles --template=team
accessset verify authorization
```

### Boundary with Keyset

Keyset supplies OAuth identity-provider configuration. Accessset owns the
application’s user and authorization domain. Keyset may hand off provider
metadata, but must not create roles or user tables.

## Product 3 — Dataset

### Mission

Provision and maintain application data services and their schema lifecycle.

### MVP

- Detect ORM and database configuration.
- Plan local PostgreSQL, SQLite, and managed PostgreSQL setup.
- Generate connection variables through Secretset references.
- Create migrations and safe development seed data.
- Run migration status and schema drift checks.
- Provide backup, restore, and destructive-operation safeguards.
- Verify connectivity, permissions, SSL, and migration consistency.

### Example commands

```bash
dataset inspect
dataset create postgres --environment=development
dataset migrate
dataset verify
```

### Safety requirements

- Production migration requires explicit approval.
- Never drop data as part of an implicit repair.
- Backups must be verified before destructive operations.
- Credentials flow through Secretset and are never logged.

## Product 4 — Launchset

### Mission

Move a web application from local development to a reachable, secure,
observable deployment.

### MVP

- Detect framework, package manager, build command, and required variables.
- Support Vercel first, followed by common container platforms.
- Configure build/runtime settings and environment references.
- Manage preview and production deployment plans.
- Configure custom domains, DNS records, SSL, and redirect rules.
- Verify health endpoint, headers, TLS, callback reachability, and rollback.
- Report cost-impacting or public-exposure changes before applying them.

### Example commands

```bash
launchset inspect
launchset deploy preview
launchset domain add example.com
launchset verify production
```

### Safety requirements

- Domain and production changes require confirmation.
- No silent DNS replacement.
- Deployment tokens use Secretset references.
- Rollback must identify the exact previous deployment.

## Product 5 — Mailset

### Mission

Configure reliable transactional email for application workflows.

### MVP

- Support Resend first, then Postmark, SendGrid, and Amazon SES.
- Configure sender identity, reply-to, and environment separation.
- Generate typed email client configuration.
- Create welcome, verification, password reset, invitation, and notification
  templates.
- Configure domain authentication records where provider APIs support it.
- Verify sending, bounce handling, webhook signing, and rate-limit behavior.

### Example commands

```bash
mailset setup resend
mailset template add verification
mailset domain verify example.com
mailset test --to developer@example.com
```

### Safety requirements

- Test sends must be explicit and recipient-limited.
- Production sender changes require confirmation.
- Webhook secrets are managed through Secretset.
- Do not send email automatically during project inspection.

## Product 6 — Payset

### Mission

Configure payment providers, products, subscriptions, checkout, and webhook
verification without hiding financial consequences.

### MVP

- Support Stripe first; add local providers only after demand and API review.
- Create or import products and prices through an explicit plan.
- Configure checkout and customer-portal settings.
- Generate webhook endpoints and signature verification.
- Separate test and live credentials and environments.
- Verify webhook replay protection, idempotency, currency, and price mapping.
- Provide a local webhook test harness.

### Example commands

```bash
payset inspect
payset setup stripe --mode=test
payset webhook verify
payset verify billing
```

### Safety requirements

- Never create live products, prices, charges, or subscriptions implicitly.
- Live-mode operations require explicit approval.
- Financial configuration must show provider, mode, currency, and estimated
  side effects before apply.

## Product 7 — Appset

### Mission

Generate application code and common product features that are not provider
configuration.

### MVP

- Generate typed routes, forms, validation, and API clients.
- Scaffold dashboards, settings pages, invitations, and audit-log views.
- Detect project conventions and follow existing style.
- Produce a patch plan before changing source files.
- Run formatting, typecheck, tests, and rollback on failure.

### Boundary

Appset is the only product allowed to focus primarily on application source
generation. It must not silently provision cloud accounts, create payments, or
manage OAuth credentials. It can consume contracts from Keyset, Accessset,
Dataset, Mailset, and Payset.

## Delivery Order

### Stage A — Shared foundations

1. Define the provider capability and operation contracts.
2. Extract provider-neutral plan, approval, transaction, and diagnostics types.
3. Add common CLI/MCP conventions and redaction tests.
4. Define product configuration and environment metadata.
5. Document cross-product handoff rules.

### Stage B — Highest-value adjacent products

1. Secretset: required by nearly every other product.
2. Accessset: natural continuation after OAuth login.
3. Launchset: makes configured applications reachable.

### Stage C — Application service products

1. Dataset.
2. Mailset.
3. Payset.

### Stage D — Code generation

1. Appset after the contracts and safety model have real consumers.
2. Add cross-product recipes only as explicit, reviewable workflows.

## Cross-Product Recipes

Recipes must be composed from independent plans and must expose every side
effect:

```text
Keyset OAuth
  → Secretset environment sync
  → Accessset user/session integration
  → Dataset migration
  → Mailset verification email
  → Launchset preview deployment
```

The first release should support dry-run and stop after each product’s
approval gate. A future orchestrator may execute approved plans, but it must
not hide provider-specific failures or combine secrets into MCP output.

## Shared Testing Strategy

- Contract tests for every provider plugin.
- Fixture projects for supported frameworks and package managers.
- Plan idempotency and rollback tests.
- Approval-gate tests for production, billing, deletion, DNS, and email sends.
- Secret-redaction and leak-sentinel scans across all artifacts.
- CLI packed-install smoke tests on Windows and Linux.
- MCP tool-discovery, dry-run, timeout, cancellation, and error tests.
- Provider sandbox tests where available; no real production credentials in CI.
- Full verification before each product release.

## Documentation and Operations

Every product requires:

- A clear README with boundaries and quick start.
- Provider support matrix and API limitations.
- Configuration and environment reference.
- Dry-run, approval, rollback, and recovery guide.
- Security and threat model.
- Troubleshooting guide.
- Example fixture without real credentials.
- Migration and compatibility notes.

## Product-Level Acceptance Criteria

A product is ready for public preview only when:

1. Its responsibility is independently explainable in one sentence.
2. Its provider operations expose inspect, plan, apply, verify, and safe error
   behavior.
3. Destructive, billable, public, or irreversible actions have approval gates.
4. Secrets are redacted from logs, diagnostics, packages, and MCP responses.
5. Operations are idempotent or clearly marked as non-idempotent.
6. A failed mutation can be diagnosed and, where possible, rolled back.
7. CLI and MCP expose equivalent capabilities.
8. The product can be installed and tested without requiring a production
   account.

## Decisions to Make Before Implementation

- Whether products remain in one monorepo or move to separate repositories.
- Whether a shared organization scope is used for all packages.
- Which common contracts belong in a small shared package.
- Whether the CLI is one command with subcommands or separate binaries.
- Which providers have stable sandbox/test APIs.
- Whether recipes are local-only first or supported by a hosted control plane.
- Product naming and domain availability.

## Non-Goals

This roadmap does not authorize building all products immediately. It defines
boundaries and an order of investigation. Each product must receive its own
implementation goal, threat model, provider assessment, and release gate
before code is added.
