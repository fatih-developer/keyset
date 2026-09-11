# GitHub OAuth

Keyset supports GitHub OAuth Apps through the same guided provider flow as
Google. Run `keyset setup github --dry-run` for the suggested application name,
homepage URL, and callback URL, then create the app at
<https://github.com/settings/developers>.

Do not copy a Google setup plan and substitute GitHub credentials: callback
paths, environment names, provider configuration, and verification behavior
must be implemented and tested together.

Better Auth uses `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`; Auth.js uses
`AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`. Credentials can be supplied through
CLI flags or JSON with `client_id` and `client_secret`. GitHub does not require
Google's authorized-origin concept, so only callback URLs are planned.
