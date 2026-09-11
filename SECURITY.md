# Security Policy

Keyset handles credential material and must be treated as security-sensitive software.

## Supported versions

Before v1.0, only the latest release on the default branch is supported for security fixes. After v1.0, maintainers intend to support the latest v1.x release and the immediately preceding minor release. Development snapshots and end-of-life versions may not receive fixes.

## Reporting a vulnerability

Do not open a public issue containing client secrets, OAuth credentials, access tokens, refresh tokens, private keys, or unredacted environment files. Use GitHub's private vulnerability reporting/security-advisory channel for this repository, or contact the maintainers privately through the project homepage: <https://keyset.fatihunal.dev>.

Include the affected version/commit, impact, reproduction steps or a minimal fixture, and any suggested mitigation. Redact all live credentials; use clearly fake values such as `KEYSET_TEST_ONLY_SENTINEL`.

Maintainers will acknowledge a report when practical, confirm the affected version, coordinate a fix and disclosure timeline, and credit the reporter if requested. Do not test against systems or accounts you do not own.

## Secret handling rule

Keyset's design rule is that secrets are never ordinary output. CLI output, MCP responses, telemetry, diagnostics, fixtures, screenshots, snapshots, rollback data, child-process logs and CI artifacts must redact secret material by default. If a secret may have been exposed, revoke/rotate it first and report the incident privately.

See [the threat model](docs/THREAT-MODEL.md) for trust boundaries, limitations and release gates.
