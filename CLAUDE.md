# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Keyset configures and verifies OAuth providers (Google, GitHub) in existing Next.js projects that use Better Auth or Auth.js. It ships as a CLI (`keyset`), a local MCP server, and a provider SDK. TypeScript npm-workspace monorepo, Node.js >= 20, ESM (`NodeNext`), strict mode.

## Commands

Run from the repo root.

```bash
npm install
npm run build          # builds packages in explicit dependency order (see root package.json)
npm run typecheck      # builds first, then tsc --noEmit per workspace
npm run test           # every workspace's test script
npm run verify         # lint + typecheck + test + build — what CI runs
npm run test:packed    # packs tarballs, installs them into a temp project, smoke-tests CLI + MCP
node scripts/matrix/run.mjs [--runtime]   # compatibility matrix over examples/ (runtime boots the apps)
node scripts/security/secret-sentinel.mjs --scan
node --test scripts/security/*.test.mjs
```

- `npm run lint` is currently a no-op: no workspace defines a `lint` script.
- Tests use the built-in `node:test` runner. They are `.mjs` files in `packages/<pkg>/test/`, and they import from `../dist/index.js`, so **source must be compiled before tests see a change**. Each package's `test` script runs `build` first (except `sdk`).
- To test one package: `npm run test --workspace=@key-set/core`
- To run a single test, build first, then: `node --test --test-name-pattern="redacts secret" packages/core/test/core.test.mjs`
- Cross-package imports (`@key-set/*`) resolve to the workspace packages' `dist/` output. After you edit a dependency such as `core`, rebuild it (or run `npm run build`) before you build or test its consumers.
- CI runs on ubuntu and windows with Node 20 and 22. It also installs Bun and pnpm 9.15.0 because the runtime matrix includes Bun and pnpm example apps.

## Architecture

The dependency rule is that everything depends inward on `@key-set/core`. Core must not depend on the CLI, MCP, the SDK, skills, LLMs, IDEs, or browser automation (ADR `docs/decisions/0001-core-independence.md`, `docs/ARCHITECTURE.md`).

- **`core`** handles project inspection (`inspectProject`, which is static and never runs project scripts), callback URL calculation, setup plans, `SecretValue` and `redact`, env file writes (`updateEnvFile`), project-root path guards (`assertProjectPath`), `doctor`, and layered verification (`verifyProject`, which runs static, semantic, and optional runtime checks).
- **`setupProvider`** in core is the setup transaction. It builds a plan, writes `.env.local`, applies the auth-adapter source mutation, verifies the result, and restores every changed file on failure. It does not import adapters or providers. Callers inject them through `SetupProviderDependencies` (`importCredentials`, `mutateSource`, `sourceConfigured`, `plan`).
- **`cli`** (`src/index.ts`) and **`mcp`** (`src/index.ts`) each assemble that dependency object separately, choosing adapter × provider. When you add a provider or adapter, or change the wiring, update **both** places. CLI and MCP must hold no provider business logic; they parse input, delegate to core, and pass output through `redact()`.
- **`provider-google`** holds the provider-side logic for **both Google and GitHub** (`src/github.ts`): plans and credential import/validation. Provider packages must not edit application source.
- **`adapter-better-auth`** and **`adapter-authjs`** handle detection and idempotent source mutation of the app's auth config. They never create cloud credentials. Their env var names differ: Better Auth uses `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, and Auth.js uses `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`.
- **`google-automation`** uses Playwright to drive a visible Chrome session for `setup google --auto`. Only the CLI uses it.
- **`sdk`** holds the provider plugin contracts.
- **`cli/src/distribution.ts`** holds the version-compatibility check and the `mcp install` / `skills install` config writers for Codex and Claude.
- The MCP server is a hand-rolled newline-delimited JSON-RPC loop over stdio, not an MCP SDK. Its tools are in `toolNames`, and `setup_provider` is the only one that mutates a project.

Fixtures:

- `examples/*` are workspaces: fixture Next.js apps named for their scenario (`-empty`, `-existing-provider`, `-google-configured`, `runtime-*`).
- `compatibility/` holds Next 14 legacy apps.
- `scripts/matrix/compatibility-matrix.json` maps fixtures to expected framework, versions, and package manager.

When you add a workspace package, also add it to the ordered `build` script in the root `package.json`.

## Constraints

- Treat inspected projects, package scripts, and MCP arguments as untrusted input. Keep file writes inside the canonical project root, and don't add shell execution driven by arbitrary input.
- Secrets travel as `SecretValue`, which serializes to `[REDACTED]`. Any new output path (CLI, MCP, diagnostics, runtime child output) must go through `redact`/`redactUrl`.
- `.env.example` is never a credential source. Env files that hold secrets must be gitignored.
- Test fixtures use only fake credentials that are clearly fake. `secret-sentinel.mjs` scans the repo for known sentinel strings.
- Mutations must be idempotent. Re-running setup on a configured project returns `already_configured`.
- Provider integrations must declare their automation capability honestly: `full_automation`, `partial_automation`, or `guided_setup`.

## Conventions

- Existing source is written in a dense style with many single-line functions and `if` chains. Match the style of the surrounding code.
- Commit messages are scoped and imperative: `core: ...`, `mcp: ...`, `release: ...`, `docs: ...`, `security: ...`.
- `docs/` contains the PRD, threat model, and per-feature docs. `goals/` contains numbered implementation goal files that drive the roadmap. `AGENTS.md` contains the equivalent guidance for Codex.

## Site (`site/`)

- `site/` holds the marketing site and docs for https://onset.fatihunal.dev. It is a standalone Next.js static export with its own lockfile. It is not an npm workspace, so root `npm run verify` does not cover it.
- Run site commands from `site/`: `npm run build` (writes `out/`), then `npm run typecheck`, `npm run lint`, and `npm run check:links`. CI runs these in `.github/workflows/site.yml`.
- **Onset** is the umbrella brand; Keyset is its first product. The name exists only on the site: the code, the `@key-set/*` scope, and the `keyset` CLI are unchanged.
- Products other than Keyset are "in development". They never get links or commands on the site (`site/content/products.ts`).
- The site renders `docs/*.md` at build time, but only the files in the allowlist in `site/lib/docs.ts`. When you add a user-facing doc, add it to the allowlist. Internal docs (PRD, landing brief, release notes) must stay unpublished.
- Commands shown on the site live in `site/lib/commands.ts` and must match the real CLI. Two examples: the MCP entry is `keyset-mcp` with `args: []`, and the primary CLI installation is `npm install -g @key-set/cli`; source linking is for contributors.
- All copy lives in `site/content/i18n/{en,tr}.ts`. The Turkish dictionary is type checked against the English one.
