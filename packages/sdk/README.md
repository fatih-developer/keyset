# @key-set/sdk

Public TypeScript contracts for Keyset provider packages.

Implement `ProviderPlugin` with honest capability metadata, deterministic setup planning, strict credential parsing into `SecretValue`, and verification hooks. Provider code must not mutate application files or expose secrets. Framework-specific source changes belong in an adapter package.

```ts
import type { ProviderPlugin } from "@key-set/sdk";
```

See the [Provider SDK guide](../../docs/SDK.md). The package is MIT licensed and targets Node.js 22+.
