# Goal: Keyset v1.0 — Public Open-Source Release

## Objective
Ship Keyset v1.0 as a usable, documented and reproducible open-source developer tool.

Product promise:
> Configure supported OAuth providers safely from CLI or MCP, with project-aware setup and verification.

This milestone is about release completion, not expanding scope.

## v1.0 Supported Surface

### Providers
- Google OAuth
- GitHub OAuth

### Frameworks
- Better Auth
- Auth.js

### Application ecosystem
- supported Next.js configurations documented by compatibility matrix

### Interfaces
- CLI
- local MCP server
- Provider SDK
- Codex skill/instructions
- Claude Code skill/instructions

## Product Identity
Use consistently:
```text
Name: Keyset
Homepage: https://keyset.fatihunal.dev
CLI: keyset
MCP: Keyset MCP
```

Do not retain old working names.

## README
Rewrite the top-level README for public users. The first screen should explain:
1. what Keyset does
2. who it is for
3. minimal install command
4. minimal Google or GitHub setup command
5. why MCP exists

Avoid architecture-first documentation.

## Documentation Structure
Ensure public docs cover:
- Installation
- Quick Start
- Google
- GitHub
- Better Auth
- Auth.js
- CLI Reference
- MCP
- Skills / Agents
- Provider SDK
- Compatibility
- Security
- Troubleshooting
- Contributing

Avoid duplicate docs where one canonical page is enough.

## Website Readiness
Prepare documentation/site content for:
`https://keyset.fatihunal.dev`

If no site exists, create only the smallest maintainable docs/static site needed for launch. Do not build a marketing-heavy SaaS website.

## CLI UX Audit
Ensure:
```bash
keyset --help
keyset setup --help
keyset doctor --help
keyset verify --help
keyset providers
keyset mcp --help
```
are concise and consistent.

Experimental commands should be removed from public help or clearly marked experimental.

## Error UX
Common failures must have actionable remediation:
- unsupported project
- unsupported auth framework
- invalid credentials
- missing callback route
- redirect mismatch
- runtime boot failure
- MCP config failure

Do not dump raw stack traces by default. Debug output must remain redacted.

## Versioning
Set public packages to a coherent v1.0 semantic-versioning strategy. Document compatibility policy for CLI/Core/MCP, Provider SDK and provider packages.

## Publishing
Prepare and validate registry publishing:
- package names verified
- ownership/scope documented
- package tarballs tested
- provenance enabled where supported
- changelog finalized
- git tag/release process automated or precisely documented

Never include registry tokens in repository files.

## GitHub Release
Create release automation or instructions producing:
- Git tag
- GitHub Release
- release notes
- package artifacts where appropriate
- SBOM/provenance artifacts if available

## Open-Source Repository Hygiene
Finalize:
- LICENSE
- SECURITY.md
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md if appropriate
- issue templates
- bug report template
- feature request template
- pull request template

Avoid bureaucratic templates that add no value.

## Examples
Provide at least two realistic walkthroughs:
1. Next.js + Better Auth + Google
2. Next.js + Auth.js + GitHub

Use dummy placeholders only.

## MCP Example
Document the full agent flow:
```text
inspect_project
→ plan_provider_setup
→ import_credentials
→ setup_provider
→ verify_provider
```

Clarify that agents should rely on Keyset rather than reimplement provider orchestration.

## Skill Distribution
Ensure Codex and Claude Code instructions are installable or copyable from stable documented paths.

## Compatibility Page
Publish the exact validated matrix from prior milestones and clearly distinguish tested, expected-to-work and unsupported combinations.

## Final Security Gate
Before release:
- run full verification
- run compatibility matrix
- run secret sentinel suite
- inspect packed packages
- inspect release artifacts
- verify no real credentials exist in release branch/history where practical
- verify MCP exposes no generic shell/filesystem escape hatch

## Release Candidate
Create at least one RC build/tag or prerelease artifact. Install it into a clean environment and run:
```bash
keyset --version
keyset providers
keyset setup google --dry-run
keyset setup github --dry-run
```

Also start the distributed MCP server.

Do not declare v1.0 based only on monorepo-local execution.

## Definition of Done
Keyset v1.0 is complete when:
- distributed CLI installs and runs outside the monorepo
- distributed MCP starts correctly
- Google and GitHub setup flows pass supported compatibility tests
- runtime verification passes representative real projects
- docs are public-ready
- security/release gates pass
- package/release artifacts contain no secrets
- public metadata consistently points to `keyset.fatihunal.dev`
- versioned v1.0 artifacts can be reproducibly published

## Non-Goals
Do not delay v1.0 for Microsoft OAuth, Apple OAuth, Discord OAuth, Google Cloud Console browser automation, hosted Keyset, dashboard, billing, telemetry or enterprise features.

## Post-v1.0 Direction
Evaluate based on real usage:
- additional OAuth providers
- improved provider provisioning APIs
- remote/hosted MCP
- provider plugin ecosystem
- framework expansion
- CI automation
- optional managed secret integrations

Do not pre-commit architecture before usage data exists.

## Final Report
Return:
- exact v1.0 supported matrix
- packages/artifacts released or ready to release
- documentation status
- security/release gate results
- known limitations
- first recommended post-v1.0 milestone
