import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { realpathSync } from "node:fs";
import { callbackUrls, type ProjectInspection, type SourceMutation } from "@key-set/core";

export const authJsCallbackPath = "/api/auth/callback/google";
export const githubCallbackPath = "/api/auth/callback/github";
export function detectAuthJs(project: ProjectInspection): boolean { return project.authAdapter === "authjs"; }
export function googleConfig(project: ProjectInspection) { const callback = callbackUrls(project.localUrl, "authjs"); return { provider: "google", callback, env: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] as const }; }
export function githubConfig(project: ProjectInspection) { const origin = project.localUrl.replace(/\/$/, ""); return { provider: "github", callback: { origin, redirectUri: `${origin}${githubCallbackPath}` }, env: ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"] as const }; }
export function hasGoogleProvider(projectRoot: string): boolean {
  for (const file of ["auth.ts", "auth.tsx", "pages/api/auth/[...nextauth].ts", "app/api/auth/[...nextauth]/route.ts"]) { const path = join(projectRoot, file); if (existsSync(path) && /Google/i.test(readFileSync(path, "utf8"))) return true; }
  return false;
}
export function hasGithubProvider(projectRoot: string): boolean { return ["auth.ts", "auth.tsx", "src/auth.ts", "pages/api/auth/[...nextauth].ts", "app/api/auth/[...nextauth]/route.ts"].some(file => { const path = join(projectRoot, file); return existsSync(path) && /GitHub|github/i.test(readFileSync(path, "utf8")); }); }

const candidates = ["auth.ts", "auth.tsx", "src/auth.ts", "pages/api/auth/[...nextauth].ts", "app/api/auth/[...nextauth]/route.ts"];
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
export function mutateAuthJs(project: ProjectInspection, providerOrDryRun: "google" | "github" | boolean = "google"): SourceMutation[] {
  const provider = typeof providerOrDryRun === "string" ? providerOrDryRun : "google";
  const path = candidates.map(file => safeCandidate(project.root, file)).find(existsSync); if (!path) throw new Error("Auth.js configuration file was not found");
  const source = readFileSync(path, "utf8"); const providers = [...source.matchAll(/providers\s*:/g)]; if (providers.length > 1) throw new Error("Ambiguous Auth.js providers configuration");
  const name = provider === "github" ? "GitHub" : "Google"; const env = provider === "github" ? ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"] : ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"]; const already = new RegExp(`(?:${name}\\s*\\(|${name}Provider\\s*\\(|id\\s*:\s*["']${provider}["'])`).test(source); if (already) return [{ path, changed: false, content: source }];
  if (providers.length !== 1) throw new Error("Auth.js providers array was not found");
  const index = providers[0].index ?? -1; const open = source.indexOf("[", index); const close = matchingClose(source, open, "[", "]"); if (open < 0 || close < 0) throw new Error("Ambiguous Auth.js providers array");
  const importPath = `next-auth/providers/${provider}`; const importLine = source.includes(importPath) ? "" : `import ${name} from \"${importPath}\";\n`;
  const item = `\n    ${name}({ clientId: process.env.${env[0]}!, clientSecret: process.env.${env[1]}! }),`;
  const content = importLine + source.slice(0, open + 1) + item + source.slice(open + 1); return [{ path, changed: true, content }];
}
