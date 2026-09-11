import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "keyset-runtime-test-secret-keyset-runtime-test-secret",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: memoryAdapter(),
  socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } },
});
