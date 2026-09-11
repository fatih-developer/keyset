# Goal: Keyset v0.7 — Security Hardening + Release Readiness

## Objective
Prepare Keyset for safe public open-source use before declaring v1.0.

Focus on threat boundaries, secret handling, dependency/supply-chain safety, package correctness, contributor safety and deterministic release preparation.

## Scope
Implement:
- threat model
- secret-leak audit
- filesystem mutation hardening
- symlink/path traversal defenses
- subprocess safety review
- MCP trust-boundary review
- dependency audit
- package provenance/release metadata
- SBOM generation where practical
- secure CI permissions
- release candidate pipeline
- public documentation audit

## Threat Model
Create `docs/THREAT-MODEL.md` covering:
- malicious repository content
- malicious package scripts
- poisoned auth config source
- secret exposure through logs
- MCP client/server trust boundary
- path traversal
- symlink attacks
- command injection
- environment-variable leakage
- credential files
- rollback/backup leakage
- CI artifacts
- third-party provider metadata

Clearly document what Keyset does not protect against.

## Repository Trust Boundary
Assume inspected projects may contain hostile content. Static inspection must not execute arbitrary project scripts. Runtime verification remains explicit and higher risk.

## Filesystem Safety
Before mutating:
- resolve canonical paths
- enforce project-root boundaries
- detect unsafe symlink traversal where relevant
- reject writes outside expected targets
- use atomic writes where practical
- preserve permissions
- keep rollback snapshots secret-safe

Do not leave credential-bearing backup files indefinitely.

## Subprocess Safety
Requirements:
- no shell interpolation of untrusted strings
- prefer argv arrays
- bounded timeouts
- bounded output capture
- process cleanup
- localhost binding
- sanitized logs

Detected project commands must come from controlled logic, not arbitrary prompt-generated shell text.

## Secret Audit
Inject sentinel secrets and verify they never appear in:
- CLI stdout/stderr
- MCP responses
- debug logs
- exceptions
- dry-run diffs
- snapshots
- runtime child logs
- generated reports
- CI artifacts

Automate this as a regression suite.

## MCP Security
Document and enforce:
- MCP capabilities
- local filesystem boundary
- no secret echo
- no generic shell execution tool
- no arbitrary file-write tool outside supported mutations

MCP must expose domain tools, not act as a remote shell.

## Dependency Security
Add standard automated checks for known vulnerable dependencies, lockfile integrity and updates.

## CI Permissions
Use least-privilege GitHub Actions permissions. Publishing credentials must never be available to untrusted PR jobs.

## Package Audit
For every published package validate:
- `files`
- exports
- bin
- license
- README
- repository metadata
- exclusion of internal fixtures
- exclusion of secret-bearing artifacts

Inspect packed tarballs in CI.

## Provenance and SBOM
Enable registry provenance/attestation where supported. Generate a machine-readable dependency inventory/SBOM as a release artifact where practical.

## Security Policy
Complete `SECURITY.md` with supported versions, vulnerability reporting process and explicit warning not to disclose live secrets in public issues.

## Contributor Safety
Review CONTRIBUTING.md, AGENTS.md, issue templates and PR template. Require fake credentials in tests/examples.

## Release Candidate Pipeline
RC pipeline must perform:
1. install
2. lint
3. typecheck
4. unit tests
5. integration tests
6. compatibility matrix
7. packed-package smoke tests
8. secret sentinel tests
9. dependency/security checks
10. package-content audit

v1.0 release must be blocked if mandatory checks fail.

## Documentation Audit
Review public docs for stale naming, incorrect package names, unsupported compatibility claims, accidental secrets, development-only commands, missing Windows instructions and missing MCP trust explanation.

Use `https://keyset.fatihunal.dev` consistently as project homepage where applicable.

## Definition of Done
Keyset has a documented threat model, automated secret-leak regression suite, hardened mutation/subprocess boundaries, least-privilege CI, audited package tarballs and a repeatable RC pipeline.

All existing functionality remains green.

## Non-Goals
Do not add providers, hosted dashboard, billing, analytics or Google Console browser automation.

## Final Report
Return:
- security boundaries hardened
- automated leak tests added
- release checks added
- unresolved release blockers
- exact recommended v1.0 milestone
