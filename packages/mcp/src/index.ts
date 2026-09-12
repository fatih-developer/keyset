#!/usr/bin/env node
import { doctor, inspectProject, planGoogleSetup, redact, setupProvider, SecretValue, verifyProject, verify, buildSetupPlan } from "@key-set/core";
import { createGoogleProvider, createGithubProvider, importGithubCredentials, planGithubSetup } from "@key-set/provider-google";
import { mutateBetterAuth, hasGoogleProvider, hasGithubProvider } from "@key-set/adapter-better-auth";
import { mutateAuthJs, hasGoogleProvider as hasAuthJsGoogle, hasGithubProvider as hasAuthJsGithub } from "@key-set/adapter-authjs";
import { createRequire } from "node:module";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
export const MCP_VERSION = "1.0.0";
function packageVersion(name: string): string { try { return String(require(`${name}/package.json`).version ?? "unknown"); } catch { return "unknown"; } }
export function serverInfo() { return { name: "keyset", version: MCP_VERSION, keyset: { cli: packageVersion("@key-set/cli"), mcp: MCP_VERSION, core: packageVersion("@key-set/core") } }; }
export function assertCompatibleVersions(): void {
  const versions = [MCP_VERSION, packageVersion("@key-set/core"), packageVersion("@key-set/cli")].filter(version => /^\d+\./.test(version));
  if (new Set(versions.map(version => version.split(".")[0])).size > 1) throw new Error(`Incompatible Keyset package versions: ${versions.join(", ")}`);
}
export const toolNames = ["inspect_project", "list_providers", "plan_provider_setup", "setup_provider", "import_credentials", "doctor", "verify_provider"] as const;
export async function handleTool(name: string, input: Record<string, unknown> = {}): Promise<unknown> {
  const project = String(input.project ?? process.cwd());
  const inspected = inspectProject(project);
  switch (name) {
    case "inspect_project": return inspected;
    case "list_providers": return [{ id: "google", name: "Google OAuth", capability: "guided_setup", supported: true }, { id: "github", name: "GitHub OAuth", capability: "guided_setup", supported: true }];
    case "plan_provider_setup": if (input.provider !== "google" && input.provider !== "github") throw new Error("Supported providers: google, github"); return input.provider === "github" ? planGithubSetup(inspected) : planGoogleSetup(inspected);
    case "setup_provider": { const provider = String(input.provider ?? "google"); if (provider !== "google" && provider !== "github") throw new Error("Supported providers: google, github"); const github = provider === "github"; return setupProvider({ provider, projectRoot: inspected.root, clientId: typeof input.clientId === "string" ? input.clientId : undefined, clientSecret: typeof input.clientSecret === "string" ? new SecretValue(input.clientSecret) : undefined, credentials: input.credentials, productionUrl: typeof input.productionUrl === "string" ? input.productionUrl : undefined, dryRun: input.dryRun === true }, { importCredentials: github ? importGithubCredentials : createGoogleProvider(inspected.root).importCredentials, mutateSource: p => p.authAdapter === "better-auth" ? mutateBetterAuth(p, github ? "github" : "google") : mutateAuthJs(p, github ? "github" : "google"), sourceConfigured: p => github ? (p.authAdapter === "better-auth" ? hasGithubProvider(p.root) : hasAuthJsGithub(p.root)) : (p.authAdapter === "better-auth" ? hasGoogleProvider(p.root) : hasAuthJsGoogle(p.root)), plan: github ? p => ({ ...buildSetupPlan(p, undefined, "github"), actions: planGithubSetup(p).actions }) : undefined }); }
    case "import_credentials": { const provider = String(input.provider ?? "google"); if (provider !== "google" && provider !== "github") throw new Error("Supported providers: google, github"); const value = input.credentials; if (!value) throw new Error("credentials are required"); const parsed = provider === "github" ? importGithubCredentials(value) : createGoogleProvider(inspected.root).importCredentials(value); return { valid: true, provider, fields: ["client_id", "client_secret"], redacted: [parsed.clientId.toString(), parsed.clientSecret.toString()] }; }
    case "doctor": return input.provider === "github" ? { provider: "github", result: verify(inspected, "github"), findings: doctor(inspected) } : { ...await verifyProject(inspected, { runtime: input.runtime === true }), findings: doctor(inspected) };
    case "verify_provider": return input.provider === "github" ? verify(inspected, "github") : await verifyProject(inspected, { runtime: input.runtime === true });
    default: throw new Error(`Unknown tool: ${name}`);
  }
}
export function mcpDescription() { return { server: serverInfo(), tools: toolNames.map(name => ({ name, mutating: name === "setup_provider" })) }; }
export async function startMcpServer(input = process.stdin, output = process.stdout): Promise<void> {
  assertCompatibleVersions();
  let buffer = "";
  input.setEncoding("utf8");
  for await (const chunk of input) { buffer += chunk; let index; while ((index = buffer.indexOf("\n")) >= 0) { const line = buffer.slice(0, index); buffer = buffer.slice(index + 1); if (!line.trim()) continue; try { const request = JSON.parse(line); Promise.resolve(request.method === "tools/list" ? mcpDescription() : request.method === "server/info" ? serverInfo() : handleTool(request.method, request.params)).then(result => output.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result: redact(result) }) + "\n")).catch(error => output.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32602, message: error instanceof Error ? error.message : String(error) } }) + "\n")); } catch (error) { output.write(JSON.stringify({ jsonrpc: "2.0", id: undefined, error: { code: -32602, message: error instanceof Error ? error.message : String(error) } }) + "\n"); } } }
}
if (process.argv[1] && (() => { try { return realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })()) startMcpServer();
