# Goal: Keyset v0.2 — Google OAuth End-to-End Setup

## Objective

Complete the real end-to-end Google OAuth setup flow for supported projects.

The command:

```bash
keyset setup google
```

must be able to take a supported Next.js project using Better Auth or Auth.js from “Google auth not configured” to “Google auth configured and verified”, assuming the user can provide valid Google OAuth credentials when prompted or via supported input.

Google Cloud Console OAuth client creation remains `guided_setup` in v0.2. Do not implement brittle browser automation or undocumented Google console automation.

---

## Scope

Implement the missing production-quality setup flow across:

- project inspection
- auth framework detection
- Google OAuth setup planning
- credential import
- safe environment mutation
- auth source mutation
- idempotency
- rollback / recovery
- verification
- CLI orchestration
- MCP orchestration
- tests and fixtures

Supported auth frameworks for v0.2:

- Better Auth
- Auth.js

Supported project type:

- Next.js

Do not add new auth frameworks or providers in this goal.

---

## Required User Flow

The expected CLI flow is:

```bash
keyset setup google
```

Keyset should:

1. Inspect the current project.
2. Detect Next.js.
3. Detect Better Auth or Auth.js.
4. Detect development URL where possible.
5. Detect or accept production URL/domain.
6. Calculate required Google OAuth redirect URIs and origins.
7. Check whether Google OAuth is already configured.
8. If credentials are missing:
   - enter guided setup mode
   - show the exact Google Cloud values required
   - accept credentials securely
9. Write credentials safely to the correct local environment file.
10. Mutate the detected auth configuration.
11. Avoid duplicate configuration.
12. Run doctor/verify.
13. Return a concise success or actionable failure result.

Example success result:

```text
Google OAuth configured successfully.

Framework: Better Auth
Environment: .env.local
Redirect URI: https://example.com/api/auth/callback/google

✓ credentials configured
✓ auth provider configured
✓ redirect plan valid
✓ secret excluded from output
✓ verification passed
```

Never print the client secret.

---

## Architecture Rule

Do not put provider-specific orchestration logic directly into the CLI.

The dependency direction should remain:

```text
CLI / MCP
   ↓
Core setup orchestration
   ↓
Provider SDK + Auth Adapter
   ↓
Filesystem / Environment
```

CLI and MCP must use the same core implementation.

Do not duplicate setup logic between CLI and MCP.

---

## Core Setup Orchestrator

Create or complete a reusable setup orchestrator.

Suggested conceptual API:

```ts
setupProvider({
  provider: "google",
  project,
  options
})
```

The orchestrator should coordinate:

- inspection
- planning
- existing-state detection
- credential handling
- environment mutation
- auth source mutation
- verification
- rollback

The final API can differ if the existing architecture already has a better convention.

Follow the current repo structure and naming conventions.

---

## Setup Planning

Before writing anything, generate a setup plan.

The plan should contain at minimum:

```ts
{
  provider: "google",
  framework: "better-auth" | "authjs",
  environmentFile,
  developmentOrigin,
  productionOrigin,
  authorizedOrigins,
  redirectUris,
  requiredEnvironmentVariables,
  sourceMutations,
  status
}
```

Supported statuses should distinguish at least:

```text
already_configured
requires_credentials
requires_source_mutation
ready_to_apply
unsupported
```

Do not mutate files during planning.

---

## Google Guided Setup

Google OAuth client provisioning remains guided.

When credentials are missing, Keyset must provide exact values the user needs to enter in Google Cloud.

Example:

```text
Create a Google OAuth Web Application client.

Authorized JavaScript origins:
- http://localhost:3000
- https://example.com

Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google
- https://example.com/api/auth/callback/google
```

Then support credential import through at least:

### Interactive input

```text
Client ID:
Client Secret:
```

The secret input must not echo when the terminal supports hidden input.

### Environment / flags

Support non-interactive input suitable for CI or agent execution.

For example, either existing conventions or equivalent:

