import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { dirname } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npmCli = process.env.npm_execpath ?? join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
const npmExecutable = process.platform === "win32" ? process.execPath : npm;
const npmPrefix = process.platform === "win32" ? [npmCli] : [];
const tempRoot = mkdtempSync(join(tmpdir(), "keyset-packed-"));
const tarballDir = join(tempRoot, "tarballs");
const projectDir = join(tempRoot, "project");
mkdirSync(tarballDir); mkdirSync(projectDir);
const names = ["core", "sdk", "provider-google", "adapter-better-auth", "adapter-authjs", "google-automation", "mcp", "cli"];
const tarballs = {};
for (const name of names) {
  const dir = join(root, "packages", name);
  const filename = execFileSync(npmExecutable, [...npmPrefix, "pack", "--pack-destination", tarballDir, "--silent"], { cwd: dir, encoding: "utf8", shell: false }).trim().split(/\r?\n/).at(-1);
  assert(filename);
  tarballs[JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name] = join(tarballDir, filename);
}
writeFileSync(join(projectDir, "package.json"), `${JSON.stringify({ name: "keyset-packed-smoke", private: true, type: "module", dependencies: tarballs }, null, 2)}\n`);
execFileSync(npmExecutable, [...npmPrefix, "install", "--ignore-scripts", "--no-audit", "--no-fund", "--silent"], { cwd: projectDir, stdio: "inherit", shell: false });
const bin = name => process.platform === "win32" ? process.execPath : join(projectDir, "node_modules", ".bin", name);
const binArgs = name => process.platform === "win32" ? [join(projectDir, "node_modules", "@keyset", name === "keyset" ? "cli" : "mcp", "dist", "index.js")] : [];
const run = (name, args, input) => execFileSync(bin(name), [...binArgs(name), ...args], { cwd: projectDir, input, encoding: "utf8", shell: false });
assert.match(run("keyset", ["--version"]), /Keyset CLI 1\.0\.0/);
assert.match(run("keyset", ["--help"]), /keyset <command>/);
assert.match(run("keyset", ["providers"]), /Google OAuth/);
assert.match(run("keyset", ["inspect"]), /Package manager: npm/);
assert.match(run("keyset", ["setup", "google", "--dry-run"]), /Google OAuth (guided setup|configured successfully)/);
assert.match(run("keyset", ["init"]), /initialized/);
const response = JSON.parse(run("keyset-mcp", [], '{"jsonrpc":"2.0","id":1,"method":"server/info"}\n').trim());
assert.equal(response.result.name, "keyset");
assert.equal(response.result.keyset.mcp, "1.0.0");
console.log(JSON.stringify({ platform: process.platform, node: process.version, cli: "passed", mcp: "passed" }));
