# Contributing to Keyset

Keep changes small, testable, and inside the architectural boundaries defined in `docs/ARCHITECTURE.md`.

Before submitting a change:

1. Do not introduce secret values into source, fixtures, logs, examples, screenshots, or tests.
2. Keep provider logic inside provider packages.
3. Keep auth-library source mutation inside auth-adapter packages.
4. Keep `@keyset/core` independent from MCP, LLMs, IDEs, agents, and UI automation.
5. Add tests for behavior changes.
6. Run `npm run verify`.

Security and release safety:

7. Use fake, unmistakable credentials only (for example `KEYSET_TEST_ONLY_SENTINEL`); never paste values from `.env`, cloud consoles, browser profiles, or credential files.
8. Do not add arbitrary shell execution, prompt-generated commands, unrestricted file writes, or path handling that bypasses canonical project-root checks.
9. Treat inspected repositories, package scripts, provider metadata and MCP arguments as untrusted input. Static checks must not execute project lifecycle scripts.
10. Run `node scripts/security/secret-sentinel.mjs --scan` and `node --test scripts/security/*.test.mjs` when changing output, diagnostics, mutation, MCP, packaging or CI behavior.
11. Do not include secrets in issue/PR descriptions, test output, screenshots, snapshots, tarballs, SBOMs or generated reports. Report suspected exposure privately using `SECURITY.md`.

Pull requests should describe security-sensitive behavior, trust-boundary changes, tests run, and rollback considerations. Maintainers may require the release-candidate workflow before merge.

New provider integrations must declare their automation capability honestly: full, partial, or guided.
