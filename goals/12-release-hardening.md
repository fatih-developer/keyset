# Goal 12 — Open-Source Release Hardening

## Goal

Prepare Keyset v0.1 for public GitHub release.

## Requirements

- Complete README quick start.
- Architecture overview.
- Google provider limitations documented accurately.
- Security model documented.
- Threat-model section covering secret leakage, malicious repositories, MCP misuse, path traversal, and command injection.
- Contributor guide.
- Provider SDK guide.
- Example projects.
- CI for build/typecheck/test/lint.
- Package metadata and publish configuration.
- Changelog.
- No real credentials or personal paths in repository history/current tree.
- Dependency/license review.

## Release Gate

Run full test suite and inspect generated package contents before tagging v0.1.0.
