# @keyset/provider-google

Google and GitHub OAuth provider implementations for Keyset's provider SDK.

This package creates deterministic console setup plans and imports OAuth client credentials without returning plain secrets. It does not automate provider consoles. GitHub support is exposed as `createGithubProvider` and `importGithubCredentials`.

```ts
import { createGoogleProvider, createGithubProvider } from "@keyset/provider-google";
```

See [Google](../../docs/GOOGLE.md), [GitHub](../../docs/GITHUB.md), and the [compatibility matrix](../../docs/COMPATIBILITY.md).
