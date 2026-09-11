# Keyset — Master Goal Prompt

Implement Keyset v0.1 according to `docs/PRD.md` and `docs/ARCHITECTURE.md`.

Execute the goal files under `goals/` in numeric order.

## Operating Rules

- Inspect existing repository state before every phase.
- Do not rewrite working code outside the current goal unless required to fix a discovered scope-related defect.
- Keep Core independent from CLI, MCP, skills, IDEs, agents, and LLMs.
- Use typed provider/auth-adapter contracts.
- Never expose secrets in logs, diffs, MCP responses, docs, fixtures, or commits.
- Prefer official provider APIs/tooling; fall back to explicit guided setup where automation is not officially supported.
- Keep mutations idempotent.
- Do not add unrelated providers or SaaS provisioning in v0.1.
- After each goal run the narrowest relevant tests, then run repository-wide validation when appropriate.
- If a goal reveals a design mismatch with the PRD, preserve the PRD's architectural boundaries and make the smallest sustainable correction.

## Completion Definition

Keyset must work without an LLM through CLI, expose the same core capabilities through MCP, support Google OAuth for Next.js projects using Better Auth or Auth.js, safely handle credentials, and provide useful doctor/verify diagnostics.
