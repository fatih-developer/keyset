# CLI reference

The executable is `keyset`. Run it from the project root, or pass an explicit
project with `--project <path>`.

## Commands

```text
keyset inspect
keyset providers
keyset setup google [options]
keyset doctor [--runtime]
keyset verify [--runtime]
keyset init
keyset config
```

GitHub setup is also available through `keyset setup github`. The MCP server
can be run either as the separate `keyset-mcp` executable or through
`keyset mcp serve`.

## Google setup

Preview all planned changes without writing files:

```bash
keyset setup google --dry-run
```

Apply credentials supplied non-interactively:

```bash
keyset setup google \
  --client-id "1234567890-example.apps.googleusercontent.com" \
  --client-secret "dummy-google-secret"
```

The values above are documentation-only placeholders and are not valid
credentials. Prefer a secret manager or an ignored local environment file in
real projects. An exported Google Web application credential JSON file can be
passed with `--credentials <path>`.

Create the Google Web OAuth client through a visible, user-authorized browser
session and continue setup automatically:

```bash
keyset setup google --auto
```

The browser opens Google Cloud Console in an isolated normal Chrome profile.
Complete Google login and any two-step verification, then select the Cloud
project. Keyset performs the remaining Console steps and writes the result to
`.env.local`. Google Chrome must be installed, or its executable path must be
provided through `KEYSET_CHROME_PATH`.
`--auto` cannot be combined with `--dry-run` because it creates an external
OAuth client.

Useful options are `--production-url <https-url>`, `--json`, `--project <path>`,
and `--non-interactive`. Use `--json` for automation; output is redacted.

## Diagnostics

```bash
keyset inspect
keyset doctor
keyset doctor --runtime
keyset verify
```

`doctor` adds actionable findings. `verify` returns a non-zero exit code when
verification is invalid. Runtime checks start the detected development command,
so run them only when you trust the inspected project.

## Safety notes

Use `--dry-run` first. Keyset writes `.env.local` and the detected auth source
only after a plan is available; never use `.env.example` for real credentials.
Do not paste secrets into issues, logs, shell history, or chat transcripts.
