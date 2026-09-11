# Compatibility

This page describes the support level in the current repository checkout. A
combination is supported only when its framework, auth adapter, provider, and
Keyset interface are all covered below.

## Validated matrix

| Framework | Auth integration | Provider | Validated versions | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Next.js | Better Auth | Google OAuth | Next.js 14.2.15, Better Auth 1.2.0 | Tested | `examples/runtime-nextjs-better-auth` |
| Next.js | Better Auth | Google OAuth | Next.js 14.2.15, Better Auth 1.1.20 | Static/semantic fixture | `compatibility/next14-better-auth-legacy` |
| Next.js | Better Auth | Google OAuth | Next.js 14.2.15, Better Auth 1.2.0, pnpm | Static/semantic fixture | `examples/runtime-nextjs-better-auth-pnpm` |
| Next.js | Auth.js | Google OAuth | Next.js 14.2.15, `next-auth` 4.24.11 | Tested | `examples/runtime-nextjs-authjs` |
| Next.js | Auth.js | Google OAuth | Next.js 14.2.15, `next-auth` 4.24.10 | Static/semantic fixture | `compatibility/next14-authjs-legacy` |
| Next.js | Auth.js | Google OAuth | Next.js 14.2.15, `next-auth` 4.24.11, Bun | Static/semantic fixture | `examples/runtime-nextjs-authjs-bun` |
| Next.js | Better Auth | Google OAuth | Next.js `^14.0.0`, Better Auth `^1.0.0` | Fixture coverage; runtime behavior depends on installed versions | `examples/nextjs-better-auth-*` |
| Next.js | Auth.js | Google OAuth | Next.js `^14.0.0`, `next-auth` 4.24.11 | Fixture coverage; runtime behavior depends on installed versions | `examples/nextjs-authjs-*` |

The supported runtime baseline is Node.js 20 or newer. The CI matrix covers
Node.js 20 and 22; use Node.js 22 for the closest match to the validated
fixtures.

## Interface coverage

| Interface | Current status |
| --- | --- |
| CLI | Automated Google browser setup; guided Google/GitHub setup; inspect, doctor, verify, providers, init, and config |
| Local MCP server | Provider-aware planning, credential import, setup, doctor, and verify |
| Provider SDK | Google/GitHub provider contracts and capability metadata |
| Codex/Claude instructions | Repository skill sources and packed installation flow are provided |

## Expected to work

Other Next.js 14 projects using the same Better Auth or Auth.js configuration
shapes are expected to work when their auth route and environment variable names
match the adapter documentation. Run `keyset inspect`, `keyset doctor`, and
`keyset verify` before applying changes. “Expected” is not a compatibility
guarantee until a representative project passes the matrix checks.

## Unsupported in this release slice

- Next.js versions other than the validated 14.x fixtures.
- Auth frameworks other than Better Auth and Auth.js.
- Microsoft, Apple, Discord, hosted Keyset, and browser automation for provider consoles other than Google Cloud.
- Production runtime verification as a substitute for a real provider sign-in test.

If your project falls outside the table, open a feature request with a minimal
fixture description; do not include credentials.
