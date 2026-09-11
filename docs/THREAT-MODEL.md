# Keyset Threat Model

Status: v0.7 release-readiness baseline  
Scope: `@keyset/core`, CLI, SDK, provider and auth adapters, and MCP integration

## Security objective

Keyset inspects a project, plans supported provider changes, and may apply a small set of typed local mutations. Secrets are treated as sensitive data and must not become ordinary output. The safest default is read-only inspection; runtime verification and mutation are explicit, higher-risk operations.

## Trust boundaries

| Boundary | Untrusted input | Required control |
| --- | --- | --- |
| Inspected repository | Source, manifests, scripts, symlinks, filenames and metadata | Static inspection must not execute project scripts. Resolve paths and enforce the project-root boundary. |
| Runtime verification | Project-selected framework command and local HTTP server | Use controlled commands only, argv-based process creation, bounded startup/output/time, localhost binding and cleanup. |
| Credentials/environment | Environment variables, credential files and CLI/MCP arguments | Accept secrets only through explicit inputs, redact before output, never log or include in snapshots/reports. |
| CLI | Local user and filesystem | Use the same Core policy as other adapters; do not interpret arbitrary shell text. |
| MCP client/server | Agent-supplied structured tool arguments and returned results | Expose typed domain operations, identify mutations, enforce local boundaries and never provide a generic shell or arbitrary file-write primitive. |
| Provider metadata | Third-party URLs, OAuth metadata and provider responses | Validate schemes/hosts and treat metadata as data, not executable instructions. |
| CI/release | Pull-request code, dependencies, build outputs and credentials | Read-only job permissions, no publishing secrets in untrusted PR jobs, ignore install scripts during audit installs, inspect packed artifacts. |

## Threats and mitigations

### Hostile repository content

An inspected project may contain a malicious `package.json`, postinstall script, source file, filename, symlink or README. Inspection must parse and read bounded data without running package scripts. Runtime verification is opt-in, must use a controlled command selected by trusted logic, and must have bounded time, output and process cleanup.

### Path traversal and symlink attacks

Every mutation target must be resolved canonically, checked relative to the canonical project root, and rejected if it escapes that root. Symlinked targets and parent directories require an explicit safe policy; a path that resolves outside the root is unsafe. Writes should be atomic where practical, preserve permissions, and never leave credential-bearing backups indefinitely.

### Command injection and subprocess abuse

Untrusted strings must never be interpolated into a shell command. Subprocesses use executable-plus-argv arguments, a bounded timeout, bounded stdout/stderr capture, localhost-only listeners and guaranteed cleanup. Prompt-generated shell text is not a supported command source.

### Secret exposure

Secrets can enter through environment variables, OAuth client secrets, credential files, exceptions, debug logs, dry-run diffs, rollback snapshots, child-process output, MCP responses and CI artifacts. Secret-bearing values must be represented by secret-safe types at boundaries, redacted before serialization, and excluded from reports, fixtures, screenshots and artifacts. The repository sentinel suite provides a regression guard for known test sentinels and output capture.

### MCP trust boundary

MCP is an adapter to typed Core operations, not a remote shell. A client may request supported inspection, planning, verification or explicitly described mutations, but must not select arbitrary executables, write arbitrary paths, read arbitrary credential files, or receive raw secret values. Deployment operators remain responsible for authenticating and authorizing MCP connections.

### Dependency and supply-chain compromise

Malicious package scripts, typosquatted packages, vulnerable transitive dependencies and changed lockfile resolutions can compromise a developer or CI runner. CI installs with lifecycle scripts disabled for audit jobs, verifies the lockfile through clean installation, runs dependency vulnerability checks, audits package contents and emits an SBOM for release candidates. Dependencies are reviewed before updates.

### CI and artifact leakage

Pull requests run with least-privilege read permissions and no publishing credentials. Release jobs are isolated from untrusted PR execution. Tarballs and SBOMs are inspected for credential files, fixtures, source maps and private material before upload; artifacts are treated as public.

### Third-party provider metadata

Provider-discovered origins, redirect URIs, issuer metadata and error messages may be malformed, misleading or sensitive. Validate provider URLs and expected hosts, do not follow arbitrary URLs, and redact credentials and authorization data from diagnostics.

## Assets

OAuth client IDs/secrets, refresh tokens, private keys, environment files, project source, auth configuration, rollback data, CI tokens, package provenance and user trust are protected assets. Confidentiality and integrity are primary; availability is protected with bounded resource use.

## What Keyset does not protect against

- A compromised host, operating system, developer workstation, Node runtime or CI provider.
- A user who deliberately grants an untrusted process access to the project, environment or credentials.
- Malicious code that the user explicitly chooses to run during runtime verification.
- A compromised third-party provider, registry, GitHub account, maintainer account or signing/provenance authority.
- Secrets already exposed outside Keyset, including shell history, editor telemetry, process listings or provider logs.
- Network, DNS, TLS or identity failures outside the validated checks performed by Keyset.

## Release acceptance

Before v1.0, the release candidate must pass the security workflow, clean dependency installation, unit/integration and compatibility checks, package tarball audit, sentinel tests and SBOM generation. Any secret leak, unsafe package content, failed mandatory check or unexplained security regression blocks release until resolved or explicitly accepted by maintainers with a documented rollback plan.
