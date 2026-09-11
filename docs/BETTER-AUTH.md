# Next.js + Better Auth

Keyset recognizes Better Auth projects and uses these Google environment names:

```dotenv
GOOGLE_CLIENT_ID=1234567890-example.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dummy-google-secret
```

The values are dummy placeholders. Never commit real credentials.

## Expected source shape

The adapter can work with a configuration containing `socialProviders`, for
example:

```ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

The active route must expose the Better Auth handler, commonly at
`/api/auth/[...all]`. Keep the route and auth configuration in the server-only
part of the application.

## Setup

From the Next.js project root:

```bash
keyset inspect
keyset setup google --dry-run
keyset setup google --client-id "1234567890-example.apps.googleusercontent.com" --client-secret "dummy-google-secret"
keyset verify --runtime
```

The validated runtime fixture uses Next.js 14.2.15 and Better Auth 1.2.0. See
[Compatibility](COMPATIBILITY.md) for the complete support boundary.
