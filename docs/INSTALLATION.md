# Installation

Keyset is distributed as an npm CLI. On a machine with Node.js 20 or newer:

```bash
npm install -g @keyset/cli
keyset --version
```

The CLI also works without a global install:

```bash
npx @keyset/cli --version
```

The packed-release smoke test is `node scripts/distribution/packed-install-smoke.mjs`.
It uses an isolated temporary project and does not read or change user config.

From the application directory, the first-run flow is:

```bash
keyset init
keyset mcp install codex       # optional
keyset mcp install claude      # optional alternative
keyset setup google --dry-run
keyset setup google
keyset verify google
```

`init` creates `.keyset/config.json` only when it does not already exist. It
contains project metadata and no credentials; rerunning it preserves an
existing file. Use `--project <path>` to target another project. `--json`,
`--dry-run`, and `--verbose` are suitable for automation and CI.

The published CLI carries its runtime package dependencies and does not rely
on a cloned repository or the caller's current directory. `keyset-mcp` is the
corresponding local MCP executable and can also be started with
`keyset mcp serve`.

Secrets are accepted through Keyset's supported credential options and are
redacted from output. Provider-console actions remain manual and are reported
separately.
