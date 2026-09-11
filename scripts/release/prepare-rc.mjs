import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { dirname } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(process.argv[2] ?? join(root, "release-artifacts"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const npmCli = process.env.npm_execpath ?? join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
const npmExecutable = process.platform === "win32" ? process.execPath : npm;
const npmPrefix = process.platform === "win32" ? [npmCli] : [];
mkdirSync(output, { recursive: true });
const artifacts = [];
for (const name of readdirSync(join(root, "packages"))) {
  const directory = join(root, "packages", name);
  const manifestPath = join(directory, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.private) continue;
  const filename = execFileSync(npmExecutable, [...npmPrefix, "pack", "--pack-destination", output, "--silent"], { cwd: directory, encoding: "utf8", shell: false }).trim().split(/\r?\n/).at(-1);
  const path = join(output, filename);
  const sha256 = createHash("sha256").update(readFileSync(path)).digest("hex");
  artifacts.push({ name: manifest.name, version: manifest.version, file: filename, sha256 });
}
const report = { format: "keyset-release-candidate", version: "1.0.0", generatedAt: new Date().toISOString(), artifacts };
writeFileSync(join(output, "manifest.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
