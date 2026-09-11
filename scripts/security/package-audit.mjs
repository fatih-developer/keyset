#!/usr/bin/env node
import { readFile, readdir, mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawn } from "node:child_process";

const root = resolve(process.cwd());
const forbidden = /(^|\/)(?:\.env(?:\.|$)|credentials?\.|.*\.(?:pem|key|p12|pfx|log|bak|secret)$|fixtures?|snapshots?)(?:\/|$)/i;
const bundledNpm = join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
const npmCli = process.env.npm_execpath || bundledNpm;
const npmExecutable = process.platform === "win32" ? process.execPath : "npm";
const npmPrefix = process.platform === "win32" ? [npmCli] : [];
if (process.platform === "win32" && !existsSync(npmCli)) throw new Error(`npm CLI not found at ${npmCli}`);
const run = (cwd, args) => new Promise((ok, fail) => {
  const child = spawn(npmExecutable, [...npmPrefix, ...args], { cwd, shell: false, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let out = "";
  child.stdout.on("data", (b) => { out += b; });
  child.stderr.on("data", (b) => { out += b; });
  child.on("error", fail);
  child.on("close", (code) => code === 0 ? ok(out) : fail(new Error(out)));
});

function firstJsonValue(raw) {
  for (let start = 0; start < raw.length; start++) {
    if (raw[start] !== "[" && raw[start] !== "{") continue;
    const stack = []; let quote = ""; let escaped = false;
    for (let index = start; index < raw.length; index++) {
      const character = raw[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === quote) quote = "";
        continue;
      }
      if (character === '"') { quote = character; continue; }
      if (character === "[" || character === "{") stack.push(character);
      else if (character === "]" || character === "}") {
        const expected = character === "]" ? "[" : "{";
        if (stack.pop() !== expected) break;
        if (stack.length === 0) {
          try { return JSON.parse(raw.slice(start, index + 1)); }
          catch { break; }
        }
      }
    }
  }
  throw new Error("npm pack did not return JSON metadata");
}

const packageDirs = (await readdir(join(root, "packages"), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => join(root, "packages", entry.name));
const temp = await mkdtemp(join(tmpdir(), "keyset-pack-audit-"));
const failures = [];
try {
  for (const directory of packageDirs) {
    const manifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
    const raw = await run(directory, ["pack", "--json", "--dry-run", "--ignore-scripts"]);
    const packed = firstJsonValue(raw);
    const metadata = Array.isArray(packed) ? packed[0] : packed.files ? packed : Object.values(packed).find((value) => value?.files);
    if (!metadata) throw new Error(`${manifest.name}: npm pack metadata is missing`);
    const files = metadata.files.map((file) => file.path.replaceAll("\\", "/"));
    const bad = files.filter((file) => forbidden.test(file));
    if (bad.length) failures.push(`${manifest.name}: forbidden files ${bad.join(", ")}`);
    if (!files.includes("package.json")) failures.push(`${manifest.name}: package.json missing from tarball`);
    if (manifest.files && !files.some((file) => file.startsWith("dist/"))) failures.push(`${manifest.name}: declared build output is absent`);
    if (!manifest.private && (!manifest.license || !manifest.repository)) failures.push(`${manifest.name}: public package needs license and repository metadata`);
    if (!manifest.private && !files.some((file) => /^readme(?:\.md)?$/i.test(file))) failures.push(`${manifest.name}: public package README missing`);
    for (const target of [manifest.main, manifest.types, ...(manifest.bin ? Object.values(manifest.bin) : [])].filter(Boolean)) {
      if (!files.includes(target.replace(/^\.\//, ""))) failures.push(`${manifest.name}: manifest target ${target} missing from tarball`);
    }
    console.log(`${manifest.name}: ${files.length} packed files audited`);
  }
} finally { await rm(temp, { recursive: true, force: true }); }
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