```bash
keyset setup google \
  --client-id "$GOOGLE_CLIENT_ID" \
  --client-secret "$GOOGLE_CLIENT_SECRET"
```

### Credential JSON import

If the existing Google provider adapter supports exported Google credential JSON, integrate it into the setup flow.

Do not require JSON if client ID + secret are available.

---

## Secret Safety

This is mandatory.

Client secrets must never appear in:

- normal CLI output
- debug output
- error messages
- MCP responses
- generated diff output
- test snapshots
- README examples
- logs

Use the existing redaction system everywhere setup errors can expose values.

Add tests specifically verifying secret redaction.

If dry-run output includes environment mutation, represent secrets like:

```text
GOOGLE_CLIENT_SECRET=[REDACTED]
```

---

## Environment Mutation

Complete safe `.env` handling.

Expected behavior:

- prefer the existing project convention
- use `.env.local` for local secrets when appropriate
- preserve comments and unrelated variables where possible
- remove duplicate definitions of managed keys
- update existing managed keys safely
- do not write secrets into `.env.example`
- ensure `.env.example` contains only variable names/placeholders
- ensure secret-bearing local env files are gitignored where appropriate

Managed Google variables should follow the existing adapter/framework conventions.

If the repo already standardized:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

retain that convention.

Do not introduce alternate names unnecessarily.

---

## Better Auth Mutation

Implement real Better Auth configuration mutation.

Example target shape:

```ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
}
```

Requirements:

- preserve existing auth configuration
- preserve other social providers
- preserve formatting as much as practical
- do not duplicate `google`
- update partially configured Google entries when safe
- support common Better Auth config layouts in existing fixtures
- reject ambiguous mutations instead of corrupting source

Do not rewrite the entire file unless unavoidable.

Prefer AST-based mutation if the existing dependency stack supports it cleanly.

Regex-only mutation is not acceptable for arbitrary TypeScript source unless strictly limited to a proven fixture pattern.

---

## Auth.js Mutation

Implement real Auth.js Google provider configuration.

Support common patterns such as:

```ts
import Google from "next-auth/providers/google";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};
```

or the repo's existing supported Auth.js structure.

Requirements:

- add missing Google provider import
- add Google provider to providers
- preserve existing providers
- avoid duplicate imports
- avoid duplicate provider entries
- preserve unrelated configuration
- fail safely on ambiguous structures

---

## Idempotency

Running this command twice:

```bash
keyset setup google
keyset setup google
```

must not produce duplicate imports, providers, env keys, callback URLs, or other mutations.

The second run should ideally return:

```text
Google OAuth is already configured.
✓ verification passed
```

Add explicit idempotency tests.

---

## Dry Run

Support:

```bash
keyset setup google --dry-run
```

Dry-run must:

- inspect
- calculate the plan
- show intended mutations
- redact secrets
- not modify any file

Example:

```text
Planned changes:

.env.local
+ GOOGLE_CLIENT_ID=***
+ GOOGLE_CLIENT_SECRET=[REDACTED]

src/lib/auth.ts
+ configure Google social provider

No files were modified.
```

Do not include raw secret values even when the user supplied them.

---

## Backup and Rollback

Before source/environment mutation, capture enough state to restore modified files.

If a later stage fails:

```text
environment write
✓

source mutation
✓

verification
✗
```

Keyset should restore the files modified during that setup transaction unless the existing architecture has an explicit safer transaction model.

Return:

```text
Setup failed during verification.
Changes were rolled back.
```

If rollback itself fails, report the affected file paths clearly without leaking secrets.

Do not leave partially mutated auth configuration silently.

---

## Verification

After applying setup, verify at least:

- expected environment variables exist
- secret values are non-empty
- auth framework still detected
- Google provider is configured in source
- expected redirect URI matches framework rules
- no duplicate Google provider configuration exists
- no duplicate managed env keys exist

If runtime-level verification can be performed safely and cheaply in the current fixtures, add it.

Do not require an actual Google login in automated tests.

---

## CLI

Complete:

```bash
keyset setup google
```

