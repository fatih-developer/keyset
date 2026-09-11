import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { SecretValue, setupProvider, inspectProject, validateProjectUrl, verifyRuntime } from "../dist/index.js";

function project() { const root = mkdtempSync(join(tmpdir(), "keyset-e2e-")); writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { dev: "next dev -p 3000" }, dependencies: { next: "x", "better-auth": "x" } })); writeFileSync(join(root, ".gitignore"), ".env.local\n"); writeFileSync(join(root, "auth.ts"), "export const auth = betterAuth({});\n"); return root; }

test("setup dry-run plans credentials without mutating files", () => {
  const root = project();
  const result = setupProvider({ provider: "google", projectRoot: root, clientId: "client-id", clientSecret: new SecretValue("secret-value"), dryRun: true }, { mutateSource: p => [{ path: join(p.root, "auth.ts"), changed: true, content: "changed" }], sourceConfigured: () => false });
  assert.equal(result.applied, false); assert.deepEqual(result.changedFiles, []); assert.equal(existsSync(join(root, ".env.local")), false); assert.equal(result.plan.redirectUris[0], "http://localhost:3000/api/auth/callback/google");
});

test("setup rolls back environment when source mutation fails", () => {
  const root = project(); writeFileSync(join(root, ".env.local"), "OTHER=value\n");
  const result = setupProvider({ provider: "google", projectRoot: root, clientId: "client-id", clientSecret: new SecretValue("secret-value") }, { mutateSource: () => { throw new Error("ambiguous source"); }, sourceConfigured: () => false });
  assert.equal(result.status, "failed"); assert.equal(result.rolledBack, true); assert.equal(readFileSync(join(root, ".env.local"), "utf8"), "OTHER=value\n");
});

test("validates URL forms and runs a bounded localhost runtime check", async () => {
  assert.equal(validateProjectUrl("https://example.com/").normalized, "https://example.com");
  assert.equal(validateProjectUrl("ftp://example.com").valid, false);
  assert.equal(validateProjectUrl("http://localhost:3000").valid, true);
  const root = resolve(process.cwd(), "../../examples/runtime-nextjs-authjs");
  const result = await verifyRuntime(inspectProject(root), { startupTimeoutMs: 30000, requestTimeoutMs: 1000, environment: { AUTH_GOOGLE_ID: "runtime-client", AUTH_GOOGLE_SECRET: "runtime-secret", AUTH_SECRET: "keyset-runtime-test-secret" } });
  assert.equal(result.checks[0].status, "pass"); assert.equal(result.started, true);
});
