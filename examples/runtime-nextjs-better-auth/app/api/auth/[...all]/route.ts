import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "../../../../src/lib/auth";

const handler = toNextJsHandler(auth);
async function redirectToGoogle(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID ?? "runtime-client", redirect_uri: `${url.origin}/api/auth/callback/google`, response_type: "code", scope: "openid email profile" });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
export async function GET(request: Request) {
  if (new URL(request.url).pathname.endsWith("/sign-in/social")) return redirectToGoogle(request);
  return handler.GET(request);
}
export async function POST(request: Request) {
  if (new URL(request.url).pathname.endsWith("/sign-in/social")) return redirectToGoogle(request);
  return handler.POST(request);
}
