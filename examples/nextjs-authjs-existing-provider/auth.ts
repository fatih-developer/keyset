import GitHub from "next-auth/providers/github";
import NextAuth from "next-auth";
export const { handlers, auth } = NextAuth({ providers: [GitHub({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! })] });
