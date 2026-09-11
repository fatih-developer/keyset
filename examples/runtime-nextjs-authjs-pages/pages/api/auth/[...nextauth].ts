import NextAuth from "next-auth";
import { authOptions } from "../../../auth";

const nextAuthHandler = NextAuth(authOptions);
export default function handler(req: any, res: any) {
  if (req.query?.nextauth?.[0] === "signin" && req.query?.nextauth?.[1] === "google") {
    const params = new URLSearchParams({ client_id: process.env.AUTH_GOOGLE_ID ?? "runtime-client", redirect_uri: `http://localhost:${process.env.PORT ?? "3000"}/api/auth/callback/google`, response_type: "code", scope: "openid email profile" });
    res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
    return;
  }
  return nextAuthHandler(req, res);
}
