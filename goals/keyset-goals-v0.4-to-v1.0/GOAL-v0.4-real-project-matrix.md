# Goal: Keyset v0.4 — Real Project Matrix + Google Redirect Inspection

## Objective
Move Keyset runtime verification from controlled fixtures to realistic project combinations.

`keyset verify google --runtime` must work reliably across supported Next.js, Better Auth, Auth.js, Node and package-manager combinations and must inspect the actual Google authorization redirect produced by the application.

## Scope
Implement:
- realistic Next.js compatibility matrix
- Better Auth compatibility matrix
- Auth.js compatibility matrix
- App Router and Pages Router coverage where applicable
- Node.js 20 and 22 validation
- npm, pnpm and Bun project execution coverage
- real framework runtime boot
- Google authorization redirect inspection
- redirect-chain validation
- safe query-parameter redaction
- CI matrix
- compatibility reporting

Do not add a new OAuth provider in this milestone.

## Real Project Matrix
Create maintainable integration fixtures/projects covering at minimum:

### Better Auth
- supported Next.js App Router project
- current supported Better Auth release
- at least one older still-supported Better Auth release

### Auth.js
- Next.js App Router
- Next.js Pages Router where supported
- current supported Auth.js release
- at least one older still-supported release

Avoid fake fixtures that only imitate route responses. Projects should use actual framework/auth dependencies.

## Dependency Matrix
Represent the compatibility matrix as data rather than hardcoded CI duplication.

Example conceptual structure:
```ts
{
  framework: "better-auth",
  next: "x.y.z",
  auth: "x.y.z",
  node: 22,
  packageManager: "pnpm"
}
```

Keep the matrix intentionally bounded. Do not attempt exhaustive testing of every historical release.

## Runtime Execution
The runtime verifier must:
1. install dependencies if the matrix harness requires it
2. build or start the actual project
3. wait for localhost readiness
4. reach the framework auth entrypoint
5. inspect the Google authorization response
6. terminate all child processes

Separate project boot failure, auth route failure and Google configuration failure.

## Google Redirect Inspection
Inspect the actual authorization redirect without completing Google login.

Validate:
- destination is a legitimate Google OAuth authorization endpoint
- `client_id` is present
- expected `redirect_uri` is present
- `response_type` is valid
- required scopes are present
- callback URI matches Keyset's semantic plan

Do not follow the request into the Google login page.

## Sensitive Query Redaction
Never expose full values for:
- state
- nonce
- code_challenge
- code_verifier
- client_secret
- authorization codes
- tokens

## Redirect Chains
Support expected local redirect chains, set a strict maximum redirect count, detect loops, and never follow past the Google authorization endpoint.

## Package Managers
Validate project command resolution for pnpm, npm and Bun. Use the project's lockfile and package metadata. Do not silently rewrite the package manager.

## Node Versions
CI must verify at minimum Node.js 20 and 22. If Node 20 support is intentionally dropped, make that an explicit documented decision.

## Compatibility Report
Add a machine-readable compatibility output or CI-generated artifact including:
- Next.js version
- auth framework/version
- Node version
- package manager
- static result
- semantic result
- runtime result

## CI Matrix
Add bounded CI coverage across Linux, Windows, Node 20 and Node 22. macOS may remain best-effort if CI cost is excessive.

## Tests
Add coverage for:
- real Better Auth project boot
- real Auth.js App Router boot
- real Auth.js Pages Router boot where supported
- npm project
- pnpm project
- Bun project
- valid Google authorization redirect
- malformed redirect
- wrong redirect URI
- redirect loop
- missing client ID
- sensitive query redaction
- child process cleanup
- Windows-safe command execution

All previous v0.3 tests must remain green.

## Documentation
Update README.md, docs/ARCHITECTURE.md, docs/PRD.md and CHANGELOG.md. Document only combinations actually validated.

## Definition of Done
`keyset verify google --runtime` must successfully validate actual framework projects, not only synthetic route fixtures.

A valid project must reach a real Google authorization redirect and Keyset must verify that redirect without completing authentication or leaking sensitive query values.

Full repository verification and the bounded CI compatibility matrix must pass.

## Non-Goals
Do not implement Google Cloud Console browser automation, GitHub OAuth, hosted Keyset, dashboard, telemetry or billing.

## Final Report
Return:
- matrix combinations validated
- redirect inspection behavior
- CI environments tested
- failures/limitations discovered
- exact recommended v0.5 milestone
