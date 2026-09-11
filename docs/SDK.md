# Provider SDK v1 candidate

Provider packages implement `ProviderPlugin` from `@keyset/sdk`. The stable surface consists of provider identity and capability metadata, prerequisites, deterministic setup planning, credential importing into `SecretValue`, environment requirements, redirect planning, validation hooks, and safe remediation diagnostics.

```ts
const provider: ProviderPlugin = {
  metadata: {
    id: "example", name: "Example OAuth", protocol: "oauth2", supported: true,
    capabilities: {
      guidedProvisioning: true, credentialImport: true, redirectUris: true,
      authorizedOrigins: false, runtimeAuthorizationInspection: false,
    },
  },
  prerequisites: () => [],
  plan: root => makePlan(root),
  importCredentials: input => parseCredentials(input),
  validate: root => validateProject(root),
};
```

Credential import must reject malformed or incomplete input and return `SecretValue` instances. Secrets must not appear in plans, diagnostics, verification messages, tests, or logs. Setup plans should be pure and repeatable. Framework-specific source changes belong in an adapter package; provider code should not edit application files directly.

Use the capability flags to avoid assuming that every OAuth provider has Google-style authorized origins. A provider can add `redirectPlan`, `verifyStatic`, `verifySemantic`, `inspectRuntime`, and `diagnostics` when the corresponding knowledge is available.
