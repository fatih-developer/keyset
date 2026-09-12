# Keyset PRD

## 1. Product Summary

Keyset is an open-source developer tool that automates and validates authentication-provider setup across projects without depending on a specific project type, operating system, IDE, agent, or LLM.

The product solves a repetitive problem: developers must repeatedly discover callback URLs, create provider credentials, configure local and production environments, modify auth libraries, protect secrets, and debug redirect mismatches.

Keyset provides a single reusable workflow through CLI, MCP, and SDK interfaces.


## 1.1 Product Identity

- Product name: **Keyset**
- Canonical project/docs URL: `https://keyset.fatihunal.dev`
- CLI: `keyset`
- MCP server: `keyset-mcp`
- Package namespace target: `@key-set/*` subject to registry availability before public release
- Repository target: `keyset`

The product identity must remain independent from a required commercial root domain. The GitHub repository, package registries, CLI, MCP server, and documentation site must each work independently.

## 2. Product Goal

Enable a developer or coding agent to configure a supported authentication provider with the smallest possible amount of manual work while preserving security and producing a verifiable result.

Target experience:

```bash
keyset setup google
```

or through an agent:

> Add Google authentication to this project using Keyset.

## 3. Non-Goals for v0.1

- Building a hosted authentication service
- Replacing Better Auth, Auth.js, Clerk, Firebase Auth, Supabase Auth, etc.
- Browser automation of provider consoles as a hard dependency
- Storing users' provider secrets in an Keyset cloud service
- Supporting every OAuth provider
- Automatic production deployment
- Stripe, Cloudflare, Resend, database, or unrelated developer-service provisioning

## 4. Target Users

### Primary

- Solo developers
- Small engineering teams
- AI-assisted developers using Codex, Claude Code, Cursor, Gemini CLI, OpenCode, or custom agents
- Open-source maintainers

### Secondary

- Internal platform teams that want repeatable auth setup
- Tool builders who want to embed provider provisioning into their own workflows

## 5. Core Use Cases

### UC-01 — New Google OAuth setup

Developer runs:

```bash
keyset setup google
```

Keyset:

1. Inspects the current repository.
2. Detects supported framework/auth-library information when possible.
3. Determines local and production base URLs.
4. Calculates required callback URLs.
5. Checks the provider adapter's automation capability.
6. Automates all supported provider-side steps.
7. Guides the user only through unavoidable manual provider-side steps.
8. Imports credentials without printing secrets.
9. Configures application environment variables and supported auth library.
10. Runs verification.

### UC-02 — Agent-driven setup

An agent calls Keyset through MCP.

The MCP server exposes safe high-level tools while Keyset Core performs the actual work.

### UC-03 — Diagnose an existing setup

```bash
keyset doctor
```

Keyset detects:

- Missing client ID
- Missing client secret
- Secrets tracked by Git
- Incorrect callback route
- Mismatched localhost port
- Missing production URL
- Invalid provider configuration
- Auth adapter not configured
- Provider/client metadata inconsistencies where programmatically detectable

### UC-04 — Verify before deploy

```bash
keyset verify google
```

Returns machine-readable and human-readable validation results suitable for CI.

## 6. Product Principles

### 6.1 Core is independent

The Core must not depend on:

- MCP
- an LLM
- Codex
- Claude
- Cursor
- a specific IDE

CLI, MCP, skills, and SDK are adapters around the same core.

### 6.2 Capability-aware providers

Provider automation must declare capability levels:

- `full_automation`
- `partial_automation`
- `guided_setup`

Keyset must never fake full automation when a provider does not expose an official API for a required operation.

### 6.3 Secrets are never normal output

Secrets must not be:

- printed to stdout by default
- returned in MCP text responses
- written to README/docs
- written to `.env.example`
- committed to Git

Secrets may be written only to explicitly approved local secret destinations.

### 6.4 Idempotent by default

Running the same setup twice should reuse compatible existing configuration and avoid unnecessary duplicate OAuth clients or duplicated environment entries.

### 6.5 Detect, propose, apply, verify

Every mutating flow should follow:

1. Detect
2. Build a plan
3. Apply safe changes
4. Verify
5. Report concise result

## 7. v0.1 Functional Requirements

### FR-01 — Project inspection

Keyset must detect where possible:

- project root
- package manager
- framework
- auth library
- local dev command
- local port
- environment files
- Git ignore configuration
- production-domain hints

Initial supported project family:

- Node.js / TypeScript
- Next.js

### FR-02 — Auth adapters

Initial adapters:

- Better Auth
- Auth.js

Adapter responsibilities:

- detect installation
- detect existing provider configuration
- calculate framework/library-specific callback path
- generate minimal config changes
- validate configuration

### FR-03 — Google provider adapter

Google adapter must support:

- required OAuth metadata generation
- authorized origin calculation
- redirect URI calculation
- Google Cloud project/context discovery when official tooling permits
- capability reporting
- guided steps when an operation cannot be completed programmatically
- credential import
- provider-side validation where possible

