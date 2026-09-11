# Google OAuth

Keyset supports automated Google OAuth setup for Next.js projects using Better
Auth or Auth.js. It can create the Google Cloud Web client through a visible
Chrome session and safely apply the resulting credentials.

## Automated setup

```bash
keyset setup google --auto
```

Complete Google login, two-step verification, and Cloud project selection in
the opened browser. Keyset then completes the consent configuration, accepts
the required Google API Services User Data Policy on your behalf, creates the
Web client, writes the ignored `.env.local`, updates the auth source, and
verifies the result. If the Console UI cannot be completed, Chrome remains open
for inspection and no newly read credential is written.

## 1. Inspect and preview

```bash
keyset inspect
keyset setup google --dry-run
```

The plan shows authorized origins and callback URLs. For a local Next.js app,
the callback is:

```text
http://localhost:3000/api/auth/callback/google
```

The port follows the project’s detected local URL.

## 2. Create the client manually

In Google Cloud Console, create an OAuth client of type **Web application**.
Add every origin and redirect URI printed by the plan. Do not use an Installed
or Desktop client for this flow.

## 3. Apply credentials manually

Better Auth uses:

```dotenv
GOOGLE_CLIENT_ID=1234567890-example.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dummy-google-secret
```

Auth.js uses:

```dotenv
AUTH_GOOGLE_ID=1234567890-example.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=dummy-google-secret
```

These are dummy placeholders only. Store real values in `.env.local` or your
deployment secret store, and keep those files out of version control.

```bash
keyset setup google \
  --client-id "1234567890-example.apps.googleusercontent.com" \
  --client-secret "dummy-google-secret"
```

## 4. Verify

```bash
keyset doctor
keyset verify
keyset verify --runtime
```

Runtime verification checks that the auth route starts and that the Google
authorization redirect has the expected callback. It does not complete login.

For framework-specific source shapes, see [Better Auth](BETTER-AUTH.md) and
[Auth.js](AUTHJS.md). For redirect mismatch and boot errors, see
[Troubleshooting](TROUBLESHOOTING.md).
