# Next.js + Auth.js

Keyset recognizes Auth.js projects and uses these Google environment names:

```dotenv
AUTH_GOOGLE_ID=1234567890-example.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=dummy-google-secret
```

These values are documentation-only placeholders. Keep real values in ignored
environment files or a deployment secret store.

## Expected source shape

An App Router configuration commonly looks like this:

```ts
import Google from "next-auth/providers/google";
import NextAuth from "next-auth";

export const { handlers, auth } = NextAuth({
  providers: [Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  })],
});
```

Export the handlers from the active auth route, commonly
`/app/api/auth/[...nextauth]/route.ts`. Pages Router projects must expose the
equivalent NextAuth route.

## Setup

```bash
keyset inspect
keyset setup google --dry-run
keyset setup google --client-id "1234567890-example.apps.googleusercontent.com" --client-secret "dummy-google-secret"
keyset verify --runtime
```

The validated runtime fixture uses Next.js 14.2.15 and `next-auth` 4.24.11.
See [Compatibility](COMPATIBILITY.md) before relying on another version.
