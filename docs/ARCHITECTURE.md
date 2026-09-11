# Keyset Architecture

## Dependency Rule

All interfaces depend inward on Core. Core must not depend on CLI, MCP, skills, or LLM-specific code.

```text
Codex / Claude / Cursor / Custom Agent
                |
              Skills
                |
                v
             MCP Server
                |
                v
CLI ----------> Core <---------- SDK Consumers
                |
       +--------+---------+
       |                  |
 Provider Adapters   Auth Adapters
       |                  |
     Google        Better Auth/Auth.js
```

## Core Modules

- project inspection
- normalized config
- setup planner
- operation executor
- doctor engine
- verification engine
- secret-safe logger
- filesystem transaction helpers
- setup orchestrator coordinating inspection, credential persistence, adapter mutation, rollback, and verification

## v0.2 Setup Transaction

`setupProvider` builds a plan before mutation, writes only approved local environment files, applies a typed auth-adapter mutation, then verifies. It restores every changed file if a later step fails. CLI and MCP pass inputs to this Core function; neither contains provider-specific setup logic.

## Layered Verification

`verifyProject` returns static checks (files, framework, provider, credentials), semantic checks (URL and callback route), and optional runtime checks. Runtime verification uses a bounded localhost child process and always terminates it; child output is redacted before it can become a diagnostic.

## Provider Boundary

Provider adapters own provider-side provisioning logic only.

They do not edit application source files.

## Auth Adapter Boundary

Auth adapters own application integration logic only.

They do not create cloud OAuth credentials.

## CLI Boundary

CLI parses human input, renders results, and calls Core services.

No provider-specific business logic belongs in CLI.

## MCP Boundary

MCP converts typed tool calls to the same Core service methods used by CLI.

It must never return raw secrets in textual or structured output.

## Skills Boundary

Skills are optional agent instructions. They contain workflow guidance only and must not be required for Keyset to work.
