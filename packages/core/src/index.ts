import { existsSync, readFileSync, realpathSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";

export type Capability = "full_automation" | "partial_automation" | "guided_setup";
export type Severity = "info" | "warning" | "error" | "critical";
export type AuthAdapterId = "better-auth" | "authjs" | "unknown";

export class SecretValue {
  readonly #value: string;
  constructor(value: string) { this.#value = value; }
  reveal(): string { return this.#value; }
  toString(): string { return "[REDACTED]"; }
  toJSON(): string { return "[REDACTED]"; }
}

export function redact(value: unknown): unknown {
  if (value instanceof SecretValue) return "[REDACTED]";
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key, /secret|token|password|privatekey/i.test(key) ? "[REDACTED]" : redact(item),
    ]));
  }
  return value;
}

export interface Evidence { source: string; detail: string; confidence: "high" | "medium" | "low"; }
export interface Detection<T> { value?: T; evidence: Evidence[]; }
export interface ProjectInspection {
  root: string; packageManager: "npm" | "pnpm" | "yarn" | "bun" | "unknown";
  framework?: "nextjs"; authAdapter: AuthAdapterId; developmentCommand?: string;
  localUrl: string; productionUrl?: string; envFiles: string[]; gitignorePresent: boolean;
  evidence: Evidence[];
}
export interface CallbackUrls { origin: string; redirectUri: string; }
export interface SetupPlan { provider: string; capability: Capability; callbacks: CallbackUrls[]; envKeys: string[]; actions: Action[]; }
export interface Action { id: string; kind: "automatic" | "manual"; title: string; description: string; targetUrl?: string; }
export interface Finding { code: string; severity: Severity; title: string; evidence: string; remediation: string; autoFixAvailable: boolean; }
export interface VerificationCheck { code: string; ok: boolean; message: string; id?: string; level?: "static" | "semantic" | "runtime"; status?: "pass" | "warn" | "fail" | "skipped"; remediation?: string; }
export interface VerificationResult { provider: string; status: "verified" | "failed" | "invalid" | "manual_required"; checks: VerificationCheck[]; exitCode: 0 | 1 | 2 | 3; }
export type SetupStatus = "already_configured" | "requires_credentials" | "requires_source_mutation" | "ready_to_apply" | "unsupported";
export interface SetupPlanDetails extends SetupPlan { framework: AuthAdapterId; environmentFile: string; developmentOrigin: string; productionOrigin?: string; authorizedOrigins: string[]; redirectUris: string[]; requiredEnvironmentVariables: string[]; sourceMutations: string[]; status: SetupStatus; }
export interface SourceMutation { path: string; changed: boolean; content: string; }
export interface SetupOptions { projectRoot: string; clientId?: string; clientSecret?: SecretValue; credentials?: unknown; productionUrl?: string; dryRun?: boolean; environmentFile?: string; }
export interface SetupProviderDependencies { importCredentials?: (input: unknown) => { clientId: SecretValue; clientSecret: SecretValue }; mutateSource: (project: ProjectInspection, dryRun: boolean) => SourceMutation[]; sourceConfigured: (project: ProjectInspection) => boolean; plan?: (project: ProjectInspection, productionUrl?: string) => SetupPlanDetails; }
export interface SetupResult { status: SetupStatus | "failed"; project: ProjectInspection; plan: SetupPlanDetails; applied: boolean; verification?: VerificationResult; changedFiles: string[]; rolledBack: boolean; error?: string; }
export interface RuntimeVerificationOptions { runtime?: boolean; startupTimeoutMs?: number; requestTimeoutMs?: number; maxRedirects?: number; installDependencies?: boolean; environment?: Record<string, string>; }
export interface RuntimeCommand { executable: string; args: string[]; packageManager: ProjectInspection["packageManager"]; }
export interface RedirectInspection { ok: boolean; endpoint: boolean; clientId: boolean; redirectUri: boolean; responseType: boolean; scopes: boolean; url?: string; redactedUrl?: string; message: string; }
export interface RedirectChainResult { ok: boolean; redirects: string[]; finalUrl?: string; reason?: string; loop?: boolean; }
export interface LayeredVerification { provider: "google"; framework: AuthAdapterId; checks: VerificationCheck[]; status: "healthy" | "warning" | "invalid"; runtime?: { started: boolean; url?: string; route?: string; reason?: string; redirect?: RedirectInspection; chain?: RedirectChainResult }; }

const packageManagers: Array<[string, ProjectInspection["packageManager"]]> = [["pnpm-lock.yaml", "pnpm"], ["yarn.lock", "yarn"], ["bun.lockb", "bun"], ["bun.lock", "bun"], ["package-lock.json", "npm"]];
function readJson(path: string): Record<string, any> | undefined { try { return JSON.parse(readFileSync(path, "utf8")); } catch { return undefined; } }
function dep(pkg: Record<string, any>, name: string): boolean { return Boolean(pkg.dependencies?.[name] || pkg.devDependencies?.[name] || pkg.peerDependencies?.[name]); }

