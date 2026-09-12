# Provider SDK

Provider integrations implement the typed `ProviderPlugin` contract exported by `@key-set/sdk`. A plugin declares metadata and capability honestly, checks prerequisites, creates a `SetupPlan`, imports credentials into `SecretValue` wrappers, and validates the resulting project.

```ts
const provider: ProviderPlugin = {
  metadata: { id: "example", name: "Example OAuth", capabilities: ["guided_setup"] },
  prerequisites: () => [],
  plan: root => makePlan(root),
  importCredentials: input => parseCredentials(input),
  validate: root => validateProject(root),
};
```

Use typed actions for automatic or manual work. Do not expose arbitrary shell commands, log credential contents, or put provider business logic in CLI/MCP handlers.