Add or preserve useful options such as:

```text
--dry-run
--client-id
--client-secret
--production-url
--non-interactive
```

Use existing CLI conventions if equivalent flags already exist.

Exit codes should remain meaningful.

Suggested behavior:

```text
0 success / already configured
1 operational failure
2 incomplete configuration / user action required
```

Do not break existing `verify` behavior unless necessary.

---

## MCP

Expose the same capabilities through the MCP server.

At minimum, ensure the MCP flow can perform:

```text
inspect_project
plan_provider_setup
setup_provider
import_credentials
doctor
verify
```

Names may follow the current code conventions.

Important:

- MCP responses must never contain raw secrets.
- MCP must call shared Core orchestration.
- Do not implement a separate MCP-only setup path.

A coding agent should be able to:

```text
inspect project
→ request Google setup plan
→ supply credentials
→ apply setup
→ verify
```

without needing provider-specific logic inside the agent.

---

## Fixtures

Extend existing fixtures.

Required fixtures:

```text
nextjs-better-auth-empty
nextjs-better-auth-existing-provider
nextjs-better-auth-google-configured

nextjs-authjs-empty
nextjs-authjs-existing-provider
nextjs-authjs-google-configured
```

Include at least one realistic existing configuration for each framework.

Avoid fixtures designed only to make regex mutation pass.

---

## Tests

Add tests covering at minimum:

### Core

- setup planning
- missing credential state
- already configured state
- dry-run
- rollback
- verification

### Environment

- insert keys
- update keys
- duplicate cleanup
- preserve unrelated lines
- `.env.example` secret safety
- redaction

### Better Auth

- clean setup
- existing providers preserved
- existing Google provider not duplicated
- idempotent second run
- ambiguous source fails safely

### Auth.js

- add Google import
- add provider
- preserve providers
- avoid duplicate imports
- idempotent second run
- ambiguous source fails safely

### CLI

- setup success
- guided setup incomplete exit code
- dry-run
- invalid credentials input shape
- secret never printed

### MCP

- setup tool uses Core
- redacted responses
- verification result

---

## Compatibility

Keep:

```text
Node.js 22
pnpm workspace
TypeScript
```

Do not replace the current toolchain.

Do not perform unrelated refactors.

Preserve `AGENTS.md`.

Follow existing lint, formatting and test conventions.

---

## Documentation

Update:

```text
README.md
docs/PRD.md
docs/ARCHITECTURE.md
CHANGELOG.md
```

Document the real v0.2 flow:

```bash
keyset setup google
```

Include examples for:

- Better Auth
- Auth.js
- guided Google console setup
- dry-run
- non-interactive setup
- MCP usage

Never place real credentials in docs.

---

## Definition of Done

The goal is complete only when the following scenario works:

Given a supported Next.js project with Better Auth or Auth.js and no Google provider configured:

```bash
keyset setup google
```

1. detects the project correctly
2. calculates correct Google OAuth configuration
3. guides credential creation when credentials are missing
4. securely imports credentials
5. updates environment configuration
6. mutates the auth source correctly
7. preserves existing configuration
8. produces no duplicate configuration
9. passes `keyset verify`
10. never exposes the client secret

And:

```bash
keyset setup google
```

run a second time makes no unnecessary changes.

Also required:

```bash
npm run verify
```

or the repository's equivalent full verification command must pass.

All existing tests must remain green.

---

## Non-Goals

Do not implement in this goal:

- browser automation of Google Cloud Console
- undocumented Google APIs
- GitHub OAuth provider
- Microsoft OAuth provider
- Apple OAuth provider
- Supabase
- Clerk
- Firebase
- Coolify integration
- remote secret vault
- hosted Keyset service
- web dashboard
- telemetry
- billing

Keep v0.2 focused on making the Google OAuth setup promise genuinely work end-to-end.

---

## Final Report

At completion, return only the important results:

- files/modules changed
- supported end-to-end flows
- test results
- any remaining real limitation
- exact next recommended milestone

Do not provide a long implementation diary.