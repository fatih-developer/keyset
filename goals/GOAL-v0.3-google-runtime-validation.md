# Goal: Keyset v0.3 — Google Context Validation + Runtime Verification

## Objective

Strengthen Google OAuth setup verification so Keyset can distinguish between:

- configuration that merely looks correct
- configuration that is structurally valid
- configuration that is actually wired correctly at runtime

The target outcome is that:

```bash
keyset doctor google
```

and:

```bash
keyset verify google
```

provide reliable, actionable validation for supported Next.js projects using Better Auth or Auth.js.

Do not add new providers or frameworks in this milestone.

---

## Scope

Implement deeper validation across:

- Google credential structure
- OAuth client context
- redirect URI correctness
- callback route detection
- runtime auth route verification
- framework-specific route checks
- configuration mismatch diagnostics
- local runtime smoke tests
- richer doctor output
- regression tests

Supported:

- Next.js
- Better Auth
- Auth.js
- Google OAuth

---

## Non-Goal

Do not automate Google Cloud Console in this milestone.

Google OAuth client creation remains guided setup.

Do not add:

- browser automation
- Playwright interaction with Google Cloud Console
- undocumented Google APIs
- GitHub/Microsoft/Apple providers
- hosted Keyset services
- production secret vaults
- telemetry

---

## Core Principle

Verification must be layered.

Use three levels:

```text
Level 1 — Static
Files, env variables and source configuration exist.

Level 2 — Semantic
Framework, callback path, domains and credentials are internally consistent.

Level 3 — Runtime
The project boots and the expected auth route is actually reachable.
```

Each validation result must indicate its level.

---

## Verification Result Model

Introduce or extend a reusable validation result structure.

Suggested model:

```ts
type VerificationCheck = {
  id: string;
  level: "static" | "semantic" | "runtime";
  status: "pass" | "warn" | "fail" | "skipped";
  message: string;
  remediation?: string;
};
```

Overall result should contain:

```ts
{
  provider: "google",
  framework: "better-auth" | "authjs",
  checks: VerificationCheck[],
  status: "healthy" | "warning" | "invalid";
}
```

Follow existing architecture if an equivalent model already exists.

Do not create parallel verification models unnecessarily.

---

## Google Credential Validation

Validate imported Google credentials more deeply.

At minimum validate:

- client ID exists
- client secret exists
- both values are non-empty
- whitespace-only values are rejected
- malformed credential JSON is rejected
- expected Google OAuth client ID format is recognized when possible
- credential import never leaks the client secret

If credential JSON contains metadata such as:

```json
{
  "web": {
    "client_id": "...",
    "client_secret": "...",
    "redirect_uris": []
  }
}
```

validate that it represents a Web OAuth client.

Reject clearly incompatible client types such as installed/native application credentials when the structure is detectable.

Return an actionable message such as:

```text
Google credential file is not a Web application OAuth client.
Create a Web application client in Google Cloud.
```

Do not claim remote verification unless it actually occurred.

---

## Google Context Validation

Add semantic validation for Google OAuth configuration.

Compare:

- detected project origin
- supplied production URL
- calculated authorized origins
- calculated callback URIs
- credential JSON redirect URIs when available
- framework callback rules

Detect mismatches such as:

```text
Expected:
https://example.com/api/auth/callback/google

Credential configuration contains:
https://example.com/auth/google/callback
```

Return:

```text
FAIL google.redirect_uri_mismatch

Expected redirect URI:
https://example.com/api/auth/callback/google

Configured redirect URI differs.

Action:
Update the Google OAuth Web client redirect URI.
```

Do not expose secrets in diagnostic output.

---

## Framework Callback Detection

Verify the actual callback route expected by the detected auth framework.

For Better Auth:

- detect the configured auth base path when possible
- derive the expected Google callback endpoint
- avoid hardcoding `/api/auth/callback/google` if the project configuration overrides the auth path

For Auth.js:

- detect whether the project uses:
  - App Router
  - Pages Router
- detect actual auth route location where possible
- infer the expected callback path from the active Auth.js configuration

If callback location cannot be determined safely:

```text
WARN auth.callback_route_unknown
```

Do not guess silently.

---

## Source-to-Route Consistency

Validate that the auth source configuration is reachable through the project routing structure.

Examples:

Better Auth:

```text
src/lib/auth.ts
app/api/auth/[...all]/route.ts
```

Auth.js:

```text
auth.ts
app/api/auth/[...nextauth]/route.ts
```

or:

```text
pages/api/auth/[...nextauth].ts
```

Verify that:

