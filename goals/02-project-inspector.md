# Goal 02 — Project Inspector

## Goal

Implement safe project inspection for the v0.1 Node.js/Next.js scope.

## Detect

- project root
- package.json
- package manager
- Next.js
- Better Auth
- Auth.js
- development command
- likely local port
- env files
- `.gitignore`
- likely production URL from safe config sources

## Rules

- Do not execute project scripts just to inspect the repository.
- Do not read unrelated files outside the project root.
- Return confidence/evidence for inferred values.
- Do not guess a production domain when evidence is absent.

## Test Fixtures

Create fixture projects for:

- Next.js + Better Auth
- Next.js + Auth.js
- unknown Node project
- existing env configuration

## Validation

All inspector tests must pass on Windows-compatible paths and POSIX paths.
