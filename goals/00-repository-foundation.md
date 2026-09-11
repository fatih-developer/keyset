# Goal 00 — Repository Foundation

You are implementing Keyset, an open-source, project/platform/LLM-independent authentication-provider provisioning tool.

Read `docs/PRD.md` and `docs/ARCHITECTURE.md` before making changes.

## Goal

Create the monorepo foundation without implementing provider behavior yet.

## Requirements

- TypeScript monorepo using pnpm workspaces.
- Node.js 22+.
- Create packages:
  - `core`
  - `cli`
  - `mcp-server`
  - `provider-sdk`
  - `provider-google`
  - `adapter-better-auth`
  - `adapter-authjs`
  - `test-fixtures`
- Shared TypeScript config.
- Shared lint/format/test configuration using the smallest reasonable toolset.
- Vitest.
- Build scripts for every publishable package.
- Root scripts: `build`, `test`, `typecheck`, `lint`.
- Add MIT license, contributing guide, security policy, and minimal root README.
- Do not add unnecessary framework abstractions.

## Validation

Run install, build, typecheck, and tests. Fix all scope-related failures.

## Output

Report only key files created, validation status, and real blockers.
