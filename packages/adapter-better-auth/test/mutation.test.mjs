import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hasGoogleProvider, mutateBetterAuth } from "../dist/index.js";

test("adds Google while preserving an existing Better Auth provider and is idempotent", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-better-")); const path = join(root, "auth.ts");
  writeFileSync(path, 'export const auth = betterAuth({ socialProviders: { github: { clientId: "x", clientSecret: "y" } } });\n');
  const project = { root, authAdapter: "better-auth" };
  const first = mutateBetterAuth(project); writeFileSync(path, first[0].content); const second = mutateBetterAuth(project);
  assert.equal(first[0].changed, true); assert.equal(second[0].changed, false); assert.match(first[0].content, /github/); assert.match(first[0].content, /google/);
});

test("adds GitHub alongside Google without duplication", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-better-github-")); const path = join(root, "auth.ts");
  writeFileSync(path, 'export const auth = betterAuth({ socialProviders: { google: {} } });\n');
  const project = { root, authAdapter: "better-auth" };
  const first = mutateBetterAuth(project, "github"); writeFileSync(path, first[0].content); const second = mutateBetterAuth(project, "github");
  assert.equal(first[0].changed, true); assert.equal(second[0].changed, false); assert.match(first[0].content, /GITHUB_CLIENT_SECRET/); assert.match(first[0].content, /google/);
});

test("detects and mutates a server auth module", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-better-server-"));
  mkdirSync(join(root, "lib", "auth"), { recursive: true });
  const path = join(root, "lib", "auth", "server.ts");
  writeFileSync(path, "export const auth = betterAuth({ socialProviders: { google: {} } });\n");
  const project = { root, authAdapter: "better-auth" };
  assert.equal(hasGoogleProvider(root), true);
  assert.equal(mutateBetterAuth(project)[0].changed, false);
});
