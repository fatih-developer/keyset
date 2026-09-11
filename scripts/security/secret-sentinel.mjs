#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_SENTINELS = [
  ["KEYSET", "AUDIT_SENTINEL", "2026", "09", "10"].join("_"),
  ["KEYSET", "FAKE_OAUTH_SECRET", "7f3a", "AUDIT"].join("_"),
  ["KEYSET", "FAKE_REFRESH_TOKEN", "9c2d", "AUDIT"].join("_"),
  ["KEYSET", "FAKE_PRIVATE_KEY", "4b1e", "AUDIT"].join("_"),
];

const SKIP = new Set([".git", "node_modules", "dist", "screenshots", "coverage"]);
const TEXT_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".ts", ".json", ".md", ".yml", ".yaml", ".txt", ".env", ".toml", ".ini", ".ps1", ".sh"]);

export function findSentinels(text, sentinels = DEFAULT_SENTINELS) {
  return sentinels.filter((sentinel) => text.includes(sentinel));
}

async function filesUnder(root, directory = root) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !SKIP.has(entry.name)) result.push(...await filesUnder(root, join(directory, entry.name)));
    if (entry.isFile() && (TEXT_EXTENSIONS.has(entry.name.includes(".") ? `.${entry.name.split(".").pop()}` : "") || entry.name === ".gitignore")) result.push(join(directory, entry.name));
  }
  return result;
}

export async function scanRepository(root, sentinels = DEFAULT_SENTINELS) {
  const findings = [];
  for (const file of await filesUnder(root)) {
    const text = await readFile(file, "utf8");
    const matches = findSentinels(text, sentinels);
    for (const match of matches) findings.push({ file: relative(root, file), sentinel: match });
  }
  return findings;
}

export function runCommand(command, args = [], { cwd = process.cwd(), sentinels = DEFAULT_SENTINELS, timeoutMs = 30_000, maxOutputBytes = 256 * 1024 } = {}) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, args, { cwd, shell: false, windowsHide: true, env: { ...process.env, ...Object.fromEntries(sentinels.map((value) => [`KEYSET_SENTINEL_${value}`, value])) } });
    let output = "";
    const collect = (chunk) => { output += chunk.toString("utf8").slice(0, Math.max(0, maxOutputBytes - output.length)); };
    child.stdout.on("data", collect); child.stderr.on("data", collect);
    const timer = setTimeout(() => { child.kill(); reject(new Error(`sentinel command timed out after ${timeoutMs}ms`)); }, timeoutMs);
    child.on("error", reject);
    child.on("close", (code, signal) => { clearTimeout(timer); const leaked = findSentinels(output, sentinels); resolveResult({ code, signal, output, leaked }); });
  });
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const root = resolve(process.cwd());
  const findings = await scanRepository(root);
  if (findings.length) { console.error("Secret sentinel found in repository content:", findings); process.exitCode = 1; }
  else console.log("Secret sentinel scan passed.");
}