export function inspectProject(inputPath = process.cwd()): ProjectInspection {
  const root = realpathSync(resolve(inputPath));
  const packagePath = join(root, "package.json");
  const pkg = readJson(packagePath) ?? {};
  const evidence: Evidence[] = [];
  const lockfiles = packageManagers.filter(([file]) => existsSync(join(root, file)));
  const manager = lockfiles.length === 1 ? lockfiles[0][1] : lockfiles.length > 1 ? "unknown" : "unknown";
  if (lockfiles.length > 1) evidence.push({ source: "lockfiles", detail: "multiple package-manager lockfiles found; execution is intentionally disabled", confidence: "high" });
  else if (manager !== "unknown") evidence.push({ source: lockfiles[0][0], detail: `package manager detected: ${manager}`, confidence: "high" });
  if (existsSync(packagePath)) evidence.push({ source: "package.json", detail: "package manifest found", confidence: "high" });
  const next = dep(pkg, "next");
  const better = dep(pkg, "better-auth");
  const authjs = dep(pkg, "next-auth") || dep(pkg, "@auth/core");
  if (next) evidence.push({ source: "package.json", detail: "Next.js dependency found", confidence: "high" });
  const authAdapter: AuthAdapterId = better ? "better-auth" : authjs ? "authjs" : "unknown";
  if (authAdapter !== "unknown") evidence.push({ source: "package.json", detail: `${authAdapter} dependency found`, confidence: "high" });
  const devScript = typeof pkg.scripts?.dev === "string" ? pkg.scripts.dev : undefined;
  const port = devScript?.match(/(?:--port|-p)\s*(\d+)/)?.[1] ?? "3000";
  const url = `http://localhost:${port}`;
  const envFiles = [".env", ".env.local", ".env.development", ".env.production", ".env.example"].filter(file => existsSync(join(root, file)));
  const envProduction = envFiles.find(file => file === ".env.production"); const keysetConfig = readJson(join(root, ".keyset", "config.json"));
  const productionUrl = envProduction ? readEnv(join(root, envProduction)).get("NEXTAUTH_URL") || readEnv(join(root, envProduction)).get("BETTER_AUTH_URL") : keysetConfig?.providers?.google?.productionUrl;
  return { root, packageManager: manager, framework: next ? "nextjs" : undefined, authAdapter, developmentCommand: devScript, localUrl: url, productionUrl, envFiles, gitignorePresent: existsSync(join(root, ".gitignore")), evidence };
}

export function callbackUrls(baseUrl: string, adapter: AuthAdapterId, provider = "google"): CallbackUrls {
  const origin = baseUrl.replace(/\/$/, "");
  const path = `/api/auth/callback/${provider}`;
  return { origin, redirectUri: `${origin}${path}` };
}

export function resolveProjectCommand(project: ProjectInspection, script = "dev", extraArgs: string[] = []): RuntimeCommand | undefined {
  if (project.packageManager === "unknown") return undefined;
  const executable = process.platform === "win32" && project.packageManager !== "bun" ? `${project.packageManager}.cmd` : project.packageManager;
  const prefix = project.packageManager === "pnpm" ? ["--ignore-workspace"] : [];
  return { executable, packageManager: project.packageManager, args: [...prefix, "run", script, "--", ...extraArgs] };
}

const sensitiveQueryKeys = /^(state|nonce|code|authorization|authorization_code|code_challenge|code_verifier|client_secret|access_token|id_token|refresh_token)$/i;
export function redactUrl(value: string): string {
  try { const url = new URL(value); for (const key of [...url.searchParams.keys()]) if (sensitiveQueryKeys.test(key)) url.searchParams.set(key, "[REDACTED]"); return url.toString(); } catch { return "[REDACTED]"; }
}

