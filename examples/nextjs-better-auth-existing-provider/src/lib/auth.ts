import { betterAuth } from "better-auth";
export const auth = betterAuth({ socialProviders: { github: { clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! } } });
