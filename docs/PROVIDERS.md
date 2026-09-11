# Providers

Keyset currently exposes Google OAuth and GitHub OAuth through the same provider SDK shape. Provider packages own OAuth-specific knowledge; auth adapters own source mutations.

| Provider | Guided setup | Credential import | Redirect URI | Authorized origins | Runtime inspection |
| --- | --- | --- | --- | --- | --- |
| Google | Yes | Yes | Yes | Yes | Yes |
| GitHub | Yes | Yes | Yes | No | Yes |

GitHub setup is intentionally guided: create an OAuth App at GitHub Developer settings, using the generated application name suggestion, homepage URL, and `/api/auth/callback/github` callback URL. Keyset does not automate the browser or print client secrets.

Both Better Auth and Auth.js mutations accept a provider identifier, preserve existing entries, and return an unchanged mutation on repetition.
