# Keyset skill routing and guarded workflows

## Purpose

Strengthen the agent instructions shipped with Keyset so provider setup is
predictable, reviewable, and secret safe. The goal is to turn the current
general guidance into an explicit workflow that agents can follow consistently
through the CLI, MCP server, Codex, and Claude Code.

This plan adapts useful patterns from Google's public Agent Skills repository:

- [Google skills repository](https://github.com/google/skills)
- [Google Skill Finder](https://raw.githubusercontent.com/google/skills/main/skills/developers/finding-google-skills/SKILL.md)
- [gcloud CLI skill](https://raw.githubusercontent.com/google/skills/main/skills/cloud/gcloud/SKILL.md)

The Google skills themselves are not a dependency of Keyset. Their product
specific instructions should only be used when a workflow actually targets a
Google product.

## Design principles

### 1. Route before loading or acting

Use a small skill catalog to select the narrowest applicable workflow instead
of loading every instruction for every request. Candidate Keyset workflows:

- `provider-setup`: configure or verify an OAuth provider;
- `project-inspection`: identify framework, auth adapter, package manager, and
  project boundaries;
- `google-oauth`: Google OAuth and Google Cloud Console actions;
- `github-oauth`: GitHub OAuth actions;
- `runtime-verification`: optional local runtime checks;
- `contributing`: build, test, and extend Keyset itself.

Each skill description must contain both positive routing criteria and explicit
negative boundaries. A workflow must state when it must not be used.

### 2. Inspect before mutation

No provider setup or source mutation should begin before inspection establishes:

1. the project root;
2. the framework and package manager;
3. the auth library and adapter;
4. the relevant auth source file;
5. the environment file and its ignore status; and
6. the development and production origins, when available.

Ambiguous or unsupported inspection results stop the workflow and produce a
diagnostic instead of a best guess.

### 3. Plan before execution

The normal provider workflow is:

```text
inspect → plan → review/approval → provider action → source/env mutation → verify
```

`--dry-run` must remain side effect free. A plan must list intended files,
environment keys, callback URLs, provider actions, and manual steps without
including secret values.

### 4. Validate the smallest executable unit

Before executing a provider-specific command or automation step, validate the
exact operation and its parameters. Parent-level knowledge is not enough. For
Keyset this means checking:

- the selected provider is supported;
- the detected adapter has an owning mutation implementation;
- callback URLs match the inspected project origins;
- the target environment file is ignored;
- the requested operation supports the current execution mode; and
- optional runtime verification has a bounded timeout and cleanup path.

### 5. Reduce output and protect secrets

Commands and MCP tools should return only fields required for the next decision.
Secret values must never appear in:

- plans;
- diagnostics;
- MCP responses;
- normal CLI output;
- logs or screenshots;
- fixtures and examples; or
- release artifacts.

Use stable redacted markers and structured status fields so agents can make
decisions without receiving credentials.

### 6. Separate provider and application responsibilities

Provider packages own provider metadata, credential parsing, and provider
specific validation. Auth adapters own source mutation. Core coordinates the
plan, transaction, rollback, and verification. CLI and MCP expose the same
domain operations and must not duplicate provider logic.

### 7. Verify outcomes, not just commands

An operation is not successful because a subprocess returned zero. After every
mutating workflow, verify the resulting environment and source state, then run
the supported provider checks. Long-running browser or runtime operations must
return bounded progress and a final status.

Failure results must distinguish:

- no changes made;
- local changes rolled back;
- local changes applied but verification failed;
- provider-side action completed and needs manual follow-up; and
- operation timed out or was cancelled.

## Proposed repository changes

### Phase 1: Harden existing agent skills

Update `skills/codex/SKILL.md` and `skills/claude-code/SKILL.md` with the shared
preconditions below:

- inspect first;
- plan before mutation;
- require approval for mutating setup;
- preserve secret-safe output;
- stop on ambiguity or unsupported adapters;
- verify after the operation; and
- report manual provider-console work separately.

Keep the two files client-specific only where their configuration paths or
installation commands differ.

### Phase 2: Add a shared provider setup skill

Create `skills/keyset-provider-setup/SKILL.md` as the canonical workflow for
provider setup. It should define:

- routing criteria and exclusions;
- the inspect, plan, approval, execute, and verify sequence;
- CLI and MCP entry points;
- dry-run behavior;
- secret handling requirements;
- rollback and failure reporting; and
- examples using placeholders only.

The Codex and Claude skills should refer to this shared workflow rather than
restate it.

### Phase 3: Add a generated skill catalog

Add a generated `skills/index.json` only if the number of Keyset workflows grows
enough to justify dynamic routing. The catalog should contain:

- a stable skill name;
- a concise description;
- positive and negative routing criteria; and
- the relative `SKILL.md` entrypoint.

The catalog must be generated from source metadata, not edited manually. A
loader should validate that the result is JSON, that every entrypoint exists,
and that only a small number of matching skills are loaded.

### Phase 4: Align runtime behavior with the instructions

Where the implementation does not already enforce the workflow, add focused
checks in the owning package:

- Core: plan and transaction state, rollback classification, and bounded
  verification results;
- CLI: explicit dry-run and approval presentation;
- MCP: structured redacted responses and bounded tool inputs;
- provider packages: provider-specific validation only; and
- auth adapters: deterministic, idempotent source mutation only.

Each behavior change must receive a focused test in its owning package.

## Explicit boundaries

Keyset skills must not instruct an agent to:

- bypass Google login, MFA, consent, or provider review;
- request or print a client secret when secure import is available;
- mutate an unrecognized auth source;
- create duplicate provider clients on repeated runs;
- use a general shell channel as a substitute for a typed Keyset operation;
- claim deployment, DNS, or infrastructure management as a Keyset feature; or
- report a provider-side side effect as automatically reversible when it is not.

## Acceptance criteria

- An agent always inspects before provider mutation.
- A dry run produces a complete redacted plan and no file or provider changes.
- An ambiguous adapter or unsupported project stops safely.
- Repeated setup remains idempotent.
- Failed verification clearly reports rollback state.
- CLI and MCP expose equivalent domain behavior.
- No credential value appears in output, fixtures, docs, or artifacts.
- The skill catalog, if introduced, is generated and validated in CI.
- Focused tests cover each new guardrail.

## Suggested implementation order

1. Update the two existing agent skills with the mandatory workflow and
   boundaries.
2. Add `skills/keyset-provider-setup/SKILL.md` and remove duplicated guidance.
3. Add or strengthen focused tests for dry-run, approval, redaction, ambiguity,
   idempotence, rollback, and post-change verification.
4. Introduce the generated catalog only after there are multiple shared
   workflows that need routing.
5. Re-run the full verification and the packed CLI/MCP smoke tests.

This order keeps the first change documentation-only, makes the shared contract
explicit, and delays catalog machinery until it solves a real routing problem.