### FR-04 — Environment handling

Support:

- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.example`

Rules:

- never place real secrets in example files
- preserve comments and unrelated entries where possible
- avoid duplicate keys
- support dry-run preview

### FR-05 — CLI

Required commands:

```bash
keyset init
keyset inspect
keyset setup google
keyset doctor
keyset verify [provider]
keyset providers
keyset config
```

Global options:

```bash
--json
--dry-run
--yes
--verbose
--project <path>
```

### FR-06 — MCP server

Expose high-level tools:

- `inspect_project`
- `list_providers`
- `plan_provider_setup`
- `setup_provider`
- `doctor`
- `verify_provider`

MCP tools should return structured results and must redact secret values.

### FR-07 — Provider SDK

A provider plugin contract must define:

- provider metadata
- capabilities
- prerequisites
- plan generation
- setup execution
- credential import
- provider validation
- cleanup/rollback hooks where applicable

### FR-08 — Doctor engine

Doctor checks should use a normalized finding model:

- code
- severity
- title
- evidence
- remediation
- autoFixAvailable

Severity levels:

- info
- warning
- error
- critical

### FR-09 — Verification

Verification result must support CI exit codes:

- `0` verified
- `1` verification failed
- `2` invalid project/configuration
- `3` provider/manual action required

### FR-10 — Structured state

Project-local non-secret Keyset metadata may be stored in:

```text
.keyset/
  config.json
  state.json
```

Secret values must not be stored there.

## 8. Security Requirements

- Secret redaction in logger and MCP serialization
- No shell interpolation with untrusted project values
- Validate file paths stay inside allowed project boundaries
- Explicitly classify commands as read-only vs mutating
- Never commit credentials
- Detect Git-tracked env files containing known secret keys
- Prefer OS/provider-native credential stores where practical
- MCP tool descriptions must clearly identify mutating actions
- Avoid accepting arbitrary shell commands through MCP
- Provider plugins must use typed operations rather than command strings

## 9. UX Requirements

Default CLI output should be concise.

Example:

```text
Google OAuth

✓ Project: Next.js + Better Auth
✓ Local URL: http://localhost:3000
✓ Production URL: https://example.com
✓ Redirect URIs calculated
✓ Application config updated
! Google requires one manual console action

Next: open the provided Google Cloud setup link and import the client JSON.
```

Do not expose implementation noise unless `--verbose` is set.

## 10. Technical Direction

Recommended stack:

- TypeScript
- Node.js 22+
- pnpm workspace
- tsup/tsdown or equivalent package build tooling
- Zod for schemas
- Vitest for tests
- official MCP TypeScript SDK

Repository shape:

```text
packages/
  core/
  cli/
  mcp-server/
  provider-sdk/
  provider-google/
  adapter-better-auth/
  adapter-authjs/
  test-fixtures/
```

## 11. Configuration Model

Example non-secret project config:

```json
{
  "version": 1,
  "app": {
    "name": "example",
    "developmentUrl": "http://localhost:3000",
    "productionUrl": "https://example.com"
  },
  "auth": {
    "adapter": "better-auth"
  },
  "providers": {
    "google": {
      "enabled": true
    }
  }
}
```

## 12. Success Metrics

For supported projects:

- <= 1 required user decision for a normal detected setup
- no plaintext secret leakage in standard output
- rerunning setup does not create duplicate config
- `doctor` detects common redirect/env mistakes
- CLI setup works without any LLM
- MCP setup uses the same core behavior as CLI
- test fixtures cover Better Auth and Auth.js projects

## 13. Acceptance Criteria for v0.1

v0.1 is complete when:

1. A sample Next.js + Better Auth project can be inspected.
2. Required Google OAuth URLs are calculated correctly.
3. Keyset can execute supported Google-side automation and clearly switch to guided setup when required.
4. Credentials can be imported without being printed.
5. `.env.local` can be updated safely.
6. Better Auth Google provider configuration can be applied idempotently.
7. Auth.js Google provider configuration can be applied idempotently.
8. `doctor` reports meaningful failures.
9. `verify google` produces CI-safe exit codes.
10. MCP exposes the same major operations as CLI.
11. Codex and Claude Code example skills can drive the MCP without containing product logic.
12. Unit and fixture tests pass.

## 14. Future Roadmap

## 13.1 v0.2 Google E2E Status

The v0.2 setup flow accepts client ID/client secret flags or exported Google credential JSON, safely updates `.env.local`, mutates supported Better Auth/Auth.js configurations idempotently, and rolls back on verification failure. Google Cloud Console client creation remains guided because it is not implemented through undocumented automation.

Post-v0.1 candidates:

- GitHub OAuth
- Microsoft Entra ID
- Discord
- Apple
- additional frameworks
- OS keychain integration
- Secret Manager integrations
- remote MCP deployment mode
- CI templates
- provider plugin registry

Do not expand into unrelated SaaS provisioning until auth-provider setup is stable.
