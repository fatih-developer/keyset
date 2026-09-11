import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { inspectProject, verifyProject, detectAuthRoute } from "../../packages/core/dist/index.js";

const root = resolve(import.meta.dirname, "../..");
const matrix = JSON.parse(readFileSync(resolve(root, "scripts/matrix/compatibility-matrix.json"), "utf8"));
const runRuntime = process.argv.includes("--runtime");
const entries = [];
for (const entry of matrix) {
  const project = inspectProject(resolve(root, entry.project));
  const packageJson = JSON.parse(readFileSync(resolve(project.root, "package.json"), "utf8"));
  const packageVersion = (name) => packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name];
  const metadataChecks = [
    { code: "matrix.framework", ok: project.authAdapter === entry.framework },
    { code: "matrix.next", ok: packageVersion("next") === entry.next },
    { code: "matrix.auth", ok: packageVersion(entry.framework === "better-auth" ? "better-auth" : "next-auth") === entry.auth },
    { code: "matrix.package_manager", ok: project.packageManager === entry.packageManager },
    { code: "matrix.router", ok: !entry.router || detectAuthRoute(project).router === entry.router }
  ];
  const verification = await verifyProject(project, { runtime: runRuntime });
  const staticChecks = verification.checks.filter(check => check.level === "static");
  const semanticChecks = verification.checks.filter(check => check.level === "semantic");
  const runtimeChecks = verification.checks.filter(check => check.level === "runtime");
  const staticResult = metadataChecks.every(check => check.ok) && (staticChecks.length === 0 || staticChecks.every(check => check.status === "pass"));
  const semanticResult = semanticChecks.length === 0 || semanticChecks.every(check => check.status === "pass");
  const runtimeResult = runRuntime ? (runtimeChecks.length > 0 && runtimeChecks.every(check => check.status === "pass")) : "not-run";
  entries.push({ ...entry, nextVersion: entry.next, authFramework: entry.framework, authVersion: entry.auth, nodeVersion: entry.node, packageManager: entry.packageManager, static: staticResult, semantic: semanticResult, runtime: runtimeResult, status: verification.status, checks: [...metadataChecks, ...verification.checks].map(check => ({ code: check.code, ok: check.ok, level: check.level, status: check.status })) });
}
const report = { generatedAt: new Date().toISOString(), entries };
mkdirSync(resolve(root, "scripts/matrix/artifacts"), { recursive: true });
writeFileSync(resolve(root, "scripts/matrix/artifacts/compatibility-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
