# Repository Guidelines

## Project Structure & Module Organization

Keyset is a TypeScript npm-workspace monorepo. Runtime packages live under `packages/`: `core` contains the framework-independent domain, while `cli`, `mcp`, and `sdk` expose it to users and agents. Provider and authentication integrations belong in `provider-google`, `adapter-better-auth`, and `adapter-authjs`. Each package keeps source in `src/` and emits compiled output to `dist/`. Example applications are under `examples/`; agent guidance is under `skills/`; design, architecture, and project planning documents are under `docs/` and `goals/`.

Keep dependencies directed inward toward `@keyset/core`. Provider packages must not edit application source; auth adapters must not provision cloud credentials; CLI and MCP layers must delegate to Core.

## Build, Test, and Development Commands

Run these commands from the repository root with Node.js 20 or newer:

- `npm install` — install workspace dependencies.
- `npm run build` — compile every workspace package that defines a build script.
- `npm run typecheck` — run strict TypeScript checks without emitting files.
- `npm run lint` — run workspace lint scripts when present.
- `npm run test` — run workspace tests when present.
- `npm run verify` — run lint, typecheck, tests, and build in sequence.

The CI workflow runs `npm install` followed by `npm run verify`.

## Coding Style & Naming Conventions

Use strict TypeScript, ES2022, and NodeNext modules. Follow `.editorconfig`: two spaces, LF line endings, trimmed trailing whitespace, and a final newline. Use `PascalCase` for types/classes, `camelCase` for functions and variables, and kebab-case for package directories. Keep provider-specific behavior in provider packages and preserve secret-safe logging/output.

## Testing Guidelines

Add tests for behavior changes in the owning package. Name tests after the behavior or scenario they cover and keep fixtures free of real credentials. Run the focused package test command when available, then run `npm run verify` before submitting.

## Commit & Pull Request Guidelines

This checkout contains no Git history, so existing commit conventions cannot be verified. Use concise, imperative, scoped messages such as `core: add project inspection`. Pull requests should explain the behavior and architectural impact, link the relevant issue or goal, include tests run (normally `npm run verify`), and attach screenshots for UI or documentation presentation changes.

## Security & Configuration

Never commit secrets to source, fixtures, logs, examples, screenshots, or tests. Review `SECURITY.md` before handling credentials, and ensure MCP responses never expose raw secrets.
