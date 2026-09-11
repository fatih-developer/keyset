# Troubleshooting

Start with redacted diagnostics:

```bash
keyset inspect --json
keyset doctor --json
keyset verify --json
```

## Unsupported project

If inspection reports no Next.js framework or no Better Auth/Auth.js adapter,
Keyset cannot safely plan a mutation. Use a supported project shape or provide
a minimal fixture when requesting support.

## Missing credentials

Use the environment names for your adapter: `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` for Better Auth, or `AUTH_GOOGLE_ID` and
`AUTH_GOOGLE_SECRET` for Auth.js. Put them in an ignored `.env.local` file and
rerun `keyset doctor`.

## Redirect mismatch

Run `keyset setup google --dry-run` and copy the exact origin and callback into
the Google Web application client. Check protocol, port, trailing path, and
production URL. A local callback is normally
`http://localhost:3000/api/auth/callback/google`.

## Missing callback route

Ensure the active route exports the framework’s auth handler and that the file
is in the route location detected by Keyset. Run `keyset inspect` to confirm
the project and adapter it sees.

## Runtime boot failure

Run the project’s development command directly, fix its first boot error, and
then retry `keyset verify --runtime`. Runtime verification executes a detected
development command and should only be used with trusted project code.

## MCP configuration failure

Use the separately built `keyset-mcp` executable and configure the client to
launch it with the project path as its working directory. The server accepts
domain tools only; it is not a generic shell. Check that the requested project
is inside the allowed working directory and retry with a dry-run setup.

Never include credentials or full `.env` files in diagnostic output. Redact
values before filing a report; see [Security](../SECURITY.md).
