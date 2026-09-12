# Keyset

Keyset configures and verifies OAuth providers in existing Next.js projects. It
detects the project and authentication library, calculates the correct callback
URLs, stores credentials in an ignored local environment file, updates the auth
configuration idempotently, and checks the real authorization redirect.

It is intended for developers and coding agents that want a repeatable OAuth
setup workflow without copying client secrets through chat, logs, or source
files.

## What Keyset does

For a supported project, Keyset can:

- detect Next.js, Better Auth or Auth.js, the package manager, development port,
  auth route, environment files, and existing provider configuration;
- calculate authorized JavaScript origins and OAuth redirect URIs;
- create a Google Web OAuth client through a visible Chrome session with
  `--auto`;
- import existing Google Web credentials or GitHub OAuth App credentials;
- write credentials to `.env.local` without printing their values;
- add Google or GitHub to an existing Better Auth/Auth.js configuration while
  preserving other providers;
- avoid duplicate source changes and duplicate Google clients on repeated runs;
- roll local changes back if post-setup verification fails;
- run static, semantic, and optional runtime verification; and
- expose the same project-aware operations to agents through a local MCP server.

Keyset does not replace Better Auth or Auth.js. It configures their OAuth
provider integration and verifies the resulting flow.

## Supported surface

| Area | Supported |
| --- | --- |
| Framework | Next.js 14-compatible project shapes |
| Auth libraries | Better Auth, Auth.js / NextAuth.js |
| Providers | Google OAuth, GitHub OAuth |
| Automated cloud provisioning | Google Web OAuth client through visible Chrome |
| Interfaces | CLI, local MCP server, Provider SDK, Codex and Claude Code instructions |
| Runtime | Node.js 20 or newer |
| Package managers detected | npm, pnpm, yarn, Bun |

See [Compatibility](docs/COMPATIBILITY.md) for the exact tested matrix and
known limits.

## Installation

### Install from npm

The published CLI is available from the npm registry:

```bash
npm install -g @key-set/cli
keyset --version
```

You can also run it without a global install:

```bash
npx @key-set/cli --version
```

### Contributing and building from source

When contributing to Keyset or testing unreleased changes, install and link the
CLI from the repository:

```bash
git clone https://github.com/fatih-developer/keyset.git
cd keyset
npm install
npm run build
npm link --workspace=@key-set/cli
keyset --version
```

The link exposes both `keyset` and its bundled `keyset mcp` commands. Uninstall
the global source link later with:

```bash
npm unlink --global @key-set/cli
```

The npm scope is public, but publishing requires maintainer access to the
`@key-set` scope. Registry credentials must never be placed in this repository.

### Prerequisites

- Node.js 20 or newer;
- an existing Next.js project using Better Auth or Auth.js;
- Google Chrome for `keyset setup google --auto`;
- access to the Google Cloud project when using automatic Google setup; and
- an ignored `.env.local` file or a `.gitignore` rule that covers it.

Set `KEYSET_CHROME_PATH` when Chrome is installed in a non-standard location.

## Quick start: automatic Google OAuth

Run Keyset from the application directory:

```bash
cd path/to/your-nextjs-app
keyset inspect
keyset setup google --auto
keyset verify google --runtime
```

Or target a project explicitly:

```powershell
keyset setup google --auto --project H:\Project\my-app
```

The automatic flow works as follows:

1. Keyset inspects the application without executing project code.
2. It opens a normal, isolated Chrome profile at Google Cloud Console.
3. You complete Google login, two-step verification, and Cloud project
   selection. Keyset never asks for or reads your Google password.
4. Keyset completes the Google Auth Platform application information, audience,
   contact information, and finish steps. This includes accepting the required
   Google API Services User Data Policy for the selected project.
5. It creates a **Web application** OAuth client with the detected local origin
   and callback URI.
6. It reads the newly created Client ID and Client Secret in memory, writes them
   to `.env.local`, and never emits their raw values.
7. It updates the detected Better Auth or Auth.js source when needed.
8. It verifies the resulting configuration. Repeating the command on an already
   configured project returns `already_configured` without creating a new client.

For the default Next.js development port, the generated values are:

```text
Authorized JavaScript origin: http://localhost:3000
Redirect URI:               http://localhost:3000/api/auth/callback/google
```

Pass a deployed origin when both local and production URLs should be registered:

```bash
keyset setup google --auto --production-url https://app.example.com
```

If Google changes the Console UI and Keyset cannot safely finish, it stops
before applying newly read credentials, saves a diagnostic screenshot in the
system temporary directory, and leaves Chrome available for inspection.

## Manual Google setup

Preview the exact values first:

```bash
keyset setup google --dry-run
```

Then import an exported Google Web client JSON file:

```bash
keyset setup google --credentials ./client_secret.json
```

Or supply credentials non-interactively:

```bash
keyset setup google \
  --client-id "123456-example.apps.googleusercontent.com" \
  --client-secret "replace-with-the-real-secret"
```

Avoid command-line flags on shared machines because shell history may retain
their values. An exported credential file with restrictive permissions is safer.

Better Auth receives `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Auth.js
receives `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