export function inspectAuthorizationRedirect(value: string, expectedRedirectUri: string, expectedClientId?: string, provider = "google"): RedirectInspection {
  try {
    const url = new URL(value); const responseType = url.searchParams.get("response_type"); const redirectUri = url.searchParams.get("redirect_uri"); const clientId = url.searchParams.get("client_id");
    const endpoint = provider === "github" ? url.protocol === "https:" && url.hostname === "github.com" && url.pathname === "/login/oauth/authorize" : url.protocol === "https:" && url.hostname === "accounts.google.com" && /^\/o\/oauth2(?:\/v2)?\/auth$/.test(url.pathname);
    const scopes = provider === "github" || ((url.searchParams.get("scope") ?? "").split(/[ +]/).filter(Boolean).includes("openid") && (url.searchParams.get("scope") ?? "").split(/[ +]/).filter(Boolean).some(scope => ["email", "profile"].includes(scope)));
    const validResponseType = provider === "github" ? (!responseType || responseType === "code") : responseType === "code";
    const result = { ok: endpoint && Boolean(clientId) && (!expectedClientId || clientId === expectedClientId) && redirectUri === expectedRedirectUri && validResponseType && scopes, endpoint, clientId: Boolean(clientId) && (!expectedClientId || clientId === expectedClientId), redirectUri: redirectUri === expectedRedirectUri, responseType: validResponseType, scopes, url: redactUrl(value), redactedUrl: redactUrl(value), message: "" };
    result.message = result.ok ? `${provider === "github" ? "GitHub" : "Google"} authorization redirect is valid.` : `${provider === "github" ? "GitHub" : "Google"} authorization redirect is malformed or does not match the expected callback.`; return result;
  } catch { return { ok: false, endpoint: false, clientId: false, redirectUri: false, responseType: false, scopes: false, redactedUrl: "[REDACTED]", message: "Google authorization redirect is not a valid URL." }; }
}

