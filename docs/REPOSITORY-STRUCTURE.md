# Repository Structure

```text
keyset/
├─ .github/
│  └─ workflows/
├─ docs/
│  ├─ PRD.md
│  ├─ ARCHITECTURE.md
│  ├─ PROJECT-IDENTITY.md
│  ├─ REPOSITORY-STRUCTURE.md
│  └─ decisions/
├─ examples/
│  ├─ nextjs-better-auth/
│  └─ nextjs-authjs/
├─ goals/
├─ packages/
│  ├─ core/
│  ├─ cli/
│  ├─ mcp/
│  ├─ sdk/
│  ├─ provider-google/
│  ├─ adapter-better-auth/
│  └─ adapter-authjs/
├─ skills/
│  ├─ codex/
│  └─ claude-code/
├─ CONTRIBUTING.md
├─ SECURITY.md
├─ LICENSE
├─ package.json
└─ tsconfig.base.json
```

## Dependency direction

```text
CLI ─────┐
MCP ─────┤
SDK ─────┼──> Core
         │      ↑
Skills ──┘      │
         Provider/Auth adapters
```

Skills do not contain product logic. They teach agents how to invoke Keyset safely.
