import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectProject, SecretValue, redact, updateEnvFile, verify, verifyProject, doctor } from "../dist/index.js";

test("inspects Next.js Better Auth project and infers port", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { dev: "next dev -p 4100" }, dependencies: { next: "x", "better-auth": "x" } }));
  const result = inspectProject(root);
  assert.equal(result.framework, "nextjs"); assert.equal(result.authAdapter, "better-auth"); assert.equal(result.localUrl, "http://localhost:4100");
});

test("redacts secret wrappers and deduplicates env keys", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-")); mkdirSync(join(root, ".keyset"));
  const secret = new SecretValue("do-not-print");
  assert.equal(JSON.stringify({ secret }), '{"secret":"[REDACTED]"}');
  const result = updateEnvFile(root, ".env.local", { GOOGLE_CLIENT_SECRET: secret, GOOGLE_CLIENT_ID: "id" });
  assert.equal(result.diff.includes("do-not-print"), false);
  updateEnvFile(root, ".env.local", { GOOGLE_CLIENT_SECRET: secret });
  assert.equal(readFileSync(join(root, ".env.local"), "utf8").split("GOOGLE_CLIENT_SECRET").length - 1, 1);
  assert.equal(redact({ token: secret }).token, "[REDACTED]");
});

test("does not treat .env.example as a configured credential file", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-env-example-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: { next: "x", "better-auth": "x" } }));
  writeFileSync(join(root, ".env.example"), "GOOGLE_CLIENT_ID=example\nGOOGLE_CLIENT_SECRET=example\n");
  const project = inspectProject(root);
  assert.equal(verify(project).status, "invalid");
  assert.ok(doctor(project).some(finding => finding.code === "GOOGLE_CLIENT_ID_MISSING"));
});

test("reports present secret env files that are not ignored", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-env-ignore-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: { next: "x", "better-auth": "x" } }));
  writeFileSync(join(root, ".env.local"), "GOOGLE_CLIENT_ID=id\nGOOGLE_CLIENT_SECRET=secret\n");
  const project = inspectProject(root);
  assert.ok(doctor(project).some(finding => finding.code === "SECRET_ENV_NOT_IGNORED"));
});

test("verifies Google in a Better Auth server module", async () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-server-auth-"));
  mkdirSync(join(root, "lib", "auth"), { recursive: true });
  mkdirSync(join(root, "app", "api", "auth", "[...all]"), { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: { next: "x", "better-auth": "x" } }));
  writeFileSync(join(root, ".env.local"), "GOOGLE_CLIENT_ID=id\nGOOGLE_CLIENT_SECRET=secret\n");
  writeFileSync(join(root, "lib", "auth", "server.ts"), "export const auth = betterAuth({ socialProviders: { google: {} } });\n");
  writeFileSync(join(root, "app", "api", "auth", "[...all]", "route.ts"), "export const { GET, POST } = auth.handler;\n");
  const result = await verifyProject(inspectProject(root));
  assert.equal(result.checks.find(check => check.code === "google.source_configured")?.ok, true);
  assert.equal(result.status, "healthy");
});