export function validateProjectUrl(value: string): { valid: boolean; normalized?: string; warning?: string; message?: string } {
  try { const parsed = new URL(value); if (!/^https?:$/.test(parsed.protocol)) return { valid: false, message: "URL must use http or https." }; if (!parsed.hostname) return { valid: false, message: "URL must include a hostname." }; parsed.pathname = parsed.pathname.replace(/\/+/g, "/").replace(/\/$/, ""); const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"; return { valid: true, normalized: parsed.toString().replace(/\/$/, ""), warning: parsed.protocol === "http:" && !local ? "Production origin is not HTTPS." : undefined }; } catch { return { valid: false, message: "Invalid URL." }; }
}

export function detectAuthRoute(project: ProjectInspection): { path?: string; router?: "app" | "pages"; confidence: "high" | "low" } {
  const candidates = project.authAdapter === "authjs" ? [{ path: "app/api/auth/[...nextauth]/route.ts", router: "app" as const }, { path: "pages/api/auth/[...nextauth].ts", router: "pages" as const }] : [{ path: "app/api/auth/[...all]/route.ts", router: "app" as const }, { path: "app/api/auth/[...auth]/route.ts", router: "app" as const }];
  const found = candidates.find(candidate => existsSync(join(project.root, candidate.path))); return found ? { ...found, confidence: "high" } : { confidence: "low" };
}

async function fetchWithTimeout(url: string, timeoutMs: number, init?: RequestInit): Promise<Response> { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs); try { return await fetch(url, { ...init, redirect: "manual", signal: controller.signal }); } finally { clearTimeout(timer); } }
function runCommand(command: RuntimeCommand, cwd: string, timeoutMs: number): Promise<{ code: number; output: string }> { return new Promise(resolve => { let child: import("node:child_process").ChildProcess; try { child = spawn(command.executable, command.args, { cwd, stdio: ["ignore", "pipe", "pipe"], windowsHide: true }); } catch (error) { resolve({ code: 1, output: error instanceof Error ? error.message : String(error) }); return; } let output = ""; const capture = (chunk: Buffer) => { output = `${output}${chunk.toString()}`.replace(/(secret|token|password|client_secret|authorization\s*code)\s*[:=]\s*[^\s]+/gi, "$1=[REDACTED]").slice(-4000); }; child.stdout?.on("data", capture); child.stderr?.on("data", capture); const timer = setTimeout(() => { terminateChildProcess(child); resolve({ code: 124, output: "command timed out" }); }, timeoutMs); child.once("close", code => { clearTimeout(timer); resolve({ code: code ?? 1, output }); }); child.once("error", error => { clearTimeout(timer); resolve({ code: 1, output: error.message }); }); }); }
export function terminateChildProcess(child: import("node:child_process").ChildProcess): void { if (process.platform === "win32" && child.pid) { try { execFileSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" }); } catch { /* process may already be gone */ } } try { child.kill(); } catch { /* process may already be gone */ } }
export async function inspectRedirectChain(startUrl: string, expectedRedirectUri: string, expectedClientId?: string, options: { maxRedirects?: number; requestTimeoutMs?: number; provider?: string } = {}): Promise<RedirectChainResult & { inspection?: RedirectInspection }> {
  const maxRedirects = Math.max(0, Math.min(options.maxRedirects ?? 5, 10)); const redirects: string[] = []; const visited = new Set<string>(); let current = startUrl;
  for (let count = 0; count <= maxRedirects; count++) {
    if (visited.has(current)) return { ok: false, redirects, finalUrl: redactUrl(current), loop: true, reason: "redirect loop detected" }; visited.add(current);
    const inspection = inspectAuthorizationRedirect(current, expectedRedirectUri, expectedClientId, options.provider);
    if (inspection.endpoint) return { ok: inspection.ok, redirects, finalUrl: inspection.redactedUrl, inspection, reason: inspection.ok ? undefined : inspection.message };
    if (count === maxRedirects) return { ok: false, redirects, finalUrl: redactUrl(current), reason: "maximum redirect count exceeded" };
    let response: Response; try { response = await fetchWithTimeout(current, options.requestTimeoutMs ?? 5000); } catch { return { ok: false, redirects, finalUrl: redactUrl(current), reason: "redirect request failed" }; }
    const location = response.headers.get("location"); if (![301, 302, 303, 307, 308].includes(response.status) || !location) return { ok: false, redirects, finalUrl: redactUrl(current), reason: `expected redirect, received HTTP ${response.status}` };
    current = new URL(location, current).toString(); redirects.push(redactUrl(current));
  }
  return { ok: false, redirects, finalUrl: redactUrl(current), reason: "maximum redirect count exceeded" };
}

export async function verifyRuntime(project: ProjectInspection, options: RuntimeVerificationOptions = {}, provider = "google"): Promise<{ checks: VerificationCheck[]; started: boolean; url?: string; route?: string; reason?: string; redirect?: RedirectInspection; chain?: RedirectChainResult }> {
  const route = detectAuthRoute(project); if (!route.path) return { checks: [{ code: "runtime.project_boot", id: "runtime.project_boot", level: "runtime", status: "skipped", ok: false, message: "Auth route could not be determined safely.", remediation: "Add the framework's active auth route, then retry runtime verification." }], started: false, reason: "auth route unknown" };
  const port = String(43000 + (process.pid % 1000)); const requestBase = `http://localhost:${port}`; const expected = `${requestBase}/api/auth/callback/${provider}`; const authPath = project.authAdapter === "better-auth" ? "/api/auth/sign-in/social" : `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(expected)}`; const url = `${requestBase}${authPath}`; const startupTimeout = options.startupTimeoutMs ?? 30_000; const requestTimeout = options.requestTimeoutMs ?? 10_000;
  const command = resolveProjectCommand(project, "dev", ["--port", port]); const script = project.developmentCommand?.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map(item => item.replace(/^['"]|['"]$/g, "")) ?? ["next", "dev"]; const nextEntry = join(project.root, "node_modules", "next", "dist", "bin", "next");
  if (options.installDependencies !== false && !existsSync(join(project.root, "node_modules"))) { if (!command) return { checks: [{ code: "runtime.project_boot", id: "runtime.project_boot", level: "runtime", status: "fail", ok: false, message: "Dependencies cannot be installed because the package manager is ambiguous or missing.", remediation: "Keep exactly one supported lockfile in the project." }], started: false, reason: "package manager unknown" }; const install = await runCommand({ ...command, args: ["install"] }, project.root, Math.max(startupTimeout, 120_000)); if (install.code !== 0) return { checks: [{ code: "runtime.project_boot", id: "runtime.project_boot", level: "runtime", status: "fail", ok: false, message: "Project dependency installation failed.", remediation: install.output || "Run the selected package-manager install command manually." }], started: false, reason: install.output || "dependency installation failed" }; }
  const directNext = script[0] === "next" && existsSync(nextEntry); const executable = directNext ? process.execPath : command?.executable ?? (script[0] === "node" ? process.execPath : process.platform === "win32" && script[0] !== "bun" ? `${script[0]}.cmd` : script[0]); const childArgs = directNext ? [nextEntry, ...script.slice(1), "--port", port] : command?.args ?? script.slice(1);
  const windowsCommand = process.platform === "win32" && command ? [executable, ...childArgs].map(value => /[\s"]/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value).join(" ") : undefined;
  const runtimeEnvironment = { ...process.env, ...options.environment, PORT: port, NEXTAUTH_URL: options.environment?.NEXTAUTH_URL ?? requestBase, AUTH_URL: options.environment?.AUTH_URL ?? requestBase, BETTER_AUTH_URL: options.environment?.BETTER_AUTH_URL ?? requestBase };
  const child = spawn(process.platform === "win32" && windowsCommand ? (process.env.ComSpec ?? "cmd.exe") : executable, process.platform === "win32" && windowsCommand ? ["/d", "/s", "/c", windowsCommand] : childArgs, { cwd: project.root, env: runtimeEnvironment, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let logs = ""; const capture = (chunk: Buffer) => { logs = `${logs}${chunk.toString()}`.replace(/(secret|token|password|client_secret|authorization\s*code)\s*[:=]\s*[^\s]+/gi, "$1=[REDACTED]").slice(-4000); }; child.stdout.on("data", capture); child.stderr.on("data", capture);
  const started = Date.now(); let response: Response | undefined; const requestInit = project.authAdapter === "better-auth" ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: "google" }) } : undefined; try { while (Date.now() - started < startupTimeout) { if (child.exitCode !== null) break; try { response = await fetchWithTimeout(url, Math.min(1000, requestTimeout), requestInit); break; } catch { await new Promise(resolve => setTimeout(resolve, 150)); } } if (!response) return { checks: [{ code: "runtime.project_boot", id: "runtime.project_boot", level: "runtime", status: "fail", ok: false, message: `Project did not become reachable within ${startupTimeout}ms.`, remediation: "Fix the framework boot error before checking the auth route." }], started: false, url, route: route.path, reason: logs || "startup timeout" }; const checks: VerificationCheck[] = [{ code: "runtime.project_boot", id: "runtime.project_boot", level: "runtime", status: "pass", ok: true, message: "The real framework project became reachable.", remediation: undefined }]; const valid = [200, 302, 303, 307, 308].includes(response.status); checks.push({ code: "runtime.auth_route", id: "runtime.auth_route", level: "runtime", status: valid ? "pass" : "fail", ok: valid, message: `Auth route responded with HTTP ${response.status}.`, remediation: valid ? undefined : "Check the active auth route and application startup logs." }); const location = response.headers.get("location"); if (!location) { checks.push({ code: "runtime.google_config", id: "runtime.google_config", level: "runtime", status: "fail", ok: false, message: "Auth route did not return a Google authorization redirect.", remediation: "Check Google provider configuration and credentials." }); return { checks, started: true, url, route: route.path, reason: logs || "missing location" }; } const chain = await inspectRedirectChain(new URL(location, url).toString(), expected, options.environment?.GOOGLE_CLIENT_ID ?? options.environment?.AUTH_GOOGLE_ID, { maxRedirects: options.maxRedirects, requestTimeoutMs: requestTimeout }); const inspection = chain.inspection; checks.push({ code: "runtime.google_config", id: "runtime.google_config", level: "runtime", status: chain.ok ? "pass" : "fail", ok: chain.ok, message: chain.ok ? "Google authorization redirect is valid." : chain.reason ?? "Google authorization redirect is invalid.", remediation: chain.ok ? undefined : "Check the Google provider client and callback configuration." }); return { checks, started: true, url, route: route.path, reason: chain.reason, redirect: inspection, chain }; } finally { terminateChildProcess(child); child.stdout?.destroy(); child.stderr?.destroy(); } }

export async function verifyProject(project: ProjectInspection, options: RuntimeVerificationOptions = {}): Promise<LayeredVerification> {
  const route = detectAuthRoute(project); const checks: VerificationCheck[] = [];
  const add = (check: VerificationCheck) => checks.push({ ...check, id: check.id ?? check.code, status: check.status ?? (check.ok ? "pass" : "fail") });
  add({ code: "project.detected", level: "static", ok: Boolean(project.framework), message: project.framework ? "Next.js framework detected." : "Supported Next.js framework not detected.", remediation: "Use a Next.js project." });
  add({ code: "auth.provider_configured", level: "static", ok: project.authAdapter !== "unknown", message: project.authAdapter === "unknown" ? "Better Auth/Auth.js was not detected." : `${project.authAdapter} detected.` });
  const envKeys = project.authAdapter === "authjs" ? ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] : ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]; const env = new Map<string, string>(); for (const file of project.envFiles.filter(file => file !== ".env.example")) for (const [key, value] of readEnv(join(project.root, file))) env.set(key, value);
  add({ code: "google.client_id", level: "static", ok: Boolean(env.get(envKeys[0])?.trim()), message: env.get(envKeys[0])?.trim() ? `${envKeys[0]} is configured.` : `${envKeys[0]} is missing or empty.`, remediation: `Set ${envKeys[0]} in an ignored local env file.` });
  add({ code: "google.client_secret", level: "static", ok: Boolean(env.get(envKeys[1])?.trim()), message: env.get(envKeys[1])?.trim() ? `${envKeys[1]} is configured.` : `${envKeys[1]} is missing or empty.`, remediation: `Set ${envKeys[1]} in an ignored local env file.` });
  const sourceCandidates = project.authAdapter === "authjs" ? ["auth.ts", "auth.tsx", "src/auth.ts", "pages/api/auth/[...nextauth].ts", "app/api/auth/[...nextauth]/route.ts"] : ["src/lib/auth.ts", "src/lib/auth.tsx", "src/lib/auth/server.ts", "lib/auth.ts", "lib/auth/server.ts", "auth.ts"];
  const sourcePath = sourceCandidates.map(file => join(project.root, file)).find(existsSync); const source = sourcePath ? readFileSync(sourcePath, "utf8") : "";
  add({ code: "google.source_configured", level: "static", ok: /google/i.test(source), message: /google/i.test(source) ? "Google provider is configured in auth source." : "Google provider is missing from auth source.", remediation: "Add the Google provider through `keyset setup google`." });
  const routeSource = route.path ? readFileSync(join(project.root, route.path), "utf8") : "";
  add({ code: "auth.callback_route", level: "semantic", ok: Boolean(route.path), message: route.path ? `Auth route detected: ${route.path}` : "Auth callback route is missing or unknown.", remediation: "Add an active framework auth route." });
  add({ code: "auth.route_wiring", level: "semantic", ok: Boolean(route.path && (routeSource.includes("auth") || routeSource.includes("handlers"))), message: route.path && (routeSource.includes("auth") || routeSource.includes("handlers")) ? "Auth route references an auth handler." : "Auth route is not visibly wired to the auth configuration.", remediation: "Export the detected auth handler from the active route." });
  const production = project.productionUrl ? validateProjectUrl(project.productionUrl) : undefined; if (production && !production.valid) add({ code: "project.production_url_invalid", level: "semantic", ok: false, message: production.message ?? "Production URL is invalid.", remediation: "Use https://example.com or a localhost http URL." }); else if (production?.warning) add({ code: "project.insecure_production_origin", level: "semantic", ok: true, status: "warn", message: production.warning });
  const base = callbackUrls(project.localUrl, project.authAdapter); add({ code: "google.redirect_uri", level: "semantic", ok: base.redirectUri.endsWith("/api/auth/callback/google"), message: `Expected redirect URI: ${base.redirectUri}` });
  if (options.runtime) { const runtime = await verifyRuntime(project, options); checks.push(...runtime.checks); const failed = checks.some(check => check.status === "fail"); return { provider: "google", framework: project.authAdapter, checks, status: failed ? "invalid" : checks.some(check => check.status === "warn") ? "warning" : "healthy", runtime: { started: runtime.started, url: runtime.url, route: runtime.route, reason: runtime.reason } }; }
  const failed = checks.some(check => check.status === "fail"); return { provider: "google", framework: project.authAdapter, checks, status: failed ? "invalid" : checks.some(check => check.status === "warn") ? "warning" : "healthy" };
}

export function readEnv(path: string): Map<string, string> {
  const result = new Map<string, string>();
  if (!existsSync(path)) return result;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) result.set(match[1], match[2].replace(/^(["'])(.*)\1$/, "$2"));
  }
  return result;
}

function isSecretEnvIgnored(root: string, file: string): boolean {
  const ignorePath = join(root, ".gitignore");
  if (!existsSync(ignorePath)) return false;
  const rules = readFileSync(ignorePath, "utf8").split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#"));
  return rules.some(rule => {
    const normalized = rule.replace(/^\//, "").replace(/\/$/, "");
    if (normalized === ".env" || normalized === ".env.local" || normalized === ".env.*.local") return normalized === file || (normalized === ".env.*.local" && /^\.env\..+\.local$/.test(file));
    return normalized === file;
  });
}

export function updateEnvFile(root: string, fileName: string, values: Record<string, string | SecretValue>, dryRun = false): { changed: boolean; diff: string } {
  const path = assertProjectPath(root, fileName);
  if (fileName === ".env.example") throw new Error("Real credentials cannot be written to .env.example");
  const before = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = before ? before.split(/\r?\n/) : [];
  const keys = new Set(Object.keys(values));
  const seen = new Set<string>();
  const output = lines.map(line => {
    const match = line.match(/^(\s*(?:export\s+)?)([A-Za-z_][A-Za-z0-9_]*)(\s*=).*$/);
    if (!match || !keys.has(match[2])) return line;
    if (seen.has(match[2])) return undefined;
    seen.add(match[2]); const value = values[match[2]]; return `${match[1]}${match[2]}${match[3]}${value instanceof SecretValue ? value.reveal() : value}`;
  }).filter((line): line is string => line !== undefined);
  for (const [key, value] of Object.entries(values)) if (!seen.has(key)) output.push(`${key}=${value instanceof SecretValue ? value.reveal() : value}`);
  const after = output.join("\n");
  const diff = Object.keys(values).map(key => `${key}=<redacted>`).join("\n");
  if (!dryRun && before !== after) { mkdirSync(join(path, ".."), { recursive: true }); const temp = `${path}.tmp-${process.pid}`; writeFileSync(temp, after, "utf8"); renameSync(temp, path); }
  return { changed: before !== after, diff };
}

export function assertProjectPath(root: string, candidate: string): string {
  const base = realpathSync(resolve(root)); const target = resolve(base, candidate);
  if (relative(base, target).startsWith("..") || relative(base, target).includes(`..${requireSeparator()}`)) throw new Error("Path must remain inside project root");
  return target;
}
function requireSeparator(): string { return process.platform === "win32" ? "\\" : "/"; }

export function planGoogleSetup(project: ProjectInspection): SetupPlan {
  const callbacks = [callbackUrls(project.localUrl, project.authAdapter)];
  if (project.productionUrl) callbacks.push(callbackUrls(project.productionUrl, project.authAdapter));
  const envKeys = project.authAdapter === "authjs" ? ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] : ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
  return { provider: "google", capability: "guided_setup", callbacks, envKeys, actions: [{ id: "google-console", kind: "manual", title: "Create Google OAuth client", description: "Create a Web application OAuth client and add the listed origins and redirect URIs.", targetUrl: "https://console.cloud.google.com/apis/credentials" }] };
}

export function buildSetupPlan(project: ProjectInspection, productionUrl?: string, provider = "google"): SetupPlanDetails {
  const effective = productionUrl ? { ...project, productionUrl: productionUrl.replace(/\/$/, "") } : project;
  const origins = [effective.localUrl, ...(effective.productionUrl ? [effective.productionUrl] : [])]; const callbacks = origins.map(origin => callbackUrls(origin, effective.authAdapter, provider)); const envKeys = provider === "github" ? (project.authAdapter === "authjs" ? ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"] : ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"]) : (project.authAdapter === "authjs" ? ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] : ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]); const basic: SetupPlan = { provider, capability: "guided_setup", callbacks, envKeys, actions: [{ id: `${provider}-console`, kind: "manual", title: `Create ${provider} OAuth client`, description: `Create the ${provider} OAuth client and add the listed origins and redirect URIs.` }] };
  const environmentFile = ".env.local";
  const sourceMutations = project.authAdapter === "unknown" ? [] : [`configure ${provider} provider in detected auth source`];
  return { ...basic, framework: project.authAdapter, environmentFile, developmentOrigin: basic.callbacks[0].origin, productionOrigin: basic.callbacks[1]?.origin, authorizedOrigins: basic.callbacks.map(item => item.origin), redirectUris: basic.callbacks.map(item => item.redirectUri), requiredEnvironmentVariables: basic.envKeys, sourceMutations, status: project.authAdapter === "unknown" || project.framework !== "nextjs" ? "unsupported" : "ready_to_apply" };
}

export function setupProvider(options: SetupOptions & { provider: string }, dependencies: SetupProviderDependencies): SetupResult {
  const project = inspectProject(options.projectRoot);
  const plan = dependencies.plan ? dependencies.plan(project, options.productionUrl) : buildSetupPlan(project, options.productionUrl, options.provider);
  const supplied = options.clientId && options.clientSecret ? { clientId: new SecretValue(options.clientId), clientSecret: options.clientSecret } : options.credentials && dependencies.importCredentials ? dependencies.importCredentials(options.credentials) : undefined;
  if (plan.status === "unsupported") return { status: "unsupported", project, plan, applied: false, changedFiles: [], rolledBack: false, error: "Only Next.js projects with Better Auth or Auth.js are supported." };
  if (dependencies.sourceConfigured(project) && verify(project, options.provider).exitCode === 0) return { status: "already_configured", project, plan: { ...plan, status: "already_configured" }, applied: false, changedFiles: [], rolledBack: false, verification: verify(project, options.provider) };
  if (!supplied) return { status: "requires_credentials", project, plan: { ...plan, status: "requires_credentials" }, applied: false, changedFiles: [], rolledBack: false };
  const envFile = options.environmentFile ?? plan.environmentFile;
  const envPath = assertProjectPath(project.root, envFile);
  const backups = new Map<string, string | undefined>(); const changedFiles: string[] = [];
  try {
    if (existsSync(envPath)) backups.set(envPath, readFileSync(envPath, "utf8")); else backups.set(envPath, undefined);
    const envResult = updateEnvFile(project.root, envFile, { [plan.requiredEnvironmentVariables[0]]: supplied.clientId, [plan.requiredEnvironmentVariables[1]]: supplied.clientSecret }, Boolean(options.dryRun));
    if (envResult.changed && !options.dryRun) changedFiles.push(envPath);
    const mutations = dependencies.mutateSource(project, Boolean(options.dryRun));
    for (const mutation of mutations) { if (!backups.has(mutation.path)) backups.set(mutation.path, existsSync(mutation.path) ? readFileSync(mutation.path, "utf8") : undefined); if (mutation.changed && !options.dryRun) { writeFileSync(mutation.path, mutation.content, "utf8"); changedFiles.push(mutation.path); } }
    const after = inspectProject(project.root); const verification = verify(after, options.provider);
    if (verification.exitCode !== 0 && !options.dryRun) throw new Error("Verification failed after setup");
    return { status: options.dryRun ? "ready_to_apply" : "ready_to_apply", project: after, plan, applied: !options.dryRun, verification, changedFiles, rolledBack: false };
  } catch (error) {
    if (!options.dryRun) for (const [path, content] of backups) { try { if (content === undefined) { if (existsSync(path)) unlinkSync(path); } else writeFileSync(path, content, "utf8"); } catch { /* report below */ } }
    return { status: "failed", project, plan, applied: false, changedFiles: [], rolledBack: !options.dryRun, error: error instanceof Error ? error.message : String(error) };
  }
}

export function doctor(project: ProjectInspection): Finding[] {
  const findings: Finding[] = [];
  if (project.authAdapter === "unknown") findings.push({ code: "AUTH_ADAPTER_NOT_DETECTED", severity: "error", title: "Auth library not detected", evidence: "No supported auth dependency found in package.json.", remediation: "Install Better Auth or Auth.js, then run inspect again.", autoFixAvailable: false });
  if (!project.productionUrl) findings.push({ code: "PRODUCTION_URL_MISSING", severity: "warning", title: "Production URL is missing", evidence: "No supported production URL was found.", remediation: "Set BETTER_AUTH_URL or NEXTAUTH_URL in .env.production.", autoFixAvailable: false });
  if (!project.gitignorePresent) findings.push({ code: "GITIGNORE_MISSING", severity: "warning", title: ".gitignore is missing", evidence: "No .gitignore found at the project root.", remediation: "Add a .gitignore and exclude secret environment files.", autoFixAvailable: false });
  if (project.envFiles.some(file => file !== ".env.example" && !isSecretEnvIgnored(project.root, file))) findings.push({ code: "SECRET_ENV_NOT_IGNORED", severity: "error", title: "Secret environment file is not ignored", evidence: "A credential-bearing environment file is present but is not covered by .gitignore.", remediation: "Add the affected environment file or a matching pattern to .gitignore, then remove it from version control if it was committed.", autoFixAvailable: false });
  const keys = project.authAdapter === "authjs" ? ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] : ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
  const env = new Map<string, string>(); for (const file of project.envFiles.filter(file => file !== ".env.example")) for (const [key, value] of readEnv(join(project.root, file))) env.set(key, value);
  if (!env.get(keys[0])) findings.push({ code: "GOOGLE_CLIENT_ID_MISSING", severity: "error", title: "Google client ID is missing", evidence: `${keys[0]} was not found in detected env files.`, remediation: `Set ${keys[0]} in an ignored secret env file.`, autoFixAvailable: false });
  if (!env.get(keys[1])) findings.push({ code: "GOOGLE_CLIENT_SECRET_MISSING", severity: "error", title: "Google client secret is missing", evidence: `${keys[1]} was not found in detected env files.`, remediation: `Set ${keys[1]} in an ignored secret env file.`, autoFixAvailable: false });
  return findings;
}

export function verify(project: ProjectInspection, provider = "google"): VerificationResult {
  const prefix = provider === "github" ? "GITHUB" : "GOOGLE"; const keys = project.authAdapter === "authjs" ? [`AUTH_${prefix}_ID`, `AUTH_${prefix}_SECRET`] : [`${prefix}_CLIENT_ID`, `${prefix}_CLIENT_SECRET`];
  const env = new Map<string, string>(); for (const file of project.envFiles.filter(file => file !== ".env.example")) for (const [key, value] of readEnv(join(project.root, file))) env.set(key, value);
  const checks: VerificationCheck[] = [{ code: "PROJECT_DETECTED", ok: Boolean(project.framework), message: project.framework ? "Next.js project detected" : "Supported framework not detected" }, { code: "AUTH_ADAPTER", ok: project.authAdapter !== "unknown", message: project.authAdapter === "unknown" ? "Auth adapter is missing" : `${project.authAdapter} detected` }, { code: `${prefix}_CLIENT_ID`, ok: Boolean(env.get(keys[0])), message: env.get(keys[0]) ? `${keys[0]} is configured` : `${keys[0]} is missing` }, { code: `${prefix}_CLIENT_SECRET`, ok: Boolean(env.get(keys[1])), message: env.get(keys[1]) ? `${keys[1]} is configured` : `${keys[1]} is missing` }];
  const ok = checks.every(check => check.ok);
  return { provider, status: ok ? "verified" : "invalid", checks, exitCode: ok ? 0 : 2 };
}
