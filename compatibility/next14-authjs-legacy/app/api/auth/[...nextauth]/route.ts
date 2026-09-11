import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";
const handler = NextAuth(authOptions);
export async function GET(request: Request) { const url = new URL(request.url); const params = new URLSearchParams({ client_id: process.env.AUTH_GOOGLE_ID ?? "runtime-client", redirect_uri: `${url.origin}/api/auth/callback/google`, response_type: "code", scope: "openid email profile" }); return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`); }
export const POST = handler;
