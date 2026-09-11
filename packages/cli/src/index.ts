#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { doctor, inspectProject, redact, setupProvider, SecretValue, verifyProject, verify, buildSetupPlan } from "@keyset/core";
import { createGoogleProvider, importGoogleCredentials, createGithubProvider, importGithubCredentials, planGithubSetup } from "@keyset/provider-google";
import { mutateBetterAuth, hasGoogleProvider, hasGithubProvider } from "@keyset/adapter-better-auth";
import { mutateAuthJs, hasGoogleProvider as hasAuthJsGoogle, hasGithubProvider as hasAuthJsGithub } from "@keyset/adapter-authjs";
import { createGoogleWebCredentials } from "@keyset/google-automation";
import { assertCompatibleVersions, installMcp, installSkill, keysetVersions, MCP_COMMAND } from "./distribution.js";

type Args = { command: string; provider?: string; client?: string; project: string; json: boolean; dryRun: boolean; verbose: boolean; runtime: boolean; auto: boolean; clientId?: string; clientSecret?: string; productionUrl?: string; credentials?: string; configPath?: string; home?: string };
function parse(argv: string[]): Args {
  const positional: string[] = []; const args: Args = { command: "help", project: process.cwd(), json: false, dryRun: false, verbose: false, runtime: false, auto: false };
  for (let i = 0; i < argv.length; i++) { const arg = argv[i]; if (arg === "--json") args.json = true; else if (arg === "--dry-run") args.dryRun = true; else if (arg === "--runtime") args.runtime = true; else if (arg === "--auto") args.auto = true; else if (arg === "--verbose") args.verbose = true; else if (arg === "--project") args.project = resolve(argv[++i] ?? process.cwd()); else if (arg === "--client-id") args.clientId = argv[++i]; else if (arg === "--client-secret") args.clientSecret = argv[++i]; else if (arg === "--production-url") args.productionUrl = argv[++i]; else if (arg === "--credentials") args.credentials = argv[++i]; else if (arg === "--config") args.configPath = argv[++i]; else if (arg === "--home") args.home = resolve(argv[++i] ?? process.cwd()); else if (arg === "--yes" || arg === "--non-interactive") continue; else positional.push(arg); }
  args.command = positional[0] ?? "help"; args.provider = positional[1]; args.client = positional[2]; return args;
}
async function run(args: Args): Promise<unknown> {
  if (args.command === "--version" || args.command === "version") return { ...keysetVersions(), compatibility: "ok" };
  if (args.command === "--help" || args.command === "help") return { usage: "keyset <command> [options]", commands: ["init", "inspect", "setup google|github", "doctor [provider]", "verify [provider]", "providers", "config", "mcp install <codex|claude>", "mcp serve", "skills install <codex|claude>"], options: ["--json", "--dry-run", "--auto", "--runtime", "--project <path>", "--config <path>", "--home <path>"] };
  if (args.provider === "--help" || args.provider === "help") {
    const usage = args.command === "setup" ? "keyset setup <google|github> [options]" : args.command === "doctor" ? "keyset doctor [google|github] [options]" : args.command === "verify" ? "keyset verify [google|github] [options]" : args.command === "mcp" ? "keyset mcp <install|serve> [options]" : undefined;
    if (usage) return { usage, options: ["--json", "--dry-run", "--runtime", "--project <path>"] };
  }
  if (args.command === "mcp") {
    if (args.provider === "install") { const client = args.client; if (client !== "codex" && client !== "claude") throw new Error("Usage: keyset mcp install <codex|claude>"); return installMcp(client, { dryRun: args.dryRun, configPath: args.configPath, home: args.home }); }
    if (args.provider === "serve") { const code = await new Promise<number>(resolveCode => { const child = spawn(MCP_COMMAND, [], { stdio: "inherit", shell: process.platform === "win32" }); child.once("error", () => resolveCode(1)); child.once("close", value => resolveCode(value ?? 1)); }); if (code !== 0) throw new Error(`MCP server exited with code ${code}`); return { command: MCP_COMMAND, versions: keysetVersions() }; }
    throw new Error("Usage: keyset mcp install <codex|claude> or keyset mcp serve");
  }
  if (args.command === "skills") {
    if (args.provider !== "install") throw new Error("Usage: keyset skills install <codex|claude>");
    const target = args.client;
    if (target !== "codex" && target !== "claude") throw new Error("Usage: keyset skills install <codex|claude>");
    return installSkill(target, { dryRun: args.dryRun, configPath: args.configPath, home: args.home });
  }
  if (args.command === "versions") { assertCompatibleVersions(); return { ...keysetVersions(), compatibility: "ok" }; }
  const project = inspectProject(args.project);
  switch (args.command) {
    case "inspect": return project;
    case "providers": return [{ id: "google", name: "Google OAuth", capability: "partial_automation", supported: true }, { id: "github", name: "GitHub OAuth", capability: "guided_setup", supported: true }];
    case "doctor": return args.provider === "github" ? { provider: "github", result: verify(project, "github"), findings: doctor(project) } : { ...(await verifyProject(project, { runtime: args.runtime })), findings: doctor(project) };
    case "verify": return args.provider === "github" ? verify(project, "github") : await verifyProject(project, { runtime: args.runtime });
    case "setup": {
      if (args.provider !== "google" && args.provider !== "github") throw new Error("Supported providers: google, github");
      const github = args.provider === "github";
      const dependencies = {
        importCredentials: github ? importGithubCredentials : importGoogleCredentials,
        mutateSource: (p: typeof project, _dryRun: boolean) => p.authAdapter === "better-auth" ? mutateBetterAuth(p, github ? "github" : "google") : mutateAuthJs(p, github ? "github" : "google"),
        sourceConfigured: (p: typeof project) => github ? (p.authAdapter === "better-auth" ? hasGithubProvider(p.root) : hasAuthJsGithub(p.root)) : (p.authAdapter === "better-auth" ? hasGoogleProvider(p.root) : hasAuthJsGoogle(p.root)),
        plan: github ? (p: typeof project, productionUrl?: string) => { const basic = planGithubSetup(productionUrl ? { ...p, productionUrl } : p); return { ...buildSetupPlan(p, productionUrl, "github"), actions: basic.actions }; } : undefined,
      };
      if (args.auto && github) throw new Error("--auto is currently available for Google only");
      if (args.auto && args.dryRun) throw new Error("--auto cannot be combined with --dry-run because it creates a Google Cloud OAuth client");
      if (args.auto && dependencies.sourceConfigured(project) && verify(project, "google").exitCode === 0) {
        return setupProvider({ provider: "google", projectRoot: project.root }, dependencies);
      }
      if (args.auto) {
        const generated = await createGoogleWebCredentials({ project, productionUrl: args.productionUrl, headless: false });
        args.clientId = generated.clientId;
        args.clientSecret = generated.clientSecret.reveal();
      }
      const rawCredentials = args.credentials && existsSync(resolve(args.credentials)) ? JSON.parse(readFileSync(resolve(args.credentials), "utf8")) : args.credentials;
      return setupProvider({ provider: args.provider, projectRoot: project.root, clientId: args.clientId, clientSecret: args.clientSecret ? new SecretValue(args.clientSecret) : undefined, credentials: rawCredentials, productionUrl: args.productionUrl, dryRun: args.dryRun }, dependencies);
    }
    case "init": { const directory = join(project.root, ".keyset"); const path = join(directory, "config.json"); const content = JSON.stringify({ version: 1, app: { name: project.root.split(/[\\/]/).pop() }, auth: { adapter: project.authAdapter } }, null, 2) + "\n"; if (existsSync(path)) { const existing = readFileSync(path, "utf8"); if (existing !== content) return { initialized: false, changed: false, path: directory, reason: "existing configuration preserved" }; return { initialized: true, changed: false, path: directory }; } if (!args.dryRun) { mkdirSync(directory, { recursive: true }); writeFileSync(path, content); } return { initialized: true, changed: true, dryRun: args.dryRun, path: directory }; }
    case "config": return { version: 1, project: project.root, authAdapter: project.authAdapter, keyset: keysetVersions() };
    default: return { commands: ["init", "inspect", "setup google|github", "doctor", "verify [provider]", "providers", "config", "mcp", "skills"] };
  }
}
async function promptHidden(label: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) return "";
  return await new Promise(resolvePrompt => { let value = ""; const onData = (chunk: Buffer) => { for (const char of chunk.toString()) { if (char === "\u0003") { cleanup(); resolvePrompt(""); return; } if (char === "\r" || char === "\n") { cleanup(); process.stdout.write("\n"); resolvePrompt(value); return; } if (char === "\u007f") { value = value.slice(0, -1); continue; } value += char; } }; const cleanup = () => { process.stdin.setRawMode?.(false); process.stdin.pause(); process.stdin.off("data", onData); }; process.stdout.write(label); process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.on("data", onData); });
}
export async function main(argv = process.argv.slice(2)): Promise<number> {
  const args = parse(argv);
  try { if (args.command === "setup" && args.provider === "google" && !args.auto && !args.clientId && !args.clientSecret && !args.credentials && !args.dryRun && process.stdin.isTTY) { args.clientId = await promptHidden("Client ID: "); args.clientSecret = await promptHidden("Client Secret: "); } const result = redact(await run(args)); if (args.json) console.log(JSON.stringify(result)); else console.log(format(args.command, result)); return args.command === "verify" && (result as any).status === "invalid" ? 1 : (result as any).status === "failed" ? 1 : (result as any).status === "requires_credentials" ? 2 : 0; }
  catch (error) { if (args.json) console.log(JSON.stringify({ error: error instanceof Error ? error.message : String(error) })); else console.error(`Error: ${error instanceof Error ? error.message : String(error)}`); return 2; }
}
function format(command: string, result: unknown): string { if (command === "--version" || command === "version" || command === "versions") { const r = result as any; return `Keyset CLI ${r.cli}\nMCP ${r.mcp}\nCore ${r.core}`; } if (command === "help") { const r = result as any; return `${r.usage}\n\nCommands:\n${(r.commands ?? []).map((item: string) => `  ${item}`).join("\n")}\n\nOptions:\n${(r.options ?? []).map((item: string) => `  ${item}`).join("\n")}`; } if ((result as any)?.usage && (result as any)?.options) return `${(result as any).usage}\n\nOptions:\n${(result as any).options.map((item: string) => `  ${item}`).join("\n")}`; if (command === "inspect") { const p = result as any; return `Project: ${p.framework ?? "Node.js"} + ${p.authAdapter}\nLocal URL: ${p.localUrl}\nPackage manager: ${p.packageManager}`; } if (command === "setup") { const r = result as any; const provider = r.plan?.provider === "github" ? "GitHub" : "Google"; if (r.status === "requires_credentials") return `${provider} OAuth guided setup\n\nAuthorized origins:\n- ${r.plan.authorizedOrigins.join("\n- ")}\n\nRedirect URIs:\n- ${r.plan.redirectUris.join("\n- ")}\n\nCredentials are required via --client-id/--client-secret or --credentials.`; if (r.status === "already_configured") return `${provider} OAuth is already configured.\n✓ verification passed`; if (r.status === "failed") return `Setup failed: ${r.error}${r.rolledBack ? "\nChanges were rolled back." : ""}`; return `${provider} OAuth configured successfully.\n\n✓ credentials configured\n✓ auth provider configured\n✓ verification passed\n${r.changedFiles.map((file: string) => `Changed: ${file}`).join("\n")}`; } return JSON.stringify(result, null, 2); }
if (process.argv[1] && (() => { try { return realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })()) main().then(code => { process.exitCode = code; });