- auth config exists
- route handler exists
- route handler references/imports the expected auth config where practical
- expected HTTP handlers are exported

If config exists but route is missing:

```text
FAIL auth.route_missing

Google provider is configured, but no active auth route was found.
```

---

## Production URL Validation

Strengthen `--production-url` validation.

Reject invalid forms:

```text
example.com
ftp://example.com
javascript:...
```

Accept:

```text
https://example.com
http://localhost:3000
```

Normalize:

- trailing slash
- duplicate slash
- default ports where appropriate

Do not rewrite user URLs incorrectly.

Production URLs should normally require HTTPS except local development hosts.

Warn for insecure non-local production origins:

```text
WARN project.insecure_production_origin
```

---

## Local Development Origin Detection

Improve dev origin detection.

Try to infer from:

- package.json scripts
- framework defaults
- existing env configuration
- existing Keyset config

Examples:

```text
next dev
next dev -p 4000
next dev --port 4000
```

Infer:

```text
http://localhost:4000
```

If inference is ambiguous, prefer:

```text
http://localhost:3000
```

only when Next.js default behavior is applicable and no conflicting evidence exists.

Expose whether the value was:

```text
detected
configured
defaulted
```

---

## Runtime Verification

Add local runtime verification for supported fixtures/projects.

Command:

```bash
keyset verify google --runtime
```

or equivalent existing convention.

The runtime verifier should:

1. identify the project start/dev command
2. start the project in a child process
3. wait until the app is reachable
4. request the expected auth route
5. inspect the response
6. terminate the child process cleanly

Do not leave orphan processes.

---

## Runtime Safety

Runtime verification must:

- never send real Google credentials to external services
- never complete a real Google login
- never launch an interactive browser
- never bind publicly unless explicitly configured
- default to localhost
- redact secrets from child process logs

If required dependencies are missing or the project cannot boot:

```text
SKIPPED runtime.auth_route
Reason: project failed to start
```

Then report the underlying boot issue separately.

Do not incorrectly report OAuth failure if the application itself failed to compile.

---

## Runtime Auth Route Check

After the project starts, request the detected auth endpoint.

Examples:

```text
GET /api/auth/signin
GET /api/auth/providers
GET /api/auth/callback/google
```

Use framework-appropriate endpoints.

Success does not require HTTP 200 in every case.

Accept framework-valid responses such as:

- 200
- 302
- 307
- expected auth JSON response

Reject:

- 404
- 500
- route compilation failure

Do not follow an external Google redirect during tests.

If the auth route returns a redirect to Google:

```text
PASS runtime.google_redirect
```

Validate only that:

- redirect target is Google OAuth
- client ID parameter exists where applicable
- redirect URI matches the expected local callback

Never print the full redirect URL if it contains sensitive state values.

Sanitize it first.

---

## Runtime Google Redirect Validation

Where possible, inspect the generated authorization URL.

Validate:

- Google OAuth endpoint
- `client_id`
- `redirect_uri`
- response type
- expected scope presence

Do not require exact scope ordering.

Do not expose:

- state
- nonce
- PKCE verifier
- secret-like query parameters

Example:

```text
PASS google.authorization_request

Provider: Google
Redirect URI: http://localhost:3000/api/auth/callback/google
Client ID: configured
```

---

## Doctor Command

Enhance:

```bash
keyset doctor google
```

Expected output structure:

```text
Google OAuth

Static
✓ framework detected: Better Auth
✓ Google provider configured
✓ GOOGLE_CLIENT_ID configured
✓ GOOGLE_CLIENT_SECRET configured

Semantic
✓ callback route detected
✓ development redirect URI valid
✗ production redirect URI mismatch

Runtime
- not checked

Status: INVALID
```

When invoked with:

```bash
keyset doctor google --runtime
```

include runtime checks.

Keep output concise.

---

## Verify Command

`verify` should be stricter than `doctor`.

Suggested behavior:

```text
doctor
diagnostic, warnings allowed

verify
intended for automation / CI
```

Exit behavior:

```text
0 all required checks pass
1 verification failure
2 configuration incomplete
```

Preserve existing exit code conventions where possible.

Do not introduce incompatible behavior unnecessarily.

---

## Keyset Config Support

If the project already has a Keyset config file, allow it to store non-secret verification context.

For example:

```json
{
  "providers": {
    "google": {
      "productionUrl": "https://example.com"
    }
  }
}
```

Never store secrets in Keyset config.

Config should support deterministic verification across machines.

---

## MCP

Expose deeper verification through MCP.

At minimum:

```text
doctor_provider
verify_provider
```

