# MCP integration

Keyset exposes a local line-delimited JSON MCP server. A packaged installation
provides the stable `keyset-mcp` executable:

```bash
keyset-mcp
# or
keyset mcp serve
```

Both commands start the same local server. Only `setup_provider` mutates an
application project; the other tools are read-only or diagnostic.

Install the client entry safely with one of:

```bash
keyset mcp install codex
keyset mcp install claude
```

Codex uses `~/.codex/config.toml`; Claude Code uses `~/.claude.json`. Windows
uses the same paths below the platform home directory. `--config <path>` is
available for a controlled alternate file and `--home <path>` is useful for
isolated environments and tests.

Installation appends or adds only the `keyset` server. Existing servers are
preserved, repeated installs are no-ops, and an existing conflicting Keyset
entry is rejected. A real mutation is preceded by a numbered `.bak` backup and
written through a temporary file. Use `--dry-run` to inspect the intended
change without creating or changing a file.

The server reports CLI, MCP, and Core package versions through `server/info` and rejects mixed major versions.
Its tools are `inspect_project`, `list_providers`, `plan_provider_setup`,
`setup_provider`, `import_credentials`, `doctor`, and `verify_provider`.
Only `setup_provider` mutates an application. Project paths are validated and
raw secrets are redacted from responses.
