import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
export const CLI_VERSION = "1.0.0";
export const MCP_COMMAND = "keyset-mcp";

export type McpClient = "codex" | "claude";
export type DistributionOptions = { dryRun?: boolean; configPath?: string; home?: string };

function packageVersion(name: string): string {
  try { return String(require(`${name}/package.json`).version ?? "unknown"); } catch { return "unknown"; }
}

export function keysetVersions() {
  return { cli: CLI_VERSION, mcp: packageVersion("@key-set/mcp"), core: packageVersion("@key-set/core") };
}

export function assertCompatibleVersions(versions = keysetVersions()): void {
  const known = [versions.cli, versions.mcp, versions.core].filter(version => /^\d+\./.test(version));
  const major = new Set(known.map(version => version.split(".")[0]));
  if (major.size > 1) throw new Error(`Incompatible Keyset package versions: ${known.join(", ")}`);
}

export function configPath(client: McpClient, options: DistributionOptions = {}): string {
  if (options.configPath) return resolve(options.configPath);
  const home = options.home ?? homedir();
  if (client === "codex") return join(home, ".codex", "config.toml");
  return join(home, ".claude.json");
}

function tomlString(value: string): string { return JSON.stringify(value); }

function parseSupportedToml(input: string): Set<string> {
  const sections = new Set<string>();
  let section = "";
  for (const [index, raw] of input.split(/\r?\n/).entries()) {
    const line = raw.replace(/\s+#.*$/, "").trim();
    if (line.startsWith("#")) continue;
    if (!line) continue;
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) { section = sectionMatch[1]; sections.add(section); continue; }
    if (!/^([A-Za-z0-9_.-]+)\s*=\s*("(?:[^"\\]|\\.)*"|\[.*\]|true|false|-?\d+(?:\.\d+)?)$/.test(line)) {
      throw new Error(`Unsupported or invalid Codex TOML at line ${index + 1}`);
    }
  }
  return sections;
}

function backupPath(path: string): string {
  let candidate = `${path}.bak`;
  let index = 1;
  while (existsSync(candidate)) candidate = `${path}.bak.${index++}`;
  return candidate;
}

function writeSafely(path: string, content: string, dryRun: boolean): { changed: boolean; backup?: string } {
  if (existsSync(path) && readFileSync(path, "utf8") === content) return { changed: false };
  if (dryRun) return { changed: true };
  mkdirSync(dirname(path), { recursive: true });
  const backup = existsSync(path) ? backupPath(path) : undefined;
  if (backup) copyFileSync(path, backup);
  const temporary = `${path}.keyset-${process.pid}-${Date.now()}.tmp`;
  writeFileSync(temporary, content, "utf8");
  try { renameSync(temporary, path); } catch (error) { try { require("node:fs").unlinkSync(temporary); } catch {} throw error; }
  return { changed: true, backup };
}

function codexConfig(path: string): { content: string; changed: boolean; conflict?: string } {
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  const sections = current ? parseSupportedToml(current) : new Set<string>();
  const section = "mcp_servers.keyset";
  if (sections.has(section)) {
    const match = current.match(new RegExp(`\\[${section.replace(".", "\\.")}\\]([\\s\\S]*?)(?=\\n\\[|$)`));
    if (match && /command\s*=\s*"keyset-mcp"/.test(match[1]) && /args\s*=\s*\[\s*\]/.test(match[1])) return { content: current, changed: false };
    return { content: current, changed: false, conflict: "Codex already has a different [mcp_servers.keyset] entry" };
  }
  const suffix = current && !current.endsWith("\n") ? "\n" : "";
  return { content: `${current}${suffix}\n[mcp_servers.keyset]\ncommand = ${tomlString(MCP_COMMAND)}\nargs = []\n`, changed: true };
}

function claudeConfig(path: string): { content: string; changed: boolean; conflict?: string } {
  let value: Record<string, unknown> = {};
  if (existsSync(path)) {
    try { value = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>; } catch { throw new Error("Unsupported or invalid Claude MCP JSON configuration"); }
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error("Unsupported Claude MCP configuration format");
  }
  const servers = value.mcpServers;
  if (servers !== undefined && (!servers || Array.isArray(servers) || typeof servers !== "object")) throw new Error("Unsupported Claude MCP configuration format: mcpServers must be an object");
  const mcpServers = (servers as Record<string, unknown> | undefined) ?? {};
  const desired = { command: MCP_COMMAND, args: [] };
  if (mcpServers.keyset) {
    if (JSON.stringify(mcpServers.keyset) === JSON.stringify(desired)) return { content: JSON.stringify(value, null, 2) + "\n", changed: false };
    return { content: "", changed: false, conflict: "Claude already has a different keyset MCP entry" };
  }
  value.mcpServers = { ...mcpServers, keyset: desired };
  return { content: JSON.stringify(value, null, 2) + "\n", changed: true };
}

export function installMcp(client: McpClient, options: DistributionOptions = {}) {
  if (client !== "codex" && client !== "claude") throw new Error(`Unsupported MCP client: ${client}`);
  const path = configPath(client, options);
  const generated = client === "codex" ? codexConfig(path) : claudeConfig(path);
  if (generated.conflict) throw new Error(generated.conflict);
  const result = writeSafely(path, generated.content, options.dryRun === true);
  return { client, path, changed: generated.changed && result.changed, dryRun: options.dryRun === true, backup: result.backup };
}

const skillText = `# Keyset Setup Skill\n\nUse Keyset to inspect and plan provider setup before mutation. Call setup_provider for changes, never duplicate provider logic, keep secrets out of chat and output, and run verify_provider afterward. Report manual provider-console actions separately.\n`;

export function installSkill(target: "codex" | "claude", options: DistributionOptions = {}) {
  const base = options.configPath ? resolve(options.configPath) : join(options.home ?? homedir(), target === "codex" ? ".codex" : ".claude", "skills", "keyset");
  const path = options.configPath && base.endsWith(".md") ? base : join(base, "SKILL.md");
  const existing = existsSync(path) ? readFileSync(path, "utf8") : undefined;
  if (existing !== undefined && existing !== skillText) throw new Error(`Refusing to overwrite existing ${target} Keyset skill`);
  const result = existing === skillText ? { changed: false } : writeSafely(path, skillText, options.dryRun === true);
  return { target, path, changed: result.changed, dryRun: options.dryRun === true, platform: platform() };
}