or equivalent existing tool names.

Support runtime option where appropriate.

Example logical request:

```json
{
  "provider": "google",
  "runtime": true
}
```

MCP responses must:

- use structured check results
- redact all sensitive values
- avoid returning raw child process logs unless sanitized

CLI and MCP must use the same core verification implementation.

---

## Fixtures

Extend fixtures to cover route validation.

Required scenarios:

### Better Auth

- valid App Router auth route
- provider configured but route missing
- custom auth base path
- wrong callback expectation

### Auth.js

- valid App Router route
- valid Pages Router route
- config exists but route missing
- Google import exists but provider missing

---

## Runtime Fixtures

Add at least one bootable minimal fixture for each supported framework:

```text
runtime-nextjs-better-auth
runtime-nextjs-authjs
```

Each fixture should:

- install/build reliably
- expose an auth route
- avoid external dependencies
- use dummy credentials
- never perform a real Google login

Keep fixtures minimal.

---

## Tests

Add tests for:

### Credential Validation

- valid Web credential JSON
- malformed JSON
- missing fields
- wrong credential type
- whitespace-only values
- secret redaction

### URL Validation

- valid HTTPS URL
- localhost HTTP
- insecure remote HTTP warning
- invalid protocol
- trailing slash normalization

### Callback Detection

- Better Auth default
- Better Auth custom path
- Auth.js App Router
- Auth.js Pages Router
- missing route

### Semantic Verification

- exact redirect match
- redirect mismatch
- missing production URL
- credential JSON redirect mismatch

### Runtime Verification

- app starts
- route responds
- route missing
- app build failure
- timeout
- child process cleanup
- valid Google redirect
- secret redaction in logs

### Idempotency

Existing v0.2 tests must remain green.

---

## Runtime Timeout

Introduce a bounded timeout.

Example:

```text
startup timeout: 30 seconds
request timeout: 10 seconds
```

Use sensible defaults.

Make them configurable internally or through existing configuration conventions.

Do not allow runtime verification to hang indefinitely.

---

## Process Cleanup

Guarantee process cleanup on:

- success
- failure
- timeout
- exception
- SIGINT where feasible

Support Windows and Unix.

This matters because Keyset must work cross-platform.

Test process termination where practical.

---

## Cross-Platform Requirement

Runtime process handling must support:

```text
Windows
macOS
Linux
```

Do not introduce shell-specific assumptions.

Avoid commands such as:

```bash
kill -9
```

inside shared logic.

Use Node process APIs and cross-platform process termination strategies.

---

## Logging

Add or extend internal structured logging.

Levels may include:

```text
debug
info
warn
error
```

All output must pass through the existing redaction layer.

Runtime child process output must be sanitized before display.

Do not expose environment values.

---

## Documentation

Update:

```text
README.md
docs/PRD.md
docs/ARCHITECTURE.md
CHANGELOG.md
```

Document:

```bash
keyset doctor google
keyset doctor google --runtime

keyset verify google
keyset verify google --runtime
```

Explain static vs semantic vs runtime validation briefly.

Add troubleshooting examples for:

- wrong redirect URI
- missing route
- wrong credential type
- application boot failure

---

## Architecture

Keep the architecture:

```text
CLI
MCP
 │
 ▼
Core Verification Engine
 │
 ├─ Project Inspector
 ├─ Framework Adapter
 ├─ Provider Adapter
 ├─ Context Validator
 └─ Runtime Verifier
```

Do not put runtime verification logic directly in the CLI.

Do not duplicate it in MCP.

---

## Definition of Done

The milestone is complete when a valid supported project can run:

```bash
keyset verify google
```

and Keyset reliably confirms:

```text
✓ project detected
✓ framework detected
✓ Google provider configured
✓ credentials structurally valid
✓ callback route detected
✓ redirect URI internally consistent
```

And:

```bash
keyset verify google --runtime
```

also verifies:

```text
✓ application boots
✓ auth route responds
✓ generated Google authorization request is structurally valid
```

without:

- performing a Google login
- leaking secrets
- leaving orphan processes

The following invalid cases must produce actionable failures:

```text
wrong redirect URI
wrong credential type
missing auth route
missing provider
invalid production URL
application boot failure
```

All existing v0.2 tests must remain green.

Full repository verification must pass:

```bash
npm run verify
```

or the repository's existing equivalent.

---

## Final Report

At completion report only:

- main modules changed
- static/semantic/runtime checks implemented
- test results
- remaining limitations
- exact recommended v0.4 milestone

Do not provide a long implementation diary.