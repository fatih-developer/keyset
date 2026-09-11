import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { realpathSync } from "node:fs";
import { callbackUrls, type ProjectInspection, type SourceMutation } from "@keyset/core";

export const betterAuthCallbackPath = "/api/auth/callback/google";
export const githubCallbackPath = "/api/auth/callback/github";
export function detectBetterAuth(project: ProjectInspection): boolean { return project.authAdapter === "better-auth"; }
export function googleConfig(project: ProjectInspection) { const callback = callbackUrls(project.localUrl, "better-auth"); return { provider: "google", callback, env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const }; }
export function githubConfig(project: ProjectInspection) { const origin = project.localUrl.replace(/\/$/, ""); return { provider: "github", callback: { origin, redirectUri: `${origin}${githubCallbackPath}` }, env: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"] as const }; }
export function hasGoogleProvider(projectRoot: string): boolean {
  for (const file of ["auth.ts", "auth.tsx", "lib/auth.ts", "src/lib/auth.ts", "lib/auth/server.ts", "src/lib/auth/server.ts", "lib/auth.js", "src/lib/auth.js", "lib/auth/server.js", "src/lib/auth/server.js"]) { const path = join(projectRoot, file); if (existsSync(path) && /google/i.test(readFileSync(path, "utf8"))) return true; }
  return false;
}
export function hasGithubProvider(projectRoot: string): boolean { return ["auth.ts", "auth.tsx", "lib/auth.ts", "src/lib/auth.ts", "lib/auth/server.ts", "src/lib/auth/server.ts", "lib/auth.js", "src/lib/auth.js", "lib/auth/server.js", "src/lib/auth/server.js"].some(file => { const path = join(projectRoot, file); return existsSync(path) && /github/i.test(readFileSync(path, "utf8")); }); }

const candidates = ["src/lib/auth.ts", "src/lib/auth.tsx", "src/lib/auth/server.ts", "lib/auth.ts", "lib/auth/server.ts", "auth.ts", "lib/auth.js", "lib/auth/server.js"];
function safeCandidate(root: string, file: string): string {
  const base = realpathSync(resolve(root));
  const path = join(base, file);
  let parent = join(path, "..");
  while (!existsSync(parent) && resolve(parent) !== base) parent = join(parent, "..");
  parent = realpathSync(parent);
  if (relative(base, parent).startsWith("..")) throw new Error("Auth configuration path escapes project root");
  return path;
}
function matchingClose(source: string, open: number, left: string, right: string): number { let depth = 0; let quote = ""; for (let i = open; i < source.length; i++) { const c = source[i]; if (quote) { if (c === quote && source[i - 1] !== "\\") quote = ""; continue; } if (c === "\"" || c === "'" || c === "`") { quote = c; continue; } if (c === left) depth++; else if (c === right && --depth === 0) return i; } return -1; }
export function mutateBetterAuth(project: ProjectInspection, providerOrDryRun: "google" | "github" | boolean = "google"): SourceMutation[] {
  const provider = typeof providerOrDryRun === "string" ? providerOrDryRun : "google";
  const path = candidates.map(file => safeCandidate(project.root, file)).find(existsSync); if (!path) throw new Error("Better Auth configuration file was not found");
  const source = readFileSync(path, "utf8"); if ((source.match(/socialProviders\s*:/g) ?? []).length > 1) throw new Error("Ambiguous Better Auth socialProviders configuration");
  if (new RegExp(`socialProviders\\s*:[\\s\\S]{0,500}${provider}\\s*:`,'i').test(source) || new RegExp(`socialProviders\\s*:[\\s\\S]{0,500}${provider}\\s*\\(`,'i').test(source)) return [{ path, changed: false, content: source }];
  const env = provider === "github" ? ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"] : ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
  let index = source.search(/socialProviders\s*:/); let insertAt: number; let insertion: string;
  if (index >= 0) { const open = source.indexOf("{", index); const close = matchingClose(source, open, "{", "}"); if (open < 0 || close < 0) throw new Error("Ambiguous Better Auth socialProviders configuration"); insertAt = open + 1; insertion = `\n    ${provider}: { clientId: process.env.${env[0]}!, clientSecret: process.env.${env[1]}! },`; }
  else { index = source.search(/betterAuth\s*\(/); const open = source.indexOf("{", index); if (index < 0 || open < 0) throw new Error("Ambiguous Better Auth configuration"); insertAt = open + 1; insertion = `\n  socialProviders: { ${provider}: { clientId: process.env.${env[0]}!, clientSecret: process.env.${env[1]}! } },`; }
  const content = source.slice(0, insertAt) + insertion + source.slice(insertAt); return [{ path, changed: true, content }];
}
