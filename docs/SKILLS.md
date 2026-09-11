# Agent skills

Keyset skills are small instructions for agents; provider behavior remains in
Keyset Core and its adapters. The repository includes starter instructions at
`skills/codex/SKILL.md` and `skills/claude-code/SKILL.md`.

For a user-level install, run:

```bash
keyset skills install codex
keyset skills install claude
```

The command writes a Keyset skill below the platform home directory
(`.codex/skills/keyset/SKILL.md` or `.claude/skills/keyset/SKILL.md`). Use
`--dry-run` first when desired. Existing different files are never overwritten;
an identical file is idempotent. `--config <path>` can point directly to a
controlled `SKILL.md` path.

The instructions tell the agent to inspect and plan before mutation, use
`setup_provider`, keep secrets out of chat, verify afterward, and report manual
provider-console work. They do not implement provider setup logic.

The packaged skill is intentionally instruction-only: it contains no provider
implementation or credentials. In automation, use `--dry-run` and a controlled
`--config` destination before allowing a mutation.
