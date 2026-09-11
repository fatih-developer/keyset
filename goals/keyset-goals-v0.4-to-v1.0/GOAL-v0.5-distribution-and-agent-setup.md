# Goal: Keyset v0.5 — Distribution + Global CLI/MCP Setup UX

## Objective
Make Keyset installable and usable by another developer without knowledge of the repository internals.

A new user must be able to install Keyset, initialize MCP integration, and use the CLI from an arbitrary project with minimal manual configuration.

## Primary User Journeys
```bash
npm install -g <published-keyset-cli-package>
keyset --version
keyset init
keyset setup google
```

and:
```bash
keyset mcp install
```

or an equivalent cross-platform setup command that configures a supported MCP client safely.

Do not require cloning the Keyset repository.

## Scope
Implement:
- production CLI package entrypoint
- package publishing structure
- global/local execution
- `keyset init`
- MCP server executable
- MCP client configuration generation
- agent/skill installation UX
- cross-platform paths
- version reporting
- update/version compatibility checks
- installation smoke tests
- first-run documentation

## Package Boundaries
Stabilize responsibilities for core, cli, mcp, sdk, provider-google, adapter-better-auth and adapter-authjs. Public package names may use the chosen npm scope, but internal architecture must not depend on a specific personal npm account.

## CLI Distribution
Ensure the CLI:
- exposes a proper executable/bin
- starts quickly
- resolves workspace dependencies correctly after publish
- does not depend on repository-relative paths
- works from unrelated project directories
- returns deterministic exit codes

Validate:
```bash
keyset --help
keyset --version
keyset providers
keyset inspect
keyset setup google --dry-run
```

## Local Execution
Support at least one documented and tested zero-install invocation such as `npx`, `pnpm dlx` or `bunx`.

## Keyset Init
`keyset init` should inspect the current project, create only required non-secret configuration, avoid overwriting existing configuration unexpectedly and be idempotent.

## MCP Server Distribution
Expose a stable executable for the MCP server, ideally through `keyset mcp serve` or a single dedicated executable. MCP must reuse Core.

## MCP Client Setup
Provide setup helpers for at least:
- Codex
- Claude Code

Example:
```bash
keyset mcp install codex
keyset mcp install claude
```

Requirements:
- detect target config location
- show intended changes
- support `--dry-run`
- preserve unrelated MCP servers
- avoid duplicate Keyset entries
- safe backup/rollback
- reject unknown config formats

## Skill Installation
Provide documented or automated installation for Codex and Claude Code skills. Skills must contain instructions only and must not duplicate Core logic.

## Cross-Platform Paths
Support Windows, macOS and Linux using platform APIs for home/config paths, separators and executable lookup.

## Version Compatibility
Expose versions for CLI, MCP and Core. MCP should report Keyset version in server metadata. Add compatibility guards where independently installed package versions can conflict.

## Installation Smoke Tests
Pack release artifacts and install them into temporary projects. Run CLI and MCP smoke tests from the packed artifacts, not only from workspace source.

## Security
Installer/setup commands must:
- never print secrets
- never scan unrelated home-directory content
- modify only supported config files
- preserve existing configuration
- support dry-run before mutation

## Documentation
Update:
- README.md
- docs/INSTALLATION.md
- docs/MCP.md
- docs/SKILLS.md
- CHANGELOG.md

First-run flow:
Install → initialize → install MCP integration (optional) → setup Google → verify.

## Definition of Done
A developer on a clean machine/project can install a packed Keyset release and run `keyset setup google` without cloning the monorepo.

Codex and Claude Code can use the packaged MCP server without manual source edits.

Installation smoke tests must run on Windows and Linux CI.

## Non-Goals
Do not add a new provider, hosted service, Google Console browser automation, telemetry or billing.

## Final Report
Return:
- install methods verified
- MCP clients supported
- skill install behavior
- packed-package smoke test results
- exact recommended v0.6 milestone