## GitHub OAuth setup

GitHub provisioning is currently guided. Keyset calculates the homepage and
callback URL, then applies credentials from the OAuth App you create:

```bash
keyset setup github --dry-run
keyset setup github --client-id "your-client-id" --client-secret "your-client-secret"
keyset verify github
```

See [Providers](docs/PROVIDERS.md) for the GitHub console steps.

## Inspection, diagnostics, and verification

```bash
keyset inspect                         # detect project facts
keyset providers                       # list provider capabilities
keyset doctor                          # report actionable findings
keyset verify google                   # static and semantic checks
keyset verify google --runtime         # boot app and inspect OAuth redirect
keyset verify google --json            # machine-readable, redacted output
keyset init                            # create .keyset/config.json if absent
```

Runtime verification executes the detected project development command on a
temporary available port. Use it only for project code you trust. It verifies
the authorization redirect structure; it does not log into an end-user Google
account or complete the final callback.

Use `--project <path>` with any project command when the current directory is
not the target application.

## MCP for coding agents

The local MCP server lets compatible agents request typed OAuth operations
instead of reimplementing setup with unrestricted shell commands.

After installing/linking the CLI, register it with a supported client:

```bash
keyset mcp install codex
keyset mcp install claude
```

Preview the configuration change with `--dry-run`. Existing MCP servers are
preserved and real config mutations receive a numbered backup.

The agent workflow is:

```text
inspect_project
→ plan_provider_setup
→ import_credentials
→ setup_provider
→ verify_provider
```

Available MCP tools are `inspect_project`, `list_providers`,
`plan_provider_setup`, `import_credentials`, `setup_provider`, `doctor`, and
`verify_provider`. Only `setup_provider` changes an application project. MCP
responses redact secrets and the server does not expose a generic shell tool.

See [MCP](docs/MCP.md) and [Skills](docs/SKILLS.md) for client and agent setup.

## What changes in an application

Depending on the detected adapter, setup may change only:

- `.env.local`, using the adapter-specific Client ID and Client Secret names;
- the detected Better Auth or Auth.js configuration source; and
- `.keyset/config.json` when `keyset init` is explicitly run.

Provider packages do not edit source directly, and auth adapters do not create
cloud credentials. Core coordinates these boundaries and rolls back local
changes when verification fails.

## Security model

- Secrets are wrapped in a redacting value type and are not ordinary CLI/MCP
  output.
- `.env.example` is never treated as a credential source.
- Secret-bearing environment files are checked against `.gitignore`.
- Mutations are constrained to the inspected project root.
- Google automation uses a visible browser; login and 2FA remain under the
  user's control.
- Diagnostics, test fixtures, release archives, and source must contain no live
  credentials.

Review [Security](SECURITY.md) and the [Threat model](docs/THREAT-MODEL.md)
before using Keyset in security-sensitive automation. Report vulnerabilities
privately; never open an issue containing credentials.

## Repository structure

| Package | Responsibility |
| --- | --- |
| `@key-set/core` | Inspection, plans, transactions, secret-safe env writes, diagnostics, verification |
| `@key-set/cli` | User-facing `keyset` command and installation helpers |
| `@key-set/mcp` | Local MCP protocol and typed agent tools |
| `@key-set/google-automation` | Visible Chrome automation for Google Web client creation |
| `@key-set/provider-google` | Google and GitHub provider plans and credential validation |
| `@key-set/adapter-better-auth` | Better Auth detection and source mutation |
| `@key-set/adapter-authjs` | Auth.js detection and source mutation |
| `@key-set/sdk` | Provider plugin contracts |

Runtime and compatibility fixtures live under `examples/` and `compatibility/`.
Architecture and operational documentation lives under `docs/`.

## Development and release checks

```bash
npm install
npm run build
npm run typecheck
npm run test
npm run lint
npm run verify
npm run test:packed
node scripts/security/secret-sentinel.mjs
node scripts/security/package-audit.mjs
npm run release:rc
```

`npm run verify` runs lint, type checking, tests, and a complete workspace
build. `test:packed` installs generated package archives into an isolated
temporary project and exercises the distributed CLI and MCP entry points.
`release:rc` creates ignored, checksummed release archives under
`release-artifacts/`.

## Limitations

- Google Cloud Console automation depends on the current Console UI and an
  installed Chrome browser.
- Google login, 2FA, and project selection intentionally require the user.
- GitHub OAuth App creation is guided rather than browser-automated.
- Frameworks other than Better Auth and Auth.js are not currently supported.
- Production runtime verification is not a substitute for a complete real-user
  sign-in test.
- the published npm package is currently the recommended CLI installation path.

## Documentation

- [Installation](docs/INSTALLATION.md)
- [CLI](docs/CLI.md)
- [Google OAuth](docs/GOOGLE.md)
- [Better Auth](docs/BETTER-AUTH.md)
- [Auth.js](docs/AUTHJS.md)
- [MCP](docs/MCP.md)
- [Compatibility](docs/COMPATIBILITY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Provider SDK](docs/PROVIDER-SDK.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## License

Keyset is available under the [MIT License](LICENSE).
